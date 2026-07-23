'use client';

import React, { useEffect, useState } from 'react';

interface EnergyRoutingOverlayProps {
  active: boolean;
  attackPct: number;
  defendPct: number;
  investPct: number;
}

interface Particle {
  id: number;
  lane: 'attack' | 'defend' | 'invest';
  progress: number; // 0 → 1
  speed: number;
}

const LANE_CONFIG = {
  attack: {
    label: 'ATTACK VAULT',
    icon: '/assets/attack_icon.png',
    color: '#FF0A78',
    glow: 'rgba(255,10,120,0.8)',
    angle: -40, // degrees from vertical (left)
  },
  defend: {
    label: 'DEFEND VAULT',
    icon: '/assets/defense_icon.png',
    color: '#4DA3FF',
    glow: 'rgba(77,163,255,0.8)',
    angle: 0, // straight down
  },
  invest: {
    label: 'INVEST VAULT',
    icon: '/assets/invest_icon.png',
    color: '#00F58A',
    glow: 'rgba(0,245,138,0.8)',
    angle: 40, // degrees from vertical (right)
  },
} as const;

type Lane = keyof typeof LANE_CONFIG;

export default function EnergyRoutingOverlay({
  active,
  attackPct,
  defendPct,
  investPct,
}: EnergyRoutingOverlayProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);
  const [showVaults, setShowVaults] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      setShowVaults(false);
      setParticles([]);
      return;
    }

    // Fade in overlay
    setVisible(true);

    // Show vaults with a slight delay for drama
    const vaultTimer = setTimeout(() => setShowVaults(true), 200);

    // Spawn particles proportional to the percentages
    let nextId = 0;
    const totalPct = attackPct + defendPct + investPct;
    const lanes: Lane[] = ['attack', 'defend', 'invest'];
    const pctMap: Record<Lane, number> = {
      attack: attackPct,
      defend: defendPct,
      invest: investPct,
    };

    // Spawn waves of particles over 2.4 seconds
    const intervalMs = 80;
    const totalWaves = 28;
    let wave = 0;

    const spawnInterval = setInterval(() => {
      wave++;
      if (wave > totalWaves) {
        clearInterval(spawnInterval);
        return;
      }

      const newParticles: Particle[] = [];
      lanes.forEach((lane) => {
        const pct = pctMap[lane];
        if (pct <= 0) return;
        // Probability of spawning in this lane this wave proportional to pct
        if (Math.random() < pct / (totalPct || 100)) {
          newParticles.push({
            id: nextId++,
            lane,
            progress: 0,
            speed: 0.025 + Math.random() * 0.02,
          });
        }
      });

      setParticles((prev) => [...prev, ...newParticles]);
    }, intervalMs);

    // Tick particle movement
    const tickInterval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, progress: p.progress + p.speed }))
          .filter((p) => p.progress < 1.15),
      );
    }, 40);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(tickInterval);
      clearTimeout(vaultTimer);
    };
  }, [active, attackPct, defendPct, investPct]);

  if (!visible) return null;

  const pcts: Record<Lane, number> = { attack: attackPct, defend: defendPct, invest: investPct };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(3, 10, 8, 0.92)', backdropFilter: 'blur(8px)' }}
    >
      {/* Pulsing central core */}
      <div className="relative flex flex-col items-center" style={{ width: 440, height: 400 }}>
        {/* Title */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
          <div
            className="text-[10px] font-black tracking-[0.4em] animate-pulse"
            style={{ color: '#00F58A', textShadow: '0 0 15px rgba(0,245,138,0.8)' }}
          >
            ⚡ ROUTING ENERGY SPLIT…
          </div>
        </div>

        {/* SVG canvas for particle lanes */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 440 400"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {(['attack', 'defend', 'invest'] as Lane[]).map((lane) => {
              const cfg = LANE_CONFIG[lane];
              return (
                <radialGradient key={lane} id={`glow-${lane}`} r="60%" cx="50%" cy="50%">
                  <stop offset="0%" stopColor={cfg.color} stopOpacity="1" />
                  <stop offset="100%" stopColor={cfg.color} stopOpacity="0" />
                </radialGradient>
              );
            })}
          </defs>

          {/* Lane guide lines (faint) */}
          {(['attack', 'defend', 'invest'] as Lane[]).map((lane) => {
            const cfg = LANE_CONFIG[lane];
            const rad = (cfg.angle * Math.PI) / 180;
            const srcX = 220;
            const srcY = 170;
            const len = 160;
            const dstX = srcX + Math.sin(rad) * len;
            const dstY = srcY + Math.cos(rad) * len;
            return (
              <line
                key={lane}
                x1={srcX}
                y1={srcY}
                x2={dstX}
                y2={dstY}
                stroke={cfg.color}
                strokeWidth="1"
                strokeDasharray="4 6"
                opacity="0.2"
              />
            );
          })}

          {/* Particles */}
          {particles.map((p) => {
            const cfg = LANE_CONFIG[p.lane];
            const rad = (cfg.angle * Math.PI) / 180;
            const srcX = 220;
            const srcY = 170;
            const len = 160;
            const x = srcX + Math.sin(rad) * len * p.progress;
            const y = srcY + Math.cos(rad) * len * p.progress;
            const opacity = p.progress < 0.1
              ? p.progress * 10
              : p.progress > 0.85
              ? (1 - p.progress) * 6.67
              : 1;
            return (
              <circle
                key={p.id}
                cx={x}
                cy={y}
                r={3.5}
                fill={cfg.color}
                opacity={opacity}
                style={{ filter: `drop-shadow(0 0 6px ${cfg.glow})` }}
              />
            );
          })}
        </svg>

        {/* Central core orb */}
        <div
          className="absolute"
          style={{ top: 140, left: '50%', transform: 'translateX(-50%)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center relative"
            style={{
              background: 'radial-gradient(circle, rgba(0,245,138,0.3) 0%, rgba(3,10,8,0.9) 70%)',
              border: '2px solid rgba(0,245,138,0.6)',
              boxShadow: '0 0 30px rgba(0,245,138,0.5), inset 0 0 20px rgba(0,245,138,0.2)',
            }}
          >
            {/* Spinning ring */}
            <div
              className="absolute inset-1 rounded-full border-2 border-dashed opacity-60"
              style={{
                borderColor: '#00F58A',
                animation: 'spin 0.5s linear infinite',
              }}
            />
            <span className="text-xl z-10">⚡</span>
          </div>
        </div>

        {/* Vault targets */}
        {(['attack', 'defend', 'invest'] as Lane[]).map((lane, i) => {
          const cfg = LANE_CONFIG[lane];
          const rad = (cfg.angle * Math.PI) / 180;
          const len = 168;
          const cx = 220 + Math.sin(rad) * len;
          const cy = 170 + Math.cos(rad) * len;
          const pct = pcts[lane];

          return (
            <div
              key={lane}
              className={`absolute transition-all duration-500 ${showVaults ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
              style={{
                left: cx - 48,
                top: cy - 12,
                transitionDelay: `${i * 80}ms`,
              }}
            >
              <div
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl"
                style={{
                  background: `rgba(${lane === 'attack' ? '255,10,120' : lane === 'defend' ? '77,163,255' : '0,245,138'},0.08)`,
                  border: `1px solid ${cfg.color}40`,
                  minWidth: 96,
                  boxShadow: `0 0 20px ${cfg.glow}30`,
                }}
              >
                <img src={cfg.icon} alt={lane} className="w-7 h-7 object-contain" />
                <div className="text-[8px] font-black tracking-widest" style={{ color: cfg.color }}>
                  {cfg.label}
                </div>
                <div
                  className="text-xl font-mono font-black"
                  style={{ color: cfg.color, textShadow: `0 0 12px ${cfg.glow}` }}
                >
                  {pct}%
                </div>
                {/* Fill bar */}
                <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: showVaults ? `${pct}%` : '0%',
                      background: cfg.color,
                      boxShadow: `0 0 8px ${cfg.glow}`,
                      transitionDelay: `${300 + i * 100}ms`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* "YOU" label above core */}
        <div
          className="absolute text-[9px] font-black tracking-[0.3em] text-white/60"
          style={{ top: 118, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
        >
          YOUR SPLIT
        </div>

        {/* Bottom instruction */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.25em] text-white/30 text-center"
          style={{ whiteSpace: 'nowrap' }}
        >
          COMMIT HASHED TO CHAIN
        </div>
      </div>
    </div>
  );
}
