"use client";
import { cn } from "../../lib/utils";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export const SparklesCore = (props: {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
}) => {
  const {
    id,
    className,
    background,
    minSize,
    maxSize,
    speed,
    particleColor,
    particleDensity,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const resizeCanvas = () => {
        if (canvas.parentElement) {
          canvas.width = canvas.parentElement.offsetWidth;
          canvas.height = canvas.parentElement.offsetHeight;
        }
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      const particleCount = Math.floor((canvas.width * canvas.height) / 10000) * (particleDensity || 100);

      const initParticles = () => {
        particles.current = [];
        for (let i = 0; i < particleCount; i++) {
          particles.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * (speed || 1),
            vy: (Math.random() - 0.5) * (speed || 1),
            life: Math.random(),
          });
        }
      };

      initParticles();

      const drawParticles = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = particleColor || "rgba(255, 255, 255, 0.5)";

        particles.current.forEach((particle) => {
          ctx.globalAlpha = particle.life;
          ctx.beginPath();
          const size = minSize || 1 + (Math.random() * (maxSize || 3));
          ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
          ctx.fill();

          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life -= 0.005;

          if (particle.life <= 0) {
            particle.x = Math.random() * canvas.width;
            particle.y = Math.random() * canvas.height;
            particle.life = 1;
          }

          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        });

        requestAnimationFrame(drawParticles);
      };

      drawParticles();

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }
  }, [particleDensity, particleColor, speed, minSize, maxSize]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={cn("absolute inset-0", className)}
      style={{
        background: background || "transparent",
      }}
    ></canvas>
  );
};
