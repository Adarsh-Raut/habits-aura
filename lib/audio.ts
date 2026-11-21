/**
 * Completion sound.
 *
 * Uses the Web Audio API with a decoded buffer instead of a shared
 * <audio> element. The old element-based version called `audio.load()` every
 * time a page mounted, which aborted any sound still playing, so the sound
 * created on "Create habit" was cut off the moment the list page appeared.
 * Buffer playback is independent of page changes and can overlap itself.
 */

const SOUND_URL = "/audio/completed-sound.mp3";
const VOLUME = 0.4;

let context: AudioContext | null = null;
let bufferPromise: Promise<AudioBuffer | null> | null = null;
let unlockAttached = false;

type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (context) return context;

  const Ctor =
    window.AudioContext ?? (window as WindowWithWebkit).webkitAudioContext;
  if (!Ctor) return null;

  context = new Ctor();
  return context;
}

function loadBuffer(): Promise<AudioBuffer | null> {
  if (bufferPromise) return bufferPromise;

  const audioContext = getContext();
  if (!audioContext) return Promise.resolve(null);

  bufferPromise = fetch(SOUND_URL)
    .then((response) => response.arrayBuffer())
    .then((data) => audioContext.decodeAudioData(data))
    .catch(() => {
      bufferPromise = null; // allow a retry on the next call
      return null;
    });

  return bufferPromise;
}

/** Browsers only start audio after a user gesture; unlock on the first one. */
function unlockOnFirstGesture() {
  if (unlockAttached || typeof window === "undefined") return;
  unlockAttached = true;

  const unlock = () => {
    const audioContext = getContext();
    if (audioContext && audioContext.state === "suspended") {
      void audioContext.resume().catch(() => {});
    }
    void loadBuffer();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };

  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

/** Safe to call from any number of components; it only wires things up once. */
export function preloadCompleteSound() {
  unlockOnFirstGesture();
  if (context) void loadBuffer();
}

export async function playCompleteSound() {
  const audioContext = getContext();

  if (!audioContext) {
    // Very old browsers: a fresh element each time, never reloaded.
    const fallback = new Audio(SOUND_URL);
    fallback.volume = VOLUME;
    void fallback.play().catch(() => {});
    return;
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume().catch(() => {});
  }

  const buffer = await loadBuffer();
  if (!buffer || audioContext.state !== "running") return;

  const source = audioContext.createBufferSource();
  const gain = audioContext.createGain();
  source.buffer = buffer;
  gain.gain.value = VOLUME;
  source.connect(gain).connect(audioContext.destination);
  source.start();
}
