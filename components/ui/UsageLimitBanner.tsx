'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Crown, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { VIPTier } from '@/lib/vip-types';

interface UsageLimitBannerProps {
  featureName: string;
  currentUsage: number;
  limit: number;
  tier: VIPTier;
  showUpgrade?: boolean;
}

export const UsageLimitBanner = ({
  featureName,
  currentUsage,
  limit,
  tier,
  showUpgrade = true
}: UsageLimitBannerProps) => {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const percentage = limit > 0 ? (currentUsage / limit) * 100 : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = currentUsage >= limit;

  if (dismissed || limit === -1) return null; // -1 means unlimited

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative rounded-xl p-4 mb-4 border-2 ${
          isAtLimit
            ? 'bg-red-500/10 border-red-500/30'
            : isNearLimit
            ? 'bg-yellow-500/10 border-yellow-500/30'
            : 'bg-blue-500/10 border-blue-500/30'
        }`}
      >
        {/* Dismiss Button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 p-2 rounded-lg ${
            isAtLimit
              ? 'bg-red-500/20'
              : isNearLimit
              ? 'bg-yellow-500/20'
              : 'bg-blue-500/20'
          }`}>
            {isAtLimit ? (
              <AlertCircle className="w-6 h-6 text-red-400" />
            ) : (
              <TrendingUp className={`w-6 h-6 ${
                isNearLimit ? 'text-yellow-400' : 'text-blue-400'
              }`} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">
              {isAtLimit ? 'Đã đạt giới hạn' : isNearLimit ? 'Sắp đạt giới hạn' : 'Sử dụng trong ngày'}
            </h4>
            <p className="text-sm text-gray-400 mb-3">
              {featureName}: <strong className={isAtLimit ? 'text-red-400' : 'text-white'}>
                {currentUsage}/{limit === -1 ? '∞' : limit}
              </strong> lượt
            </p>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentage, 100)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full ${
                  isAtLimit
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : isNearLimit
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}
              />
            </div>

            {/* Upgrade CTA */}
            {showUpgrade && isNearLimit && tier === VIPTier.FREE && (
              <Button
                onClick={() => router.push('/vip/plans')}
                size="sm"
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 font-bold"
              >
                <Crown className="w-4 h-4 mr-1" />
                Nâng cấp VIP để không giới hạn
              </Button>
            )}

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

