export function setupInput(canvas, onTargetXChange) {
  const updateFromEvent = (event) => {
    const rect = canvas.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const x = Math.max(0, Math.min(1, ratio)) * rect.width;
    onTargetXChange(x);
  };

  const handlePointerDown = (event) => {
    event.preventDefault();
    updateFromEvent(event);
  };

  const handlePointerMove = (event) => {
    if (event.pressure === 0 && event.buttons === 0) return;
    event.preventDefault();
    updateFromEvent(event);
  };

  canvas.addEventListener('pointerdown', handlePointerDown, { passive: false });
  canvas.addEventListener('pointermove', handlePointerMove, { passive: false });

  return () => {
    canvas.removeEventListener('pointerdown', handlePointerDown);
    canvas.removeEventListener('pointermove', handlePointerMove);
  };
}
