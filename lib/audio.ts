let audio: HTMLAudioElement | null = null;
let audioReady: Promise<void> | null = null;

function preloadAudio() {
  if (audio) return audioReady!;
  
  audio = new Audio("/audio/completed-sound.mp3");
  audio.volume = 0.4;
  
  audioReady = new Promise((resolve) => {
    audio!.addEventListener("canplaythrough", () => resolve(), { once: true });
    audio!.load();
  });
  
  return audioReady;
}

export function preloadCompleteSound() {
  preloadAudio();
}

export async function playCompleteSound() {
  await preloadAudio();
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
