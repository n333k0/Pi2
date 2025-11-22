import React, { useRef, useEffect } from 'react';

interface PiVisualizerProps {
  progress: number; // 0 to 1
}

const PiVisualizer: React.FC<PiVisualizerProps> = ({ progress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const size = Math.min(window.innerWidth, window.innerHeight) * 0.85;
      const dpr = window.devicePixelRatio || 1;
      
      // Handle resize
      if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
          canvas.width = size * dpr;
          canvas.height = size * dpr;
          canvas.style.width = `${size}px`;
          canvas.style.height = `${size}px`;
          ctx.scale(dpr, dpr);
      }

      const centerX = size / 2;
      const centerY = size / 2;
      
      // The maximum reach of the two vectors (length 1 + length 1) is 2 units.
      // We need to fit 2 units into the half-size of the canvas, with some padding.
      const scale = (size / 2) * 0.45; // 0.45 * 2 = 0.9 (90% of half-width)

      // Clear background
      ctx.clearRect(0, 0, size, size);

      // 1. Draw Central Pi Symbol (Fades out quickly)
      const piOpacity = Math.max(0, 1 - Math.pow(progress * 12, 1.5));
      if (piOpacity > 0.01) {
        ctx.save();
        ctx.globalAlpha = piOpacity;
        ctx.fillStyle = '#ffffff';
        ctx.font = `italic ${size * 0.15}px "Times New Roman", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('π', centerX, centerY);
        ctx.restore();
      }

      // 2. Draw Outer Boundary Circle (The limit of the walk)
      // Radius = 2 units * scale
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 2 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 3. Calculate The Path (Vector Addition)
      // Formula: z = e^(i*theta) + e^(i*pi*theta)
      // This creates a non-repeating path inside radius 2.
      
      // INCREASED DENSITY: 300 full rotations of the primary arm to ensure the circle fills with white.
      const maxTheta = 600 * Math.PI; 
      const currentTheta = progress * maxTheta;

      // Optimization: We can't draw infinite points.
      // We'll draw a polyline with resolution relative to the curve curvature.
      const stepSize = 0.03; // Radians per step
      const drawSteps = Math.floor(currentTheta / stepSize);

      if (drawSteps > 0) {
        ctx.save();
        // 'lighter' composite operation creates the glowing white effect where lines overlap
        ctx.globalCompositeOperation = 'lighter';
        
        // INCREASED OPACITY: Constant 0.4 ensures that as lines stack, they become bright white.
        const opacity = 0.4;
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        
        // Start point: theta = 0 -> (1+1, 0) = (2, 0)
        ctx.moveTo(centerX + 2 * scale, centerY);

        for (let i = 1; i <= drawSteps; i++) {
           const t = i * stepSize;
           
           // x = cos(t) + cos(pi * t)
           // y = sin(t) + sin(pi * t)
           const px = centerX + scale * (Math.cos(t) + Math.cos(Math.PI * t));
           const py = centerY + scale * (Math.sin(t) + Math.sin(Math.PI * t));
           
           ctx.lineTo(px, py);
        }
        
        // Draw the precise partial step to the pen tip
        const px = centerX + scale * (Math.cos(currentTheta) + Math.cos(Math.PI * currentTheta));
        const py = centerY + scale * (Math.sin(currentTheta) + Math.sin(Math.PI * currentTheta));
        ctx.lineTo(px, py);
        
        ctx.stroke();
        ctx.restore();
      }

      // 4. Draw the Robot Arm (The Vectors)
      // Only visible if we haven't finished or if we want to show the mechanism
      // The prompt emphasizes the mechanism "robot-arm-like line".
      
      // Joint 1 Position (End of first vector e^it)
      const j1x = centerX + scale * Math.cos(currentTheta);
      const j1y = centerY + scale * Math.sin(currentTheta);

      // Joint 2 Position (End of second vector e^it + e^ipit) -> The Pen Tip
      const penX = centerX + scale * (Math.cos(currentTheta) + Math.cos(Math.PI * currentTheta));
      const penY = centerY + scale * (Math.sin(currentTheta) + Math.sin(Math.PI * currentTheta));

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Arm styling - Mechanical white lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; 
      ctx.lineWidth = 2;

      // Vector 1: Origin -> Joint 1
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(j1x, j1y);
      ctx.stroke();

      // Vector 2: Joint 1 -> Pen
      ctx.beginPath();
      ctx.moveTo(j1x, j1y);
      ctx.lineTo(penX, penY);
      ctx.stroke();

      // Draw Joints
      ctx.lineWidth = 2;
      
      // Center Hub - Solid Point (White)
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Elbow Joint
      ctx.strokeStyle = '#fff';
      ctx.fillStyle = '#000'; 
      ctx.beginPath();
      ctx.arc(j1x, j1y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pen Tip (Glowing White)
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(255, 255, 255, 1)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(penX, penY, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const tick = () => {
        render();
        animationFrameId = requestAnimationFrame(tick);
    };
    tick();

    return () => cancelAnimationFrame(animationFrameId);
  }, [progress]);

  return (
    <div ref={containerRef} className="flex items-center justify-center w-full h-full">
        <canvas ref={canvasRef} className="z-10 block" />
    </div>
  );
};

export default PiVisualizer;