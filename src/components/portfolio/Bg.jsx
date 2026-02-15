// components/BackgroundScene.jsx
import React from "react";

export default function BackgroundScene() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#f7f7f7" stopOpacity="1" />
        </linearGradient>

        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" result="b" />
          <feOffset dy="6" in="b" result="o"/>
          <feBlend in="SourceGraphic" in2="o"/>
        </filter>
      </defs>

      {/* Fondo liso */}
      <rect width="100%" height="100%" fill="url(#g1)" />

      {/* Esquinas - formas decorativas */}
      {/* Bola azul (izq superior) */}
      <g filter="url(#softShadow)">
        <circle cx="180" cy="120" r="80" fill="#45d6d6" />
      </g>

      {/* Cuadrado redondeado naranja (der inferior) */}
      <g transform="translate(1620,820) rotate(-18)" filter="url(#softShadow)">
        <rect x="-80" y="-80" width="160" height="160" rx="28" ry="28" fill="#ff6b48" />
      </g>

      {/* Estrella rosa (izq inferior) */}
      <g transform="translate(120,820)" filter="url(#softShadow)">
        <path d="M0 -48 C12 -56 36 -56 48 -48 C56 -36 56 -12 48 0 C36 12 12 12 0 0 C-12 12 -36 12 -48 0 C-56 -12 -56 -36 -48 -48 C-36 -56 -12 -56 0 -48 Z"
              transform="scale(0.9)"
              fill="#ff89a9" />
      </g>

      {/* Bloques morado (derecha superior) */}
      <g transform="translate(1600,140)" filter="url(#softShadow)">
        <rect x="-60" y="-60" width="120" height="120" rx="18" fill="#8b5cf6" />
      </g>

      {/* Dots / más formas puedes duplicar */}
    </svg>
  );
}
