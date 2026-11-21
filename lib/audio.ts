let audio: HTMLAudioElement | null = null;

function getAudio() {
  if (typeof Audio === "undefined") return null;

  if (!audio) {
    audio = new Audio("/audio/completed-sound.mp3");
    audio.volume = 0.4;
    audio.preload = "auto";
  }

  return audio;
}

export function preloadCompleteSound() {
  getAudio()?.load();
}

export function playCompleteSound() {
  const sound = getAudio();
  if (!sound) return;

  sound.currentTime = 0;
  sound.play().catch(() => {});
}
