let audio: HTMLAudioElement | null = null;

export function playCompleteSound() {
  if (!audio) {
    audio = new Audio("/audio/completed-sound.mp3");
    audio.volume = 0.4;
  }
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
