'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Sparkles, Star, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { authApi } from '@/lib/api-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast.success('Đã gửi mã xác nhận đến email!');
      setStep('confirm');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
      router.push('/auth/login');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Đặt lại mật khẩu thất bại. Mã xác nhận có thể không đúng.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans text-white">
      <AnimatedBackground />

      {/* Mystical Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 text-blue-500/20"
        >
          <Moon size={80} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="relative backdrop-blur-xl bg-black/30 rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_-12px_rgba(255,0,0,0.25)] overflow-hidden">

          {/* Card Glow Effect */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl" />

          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Quay lại
          </Link>

          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 mb-4 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              <Sparkles className="w-8 h-8 text-blue-400" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Pacifico, cursive' }}>
              {step === 'request' ? 'Quên mật khẩu?' : 'Đặt lại mật khẩu'}
            </h1>
            <p className="text-gray-400 text-sm font-light">
              {step === 'request'
                ? 'Đừng lo lắng, hãy nhập email để nhận mã xác nhận'
                : 'Nhập mã xác nhận từ email và mật khẩu mới'}
            </p>
          </div>

          <form onSubmit={step === 'request' ? handleRequestReset : handleConfirmReset} className="space-y-6 relative">
            {step === 'request' ? (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="group relative"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors duration-300">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  placeholder="Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
                  disabled={isLoading}
                />
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="text-center bg-white/5 rounded-lg p-3 border border-white/10 mb-4">
                  <p className="text-xs text-gray-400">Mã xác nhận đã gửi tới:</p>
                  <p className="text-sm font-medium text-white">{email}</p>
                </div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="group relative"
                >
                  <input
                    type="text"
                    name="code"
                    id="verification-code"
                    placeholder="Mã xác nhận (Code)"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-center text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300 tracking-widest text-lg font-mono"
                    disabled={isLoading}
                    autoComplete="one-time-code"
                    maxLength={6}
                  />
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="group relative"
                >
                  <input
                    type="password"
                    name="new-password"
                    id="new-password"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </motion.div>
              </div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button
                type="submit"
                className="w-full relative group overflow-hidden rounded-xl p-[1px]"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 animate-gradient-xy opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gray-900/90 hover:bg-gray-900/80 rounded-xl py-4 px-6 transition-all duration-300 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="font-medium text-white">
                      {step === 'request' ? 'Gửi mã xác nhận' : 'Đổi mật khẩu'}
                    </span>
                  )}
                </div>
              </button>
            </motion.div>
          </form>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400 text-sm">
              Nhớ mật khẩu rồi?{' '}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors hover:underline decoration-blue-500/30 underline-offset-4">
                Đăng nhập
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
