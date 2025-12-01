'use client';

import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VIPTier } from '@/lib/vip-types';

interface VIPBadgeProps {
  tier?: VIPTier;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  animated?: boolean;
}

const TIER_CONFIG = {
  [VIPTier.FREE]: {
    gradient: 'from-gray-500 to-gray-600',
    shadow: 'shadow-gray-500/30',
    border: 'border-gray-400',
    text: 'Free',
    textColor: 'text-white'
  },
  [VIPTier.VIP]: {
    gradient: 'from-yellow-400 via-yellow-500 to-amber-500',
    shadow: 'shadow-yellow-500/50',
    border: 'border-yellow-300',
    text: 'VIP',
    textColor: 'text-gray-900'
  }
};

export const VIPBadge = ({ 
  tier = VIPTier.VIP,
  size = 'md', 
  showText = true, 
  className = '',
  animated = true 
}: VIPBadgeProps) => {
  const config = TIER_CONFIG[tier];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const Badge = (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold",
        `bg-gradient-to-r ${config.gradient}`,
        config.textColor,
        `shadow-lg ${config.shadow}`,
        `border-2 ${config.border}`,
        sizeClasses[size],
        className
      )}
    >
      {tier === VIPTier.FREE ? (
        <Sparkles className={cn(iconSizes[size])} />
      ) : (
        <Crown className={cn(iconSizes[size], "fill-yellow-600")} />
      )}
      {showText && <span>{config.text}</span>}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        {Badge}
      </motion.div>
    );
  }

  return Badge;
};

export const VIPGlow = ({ children, enabled = true }: { children: React.ReactNode; enabled?: boolean }) => {
  if (!enabled) return <>{children}</>;

  return (
    <motion.div
      className="relative"
      animate={{
        boxShadow: [
          '0 0 20px rgba(234, 179, 8, 0.3)',
          '0 0 40px rgba(234, 179, 8, 0.5)',
          '0 0 20px rgba(234, 179, 8, 0.3)'
        ]
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {children}
      <motion.div
        className="absolute -top-1 -right-1"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-4 h-4 text-yellow-400" />
      </motion.div>
    </motion.div>
  );
};
