import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface CanvasProps {
  initialImage: string | null | undefined;
  brushColor: string;
  brushSize: number;
  isEraser: boolean;
}

export interface CanvasHandle {
  getDataURL: () => string;
  clear: () => void;
  isBlank: () => boolean;
}

const Canvas = forwardRef<CanvasHandle, CanvasProps>(({ initialImage, brushColor, brushSize, isEraser }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useImperativeHandle(ref, () => ({
    getDataURL: () => {
      return canvasRef.current?.toDataURL() || '';
    },
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
    isBlank: () => {
      const canvas = canvasRef.current;
      if (!canvas) return true;
      const blank = document.createElement('canvas');
      blank.width = canvas.width;
      blank.height = canvas.height;
      return canvas.toDataURL() === blank.toDataURL();
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = (width: number, height: number) => {
      if (width === 0 || height === 0) return;

      // Backup content
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx && canvas.width > 0 && canvas.height > 0) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (tempCanvas.width > 0) {
          ctx.drawImage(tempCanvas, 0, 0);
        }
      }
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        resize(width, height);
      }
    });

    observer.observe(container);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // CLEAR FIRST
      if (initialImage) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = initialImage;
      }
    }

    return () => observer.disconnect();
  }, [initialImage]);

  const getPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const syncCtx = (ctx: CanvasRenderingContext2D) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : brushColor;
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      // Don't preventDefault here to allow scrolling if needed,
      // but usually we want to prevent it for drawing.
    }
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    syncCtx(ctx);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // IMPORTANT: Sync context state on every frame to ensure props like color/size are current
    syncCtx(ctx);
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '250px' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={(e) => { startDrawing(e); }}
        onTouchMove={(e) => { e.preventDefault(); draw(e); }}
        onTouchEnd={stopDrawing}
        style={{ cursor: 'crosshair', display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
});

export default Canvas;
