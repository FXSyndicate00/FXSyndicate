
import React, { useRef, useEffect } from 'react';

interface Candle {
  x: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const BackgroundChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let candles: Candle[] = [];
    let lastClose: number;
    const candleWidth = 8;
    const candleSpacing = 4;
    const stepX = candleWidth + candleSpacing;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      lastClose = canvas.height / 2;
      candles = []; // Reset candles on resize
      const candleCount = Math.ceil(canvas.width / stepX) + 5;
      for (let i = 0; i < candleCount; i++) {
        const newCandle = getNextCandle(i * stepX);
        candles.push(newCandle);
        lastClose = newCandle.close;
      }
    };

    const getNextCandle = (x: number): Candle => {
        let open = lastClose;
        const trend = (Math.random() - 0.49) * (canvas.height * 0.08); // Slight upward bias
        let close = open + trend;

        // Clamp values to stay within view
        const padding = canvas.height * 0.15;
        open = Math.max(padding, Math.min(canvas.height - padding, open));
        close = Math.max(padding, Math.min(canvas.height - padding, close));
        
        const high = Math.max(open, close) + Math.random() * (canvas.height * 0.04);
        const low = Math.min(open, close) - Math.random() * (canvas.height * 0.04);

        return { x, open, high, low, close };
    }

    const drawCandle = (candle: Candle) => {
        if (!ctx) return;
        
        const isBullish = candle.close >= candle.open;
        const color = isBullish ? 'rgba(13, 148, 136, 0.4)' : 'rgba(220, 38, 38, 0.4)'; // Teal-600 / Red-600 with opacity
        
        // Draw wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(candle.x + candleWidth / 2, candle.low);
        ctx.lineTo(candle.x + candleWidth / 2, candle.high);
        ctx.stroke();

        // Draw body
        const bodyHeight = Math.abs(candle.open - candle.close);
        const bodyY = isBullish ? candle.close : candle.open;
        
        ctx.fillStyle = color;
        ctx.fillRect(candle.x, bodyY, candleWidth, -bodyHeight);
    };

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Move all candles to the left
      candles.forEach(c => { c.x -= 0.5; });

      // Remove candles that have moved off-screen
      if (candles.length > 0 && candles[0].x < -stepX) {
        candles.shift();
      }

      // Add a new candle to the right if needed
      const lastCandle = candles[candles.length - 1];
      if (lastCandle && lastCandle.x < canvas.width) {
          const newCandle = getNextCandle(lastCandle.x + stepX);
          candles.push(newCandle);
          lastClose = newCandle.close;
      }

      // Draw all visible candles
      candles.forEach(drawCandle);

      animationFrameId = window.requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

export default BackgroundChart;
