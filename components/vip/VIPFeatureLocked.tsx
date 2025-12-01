'use client';

import { motion } from 'framer-motion';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { VIPUpgradePopup } from '@/components/vip/VIPUpgradePopup';
import { VIPTier } from '@/lib/vip-types';

interface VIPFeatureLockedProps {
  featureName: string;
  description?: string;
  requiredTier?: VIPTier;
  children?: React.ReactNode;
  blur?: boolean;
}

export const VIPFeatureLocked = ({ 
  featureName, 
  description, 
  requiredTier = VIPTier.VIP,
  children,
  blur = true 
}: VIPFeatureLockedProps) => {
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);

  return (
    <>
      <div className="relative">
        {/* Blurred Content */}
        {children && (
          <div className={blur ? 'filter blur-sm pointer-events-none select-none' : 'pointer-events-none select-none opacity-50'}>
            {children}
          </div>
        )}

        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-sm rounded-2xl flex items-center justify-center"
        >
          <div className="text-center p-8 max-w-md">
            {/* Lock Icon with Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-2 border-yellow-500/30 mb-6 relative"
            >
              <Lock className="w-10 h-10 text-yellow-400" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2"
              >
                <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white mb-3"
            >
              Tính năng VIP
            </motion.h3>

            {/* Feature Name */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-yellow-400 font-semibold mb-2"
            >
              {featureName}
            </motion.p>

            {/* Description */}
            {description && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-400 mb-6"
              >
                {description}
              </motion.p>
            )}

            {/* CTA Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={() => setShowUpgradePopup(true)}
                className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 font-bold py-3 px-6 rounded-xl shadow-lg shadow-yellow-500/30 border-2 border-yellow-300"
              >
                <Crown className="w-5 h-5 mr-2" />
                Nâng cấp VIP
              </Button>
            </motion.div>

            {/* Info Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-gray-500 text-xs mt-4"
            >
              👑 Không giới hạn + Đầy đủ tính năng
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Upgrade Popup */}
      <VIPUpgradePopup
        isOpen={showUpgradePopup}
        onClose={() => setShowUpgradePopup(false)}
        featureName={featureName}
        requiredTier={requiredTier}
      />
    </>
  );
};
