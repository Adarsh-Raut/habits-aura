let audio: HTMLAudioElement | null = null;

function getAudio() {
  if (!audio) {
    audio = new Audio("/audio/completed-sound.mp3");
    audio.volume = 0.4;
    audio.preload = "auto";
  }
  return audio;
}

export function preloadCompleteSound() {
  getAudio().load();
}

export function playCompleteSound() {
  const nextAudio = getAudio();
  nextAudio.currentTime = 0;
  nextAudio.play().catch(() => {});
}
