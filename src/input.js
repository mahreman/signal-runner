// Canvas üzerindeki pointer/touch hareketlerini oyuncu hedef x koordinatına dönüştürür.
export function setupInput(canvas, onMove, onTap) {
  let isPointerDown = false;

  const handlePointer = (event) => {
    const rect = canvas.getBoundingClientRect();
    const normalized = (event.clientX - rect.left) / rect.width;
    const x = normalized * rect.width;
    onMove(x);
  };

  const handleDown = (event) => {
    event.preventDefault();
    isPointerDown = true;
    handlePointer(event);
    if (onTap) {
      onTap();
    }
  };

  const handleMove = (event) => {
    if (!isPointerDown) return;
    event.preventDefault();
    handlePointer(event);
  };

  const handleUp = (event) => {
    event.preventDefault();
    isPointerDown = false;
  };

  canvas.addEventListener('pointerdown', handleDown, { passive: false });
  window.addEventListener('pointermove', handleMove, { passive: false });
  window.addEventListener('pointerup', handleUp, { passive: false });
  window.addEventListener('pointercancel', handleUp, { passive: false });

  return () => {
    canvas.removeEventListener('pointerdown', handleDown);
    window.removeEventListener('pointermove', handleMove);
    window.removeEventListener('pointerup', handleUp);
    window.removeEventListener('pointercancel', handleUp);
  };
}
