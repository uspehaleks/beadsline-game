import { memo } from 'react';
import { motion } from 'framer-motion';

interface MiniBeadsLogoProps {
  size?: number;
}

const MiniBeadsLogo = memo(({ size = 22 }: MiniBeadsLogoProps) => {
  const beadColors = ['#00ff88', '#8b5cf6', '#00d4ff', '#f7931a'];
  const beadSize = size * 0.18;
  const orbitRadius = size * 0.38;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
        filter: 'drop-shadow(0 0 4px #00ff88) drop-shadow(0 0 8px #00ff8850)',
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, hsl(155 100% 50% / 0.25), hsl(270 60% 30% / 0.3) 70%)',
          border: '1.5px solid hsl(155 100% 50% / 0.4)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />

      {beadColors.map((color, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: beadSize,
            height: beadSize,
            backgroundColor: color,
            boxShadow: `0 0 3px ${color}, 0 0 6px ${color}60`,
            top: '50%',
            left: '50%',
            marginTop: -beadSize / 2,
            marginLeft: -beadSize / 2,
          }}
          animate={{
            x: [
              Math.cos((i * 90 * Math.PI) / 180) * orbitRadius,
              Math.cos(((i * 90 + 20) * Math.PI) / 180) * orbitRadius,
              Math.cos((i * 90 * Math.PI) / 180) * orbitRadius,
            ],
            y: [
              Math.sin((i * 90 * Math.PI) / 180) * orbitRadius,
              Math.sin(((i * 90 + 20) * Math.PI) / 180) * orbitRadius,
              Math.sin((i * 90 * Math.PI) / 180) * orbitRadius,
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.15,
          }}
        />
      ))}

      <span
        className="font-bold relative z-10"
        style={{
          fontSize: size * 0.45,
          color: '#00ff88',
          textShadow: '0 0 6px #00ff88, 0 0 12px #00ff8850',
          lineHeight: 1,
        }}
      >
        B
      </span>
    </div>
  );
});

MiniBeadsLogo.displayName = 'MiniBeadsLogo';

export default MiniBeadsLogo;