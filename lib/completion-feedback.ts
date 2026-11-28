import { playCompleteSound } from "@/lib/audio";

export function completionOrigin(button: HTMLButtonElement) {
  const rect = button.getBoundingClientRect();
  const { clientWidth, clientHeight } = document.documentElement;
  return {
    x: (rect.left + rect.width / 2) / clientWidth,
    y: (rect.top + rect.height / 2) / clientHeight,
  };
}

export function celebrateCompletion(origin: ReturnType<typeof completionOrigin>) {
  void playCompleteSound();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  void import("canvas-confetti")
    .then(({ default: confetti }) =>
      confetti({
        origin,
        particleCount: 28,
        spread: 65,
        startVelocity: 19,
        scalar: 0.75,
        ticks: 95,
        disableForReducedMotion: true,
      }),
    )
    .catch(() => {
      // A decorative effect should never interrupt the check-in.
    });
}
