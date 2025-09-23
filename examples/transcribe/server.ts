import { createExpressWSXServer } from '@wsx-sh/express';
import type { WSXConnection, WSXStreamMessage } from '@wsx-sh/core';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const DEEPGRAM_REALTIME_URL =
  process.env.DEEPGRAM_URL ??
  'wss://api.deepgram.com/v1/listen?model=nova-2&language=en-US&punctuate=true&smart_format=true';

const wsx = createExpressWSXServer({
  websocketPath: '/transcribe-ws',
  onConnection: (connection) => {
    console.log(`Transcribe connection established: ${connection.id}`);
    wsx.sendJsonToConnection(connection.id, 'transcribe:status', {
      state: 'connected',
      message: 'Realtime bridge ready. Click start to begin streaming.'
    });
  },
  onDisconnection: (connection) => {
    console.log(`Transcribe connection closed: ${connection.id}`);
    teardownDeepgramSession(connection, 'client-disconnected');
  }
});

const app = wsx.getApp();
app.use(express.static(publicDir));

app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const PORT = Number(process.env.PORT || 3001);
const server = app.listen(PORT, () => {
  console.log(`WSX Transcribe example running at http://localhost:${PORT}`);
});

// Handle WebSocket upgrades
server.on('upgrade', (request, socket, head) => {
  // Get the adapter from the WSX server and handle the upgrade
  const adapter = (wsx as any).getAdapter();
  if (adapter && typeof adapter.handleUpgrade === 'function') {
    adapter.handleUpgrade(request, socket, head);
  }
});

type TranscribeSession = {
  deepgram?: WebSocket;
  isStreaming?: boolean;
};

function getSession(connection: WSXConnection): TranscribeSession {
  if (!connection.sessionData?.transcribe) {
    connection.sessionData!.transcribe = {};
  }
  return connection.sessionData!.transcribe as TranscribeSession;
}

async function ensureDeepgramSession(connection: WSXConnection) {
  const session = getSession(connection);

  if (session.deepgram && session.deepgram.readyState === WebSocket.OPEN) {
    return session.deepgram;
  }

  if (!DEEPGRAM_API_KEY) {
    throw new Error(
      'Missing DEEPGRAM_API_KEY environment variable. Set it before starting the example.'
    );
  }

  await new Promise<void>((resolve, reject) => {
    const socket = new WebSocket(DEEPGRAM_REALTIME_URL, {
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`
      }
    });

    const handleError = (error: unknown) => {
      socket.off('open', handleOpen);
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    const handleOpen = () => {
      socket.off('error', handleError);
      session.deepgram = socket;
      session.isStreaming = true;
      attachDeepgramHandlers(connection, socket);
      resolve();
    };

    socket.once('error', handleError);
    socket.once('open', handleOpen);
  });

  return session.deepgram!;
}

function attachDeepgramHandlers(connection: WSXConnection, socket: WebSocket) {
  socket.on('message', (raw) => {
    try {
      const payload = JSON.parse(raw.toString());
      const channel =
        payload?.channel ?? payload?.packet?.channel ?? payload?.data?.channel;
      const alternative = channel?.alternatives?.[0];
      const transcript: string = alternative?.transcript ?? '';

      if (!transcript.trim()) {
        return;
      }

      wsx.sendJsonToConnection(connection.id, 'transcribe:segment', {
        text: transcript,
        isFinal: Boolean(channel?.is_final ?? alternative?.is_final),
        confidence: alternative?.confidence
      });
    } catch (error) {
      console.error('Failed to parse Deepgram message', error);
    }
  });

  socket.on('close', (code, reason) => {
    const session = getSession(connection);
    session.deepgram = undefined;
    session.isStreaming = false;

    wsx.sendJsonToConnection(connection.id, 'transcribe:status', {
      state: 'closed',
      code,
      reason: reason.toString()
    });
  });

  socket.on('error', (error) => {
    console.error('Deepgram socket error', error);
    wsx.sendJsonToConnection(connection.id, 'transcribe:status', {
      state: 'error',
      message: error instanceof Error ? error.message : String(error)
    });
  });
}

function teardownDeepgramSession(connection: WSXConnection, reason: string) {
  const session = getSession(connection);
  if (session.deepgram && session.deepgram.readyState === WebSocket.OPEN) {
    session.deepgram.close(1000, reason);
  }
  session.deepgram = undefined;
  session.isStreaming = false;
}

wsx.onJson('transcribe:control', async (message, connection) => {
  const action = message.data?.action;

  if (action === 'start') {
    try {
      await ensureDeepgramSession(connection);
      wsx.sendJsonToConnection(connection.id, 'transcribe:status', {
        state: 'streaming',
        message: 'Deepgram connection ready. Start speaking!'
      });
    } catch (error) {
      console.error('Unable to start Deepgram session', error);
      wsx.sendJsonToConnection(connection.id, 'transcribe:status', {
        state: 'error',
        message: error instanceof Error ? error.message : String(error)
      });
    }
    return;
  }

  if (action === 'stop') {
    teardownDeepgramSession(connection, 'client-requested-stop');
    wsx.sendJsonToConnection(connection.id, 'transcribe:status', {
      state: 'stopped',
      message: 'Transcription stopped.'
    });
  }
});

wsx.onStream(
  'transcribe:audio',
  async (_message: WSXStreamMessage, payload, connection) => {
    const session = getSession(connection);

    if (!session.deepgram || session.deepgram.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      session.deepgram.send(payload, { binary: true });
    } catch (error) {
      console.error('Failed to forward audio', error);
      wsx.sendJsonToConnection(connection.id, 'transcribe:status', {
        state: 'error',
        message: 'Failed to forward audio to Deepgram.'
      });
    }
  }
);
