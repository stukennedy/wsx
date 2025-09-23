const connectionBadge = document.getElementById("connectionStatus");
const connectionText = document.getElementById("connectionStatusText");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const liveTranscript = document.getElementById("liveTranscript");
const transcriptHistory = document.getElementById("transcriptHistory");
const meterBars = Array.from(document.querySelectorAll(".meter-bar"));

const finalSegments = [];
let wsx;
let connectionReady = false;
let isStreaming = false;
let mediaStream;
let recorder;
let meterTimer;
let wsxBindingsApplied = false;

function setStatus(state, message) {
  connectionBadge.dataset.state = state;
  connectionText.textContent = message;
}

function renderHistory() {
  transcriptHistory.innerHTML = "";
  finalSegments.forEach((segment) => {
    const line = document.createElement("p");
    line.className = "transcript-line";
    line.textContent = segment;
    transcriptHistory.appendChild(line);
  });
  transcriptHistory.scrollTop = transcriptHistory.scrollHeight;
}

function startMeterAnimation() {
  if (meterTimer) return;
  meterTimer = window.setInterval(() => {
    meterBars.forEach((bar, index) => {
      const variance = Math.sin(Date.now() / 260 + index) * 32;
      const height = Math.min(
        100,
        Math.max(14, 40 + variance + Math.random() * 28)
      );
      bar.style.height = `${height}%`;
      bar.classList.toggle("active", height > 28);
    });
  }, 120);
}

function stopMeterAnimation() {
  if (meterTimer) {
    clearInterval(meterTimer);
    meterTimer = undefined;
  }
  meterBars.forEach((bar, index) => {
    const base = 10 + (index % 6);
    bar.style.height = `${base}%`;
    bar.classList.remove("active");
  });
}

function resetTranscription() {
  finalSegments.length = 0;
  renderHistory();
  liveTranscript.textContent = "Waiting for audio…";
}

async function startTranscription() {
  if (!wsx?.ws || wsx.ws.readyState !== WebSocket.OPEN) {
    setStatus("warning", "WebSocket is not ready yet. Hold on…");
    return;
  }

  console.log("startTranscription");
  if (isStreaming) {
    return;
  }

  console.log("startTranscription 2");

  if (typeof window.MediaRecorder === "undefined") {
    setStatus("error", "MediaRecorder is not supported in this browser");
    return;
  }

  startButton.disabled = true;
  stopButton.disabled = false;
  setStatus("streaming", "Opening microphone…");

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 48000,
        echoCancellation: true,
        noiseSuppression: true,
      },
      video: false,
    });
  } catch (error) {
    console.error("Microphone permission denied", error);
    startButton.disabled = false;
    stopButton.disabled = true;
    setStatus("error", "Microphone permission denied");
    return;
  }

  recorder = new MediaRecorder(mediaStream, {
    mimeType: "audio/webm;codecs=opus",
    audioBitsPerSecond: 128000,
  });

  recorder.addEventListener("dataavailable", (event) => {
    if (!event.data || event.data.size === 0 || !isStreaming) {
      return;
    }

    wsx
      .sendStream("transcribe:audio", event.data, {
        metadata: { timestamp: Date.now() },
      })
      .catch((error) => {
        console.error("Failed to send audio chunk", error);
        setStatus("error", "Unable to stream audio chunk");
        stopTranscription();
      });
  });

  recorder.addEventListener("stop", () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = undefined;
    }
  });

  recorder.start(500);
  resetTranscription();

  try {
    wsx.sendJson("transcribe:control", { action: "start" });
  } catch (error) {
    console.error("Unable to send start signal", error);
    setStatus("error", "Failed to start Deepgram session");
    stopTranscription();
    return;
  }

  isStreaming = true;
  startMeterAnimation();
  liveTranscript.textContent = "Waiting for Deepgram…";
}

function stopTranscription({ notifyServer = true } = {}) {
  if (!isStreaming) {
    return;
  }

  isStreaming = false;
  startButton.disabled = false;
  stopButton.disabled = true;
  stopMeterAnimation();

  if (recorder && recorder.state !== "inactive") {
    recorder.stop();
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = undefined;
  }

  if (notifyServer) {
    try {
      wsx.sendJson("transcribe:control", { action: "stop" });
    } catch (error) {
      console.warn("Unable to notify server about stop", error);
    }
  }

  setStatus("connected", "Session idle");
}

function bindWSXInstance(instance) {
  if (wsxBindingsApplied) {
    console.log("bindWSXInstance 1");
    return;
  }

  wsx = instance;
  window._transcribeWSX = wsx;
  wsxBindingsApplied = true;

  wsx.onJson("transcribe:status", ({ data }) => {
    if (!data) return;

    if (data.state === "streaming") {
      setStatus("streaming", data.message || "Streaming live audio");
    } else if (data.state === "connected") {
      setStatus("connected", data.message || "Realtime bridge ready");
    } else if (data.state === "stopped") {
      setStatus("connected", data.message || "Session idle");
      stopTranscription({ notifyServer: false });
    } else if (data.state === "closed") {
      setStatus("warning", "Deepgram closed the connection");
      stopTranscription({ notifyServer: false });
    } else if (data.state === "error") {
      setStatus("error", data.message || "Deepgram error");
      stopTranscription({ notifyServer: false });
    } else if (data.state === "connecting") {
      setStatus("warning", data.message || "Starting Deepgram session…");
    }
  });

  wsx.onJson("transcribe:segment", ({ data }) => {
    if (!data?.text) return;

    if (data.isFinal) {
      finalSegments.push(data.text);
      renderHistory();
      liveTranscript.textContent = "";
    } else {
      liveTranscript.textContent = data.text;
    }
  });

  if (wsx.ws && wsx.ws.readyState === WebSocket.OPEN) {
    connectionReady = true;
    setStatus("connected", "Realtime bridge ready");
  }
}

function waitForWSXInstance(retries = 0) {
  if (window.wsx) {
    console.log("waitForWSXInstance 1");
    bindWSXInstance(window.wsx);
    return;
  }

  if (retries > 300) {
    console.error("WSX client failed to initialise");
    setStatus("error", "WSX client failed to initialise");
    return;
  }

  window.setTimeout(() => waitForWSXInstance(retries + 1), 50);
}

document.addEventListener("wsx:connected", () => {
  connectionReady = true;
  if (!wsxBindingsApplied && window.wsx) {
    bindWSXInstance(window.wsx);
  }
  if (!isStreaming) {
    setStatus("connected", "Realtime bridge ready");
  }
});

document.addEventListener("wsx:disconnected", () => {
  connectionReady = false;
  if (isStreaming) {
    stopTranscription({ notifyServer: false });
  }
  setStatus("warning", "Reconnecting to WSX…");
});

startButton.addEventListener("click", () => {
  if (!connectionReady) {
    setStatus("warning", "Waiting for WSX connection…");
    return;
  }
  startTranscription();
});

stopButton.addEventListener("click", () => {
  stopTranscription();
});

window.addEventListener("beforeunload", () => {
  stopTranscription({ notifyServer: true });
});

waitForWSXInstance();
stopMeterAnimation();
