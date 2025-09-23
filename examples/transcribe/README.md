# WSX Transcribe Example

Beautiful realtime transcription demo that streams microphone audio through WSX binary channels and renders Deepgram transcripts delivered over WSX JSON messages.

## Getting started

1. Install dependencies from the repo root:

   ```bash
   bun install
   ```

2. Export your Deepgram realtime key (and optional custom endpoint):

   ```bash
   export DEEPGRAM_API_KEY="dg_..."
   # export DEEPGRAM_URL="wss://api.deepgram.com/v1/listen?..."
   ```

3. Run the example:

   ```bash
   cd examples/transcribe
   bun run dev
   ```

4. Visit <http://localhost:3001> and click **Start Listening**.

The browser will request microphone access, stream `audio/webm;codecs=opus` packets via `wsx.sendStream`, and print transcripts returned from the server with `wsx.onJson`. Stop the session at any time to tear everything down cleanly.

## Notes

- The server forwards audio frames directly to Deepgram using a per-connection WebSocket. Make sure your API key has realtime access.
- You can override `DEEPGRAM_URL` to tweak model, language, or options without editing code.
- When Deepgram closes or errors, the UI surfaces the status and stops streaming automatically.
- Bun handles TypeScript in `server.ts`; use `bun run server.ts` for production-style start.
