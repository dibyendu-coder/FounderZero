import React, { useEffect, useRef } from 'react';

export const HeroCube: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // 3D Cube Vertices centered at (0, 0, 0)
    const size = Math.min(width, height) * 0.28;
    const vertices = [
      [-size, -size, -size],
      [size, -size, -size],
      [size, size, -size],
      [-size, size, -size],
      [-size, -size, size],
      [size, -size, size],
      [size, size, size],
      [-size, size, size],
    ];

    // Faces defined as indices into vertices
    const faces = [
      [0, 1, 2, 3], // back
      [4, 5, 6, 7], // front
      [0, 1, 5, 4], // top
      [2, 3, 7, 6], // bottom
      [0, 3, 7, 4], // left
      [1, 2, 6, 5], // right
    ];

    // Edges defined as vertex pairs
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    let angleX = 0.4;
    let angleY = 0.6;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - width / 2) * 0.0005;
      mouseY = (e.clientY - rect.top - height / 2) * 0.0005;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const project = (x: number, y: number, z: number) => {
      const focalLength = 400;
      const distance = focalLength / (focalLength + z + size * 2);
      return {
        x: x * distance + width / 2,
        y: y * distance + height / 2,
        z: z,
        scale: distance
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Canvas background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      angleX += 0.006 + mouseY * 0.1;
      angleY += 0.008 + mouseX * 0.1;

      // Rotate vertices
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const rotatedVertices = vertices.map(([x, y, z]) => {
        // Rotate Y
        let x1 = x * cosY - z * sinY;
        let z1 = z * cosY + x * sinY;
        // Rotate X
        let y2 = y * cosX - z1 * sinX;
        let z2 = z1 * cosX + y * sinX;
        return project(x1, y2, z2);
      });

      // Draw faces (dark solid black with hairline depth)
      faces.forEach((face) => {
        ctx.beginPath();
        const p0 = rotatedVertices[face[0]];
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < face.length; i++) {
          const p = rotatedVertices[face[i]];
          ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.fillStyle = '#000000';
        ctx.fill();
      });

      // Draw Edges (Graphite Hairline #292d30)
      edges.forEach(([i, j]) => {
        const p1 = rotatedVertices[i];
        const p2 = rotatedVertices[j];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = '#292d30';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw Vertex Neon Points (Iris Violet #9281f7)
      rotatedVertices.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5 * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#9281f7';
        ctx.shadowColor = '#9281f7';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] sm:h-[440px] flex items-center justify-center overflow-hidden rounded-[16px] border-graphite bg-[#000000]">
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-4 right-4 text-[11px] font-commit text-[#a1a4a5] bg-[#000000]/80 px-2.5 py-1 rounded-[6px] border-graphite flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#9281f7] animate-pulse" />
        <span>3D Geometric Anchor</span>
      </div>
    </div>
  );
};
