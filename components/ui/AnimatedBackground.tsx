'use client';

import { useEffect, useRef } from 'react';

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let mouseX = 0;
    let mouseY = 0;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      twinkleSpeed: number;
      opacity: number;
      targetOpacity: number;
    }> = [];

    const particleCount = 100; // Increased count

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size: Math.random() * 2 + 0.5,
        density: (Math.random() * 30) + 1,
        twinkleSpeed: Math.random() * 0.05 + 0.01,
        opacity: Math.random(),
        targetOpacity: Math.random(),
      });
    }

    function animate() {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Nebula/Cosmic dust effect (subtle gradients)
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      gradient.addColorStop(0, 'rgba(60, 20, 80, 0.1)'); // Deep purple center
      gradient.addColorStop(0.5, 'rgba(20, 10, 40, 0.05)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);


      particles.forEach((particle) => {
        // Mouse interaction
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const maxDistance = 150;
        const force = (maxDistance - distance) / maxDistance;
        const directionX = forceDirectionX * force * particle.density;
        const directionY = forceDirectionY * force * particle.density;

        if (distance < maxDistance) {
          particle.x -= directionX;
          particle.y -= directionY;
        } else {
          if (particle.x !== particle.baseX) {
            const dx = particle.x - particle.baseX;
            particle.x -= dx / 10;
          }
          if (particle.y !== particle.baseY) {
            const dy = particle.y - particle.baseY;
            particle.y -= dy / 10;
          }
        }

        // Twinkle effect
        if (Math.abs(particle.opacity - particle.targetOpacity) < 0.01) {
          particle.targetOpacity = Math.random();
        }
        particle.opacity += (particle.targetOpacity - particle.opacity) * particle.twinkleSpeed;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        // Gold/Red/White mix for mystical feel
        const colorMix = Math.random();
        if (colorMix > 0.9) {
             ctx.fillStyle = `rgba(255, 215, 0, ${particle.opacity})`; // Gold
        } else if (colorMix > 0.8) {
             ctx.fillStyle = `rgba(239, 68, 68, ${particle.opacity})`; // Red
        } else {
             ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`; // White
        }
        
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-[#1a0b2e] to-black" style={{ zIndex: -1 }} />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(120,0,0,0.1),transparent_70%)]" style={{ zIndex: -1 }} />
    </>
  );
}
