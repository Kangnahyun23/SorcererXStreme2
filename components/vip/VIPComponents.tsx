'use client';

import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VIPOnlyLabelProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const VIPOnlyLabel = ({ className, size = 'sm' }: VIPOnlyLabelProps) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-bold",
        "bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500",
        "text-gray-900 shadow-lg shadow-yellow-500/30",
        "border border-yellow-300",
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        className
      )}
    >
      <Crown className={cn("fill-yellow-600", size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
      <span>VIP</span>
    </motion.div>
  );
};

interface VIPCardWrapperProps {
  children: React.ReactNode;
  isVIP?: boolean;
  showBadge?: boolean;
  className?: string;
}

export const VIPCardWrapper = ({ 
  children, 
  isVIP = false, 
  showBadge = true,
  className 
}: VIPCardWrapperProps) => {
  return (
    <div className={cn("relative group", className)}>
      {isVIP && showBadge && (
        <div className="absolute -top-2 -right-2 z-10">
          <motion.div
            animate={{ 
              rotate: [0, 5, 0, -5, 0],
              y: [0, -2, 0, -2, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <VIPOnlyLabel size="md" />
          </motion.div>
        </div>
      )}
      
      {isVIP && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 20px rgba(234, 179, 8, 0)',
              '0 0 40px rgba(234, 179, 8, 0.2)',
              '0 0 20px rgba(234, 179, 8, 0)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      <div className={cn(
        "relative",
        isVIP && "border-yellow-500/30 hover:border-yellow-500/50"
      )}>
        {children}
      </div>
    </div>
  );
};
