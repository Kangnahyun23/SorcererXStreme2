'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, CheckCircle, XCircle, Sparkles, Star, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import toast from 'react-hot-toast';
import Link from 'next/link';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInvalidToken, setIsInvalidToken] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setIsInvalidToken(true);
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error('Mật khẩu phải chứa ít nhất 1 chữ hoa');
      return;
    }

    if (!/[a-z]/.test(password)) {
      toast.error('Mật khẩu phải chứa ít nhất 1 chữ thường');
      return;
    }

    if (!/[0-9]/.test(password)) {
      toast.error('Mật khẩu phải chứa ít nhất 1 số');
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      toast.error('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        setIsSuccess(true);
        toast.success('Đặt lại mật khẩu thành công!');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        const error = await response.json();
        if (error.message?.includes('expired') || error.message?.includes('invalid')) {
          setIsInvalidToken(true);
          toast.error('Liên kết đã hết hạn hoặc không hợp lệ');
        } else {
          toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
        }
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInvalidToken) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans text-white">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="relative backdrop-blur-xl bg-black/30 rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_-12px_rgba(255,0,0,0.25)] text-center overflow-hidden">
            {/* Card Glow Effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl" />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              <XCircle className="w-10 h-10 text-red-400" />
            </motion.div>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent mb-4" style={{ fontFamily: 'Pacifico, cursive' }}>
              Liên kết không hợp lệ
            </h2>

            <p className="text-gray-400 mb-8 text-sm font-light">
              Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu liên kết mới.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => router.push('/auth/forgot-password')}
                className="w-full relative group overflow-hidden rounded-xl p-[1px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-purple-600 animate-gradient-xy opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gray-900/90 hover:bg-gray-900/80 rounded-xl py-3.5 px-6 transition-all duration-300">
                  <span className="font-medium text-white">Yêu cầu liên kết mới</span>
                </div>
              </button>

              <Link
                href="/auth/login"
                className="block w-full text-gray-400 hover:text-white transition-colors py-2 text-sm"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans text-white">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="relative backdrop-blur-xl bg-black/30 rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_-12px_rgba(255,0,0,0.25)] text-center overflow-hidden">
            {/* Card Glow Effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-600/20 rounded-full blur-3xl" />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <CheckCircle className="w-10 h-10 text-green-400" />
            </motion.div>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-green-200 to-white bg-clip-text text-transparent mb-4" style={{ fontFamily: 'Pacifico, cursive' }}>
              Thành công!
            </h2>

            <p className="text-gray-400 mb-8 text-sm font-light">
              Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển đến trang đăng nhập.
            </p>

            <button
              onClick={() => router.push('/auth/login')}
              className="w-full relative group overflow-hidden rounded-xl p-[1px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 animate-gradient-xy opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-gray-900/90 hover:bg-gray-900/80 rounded-xl py-3.5 px-6 transition-all duration-300">
                <span className="font-medium text-white">Đăng nhập ngay</span>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans text-white">
      <AnimatedBackground />

      {/* Mystical Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [0, -30, 0], rotate: [0, 10, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-10 text-purple-500/20"
        >
          <Star size={60} />
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
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl" />

          <div className="relative text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 mb-4 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              <Sparkles className="w-8 h-8 text-purple-400" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent mb-2" style={{ fontFamily: 'Pacifico, cursive' }}>
              Đặt lại mật khẩu
            </h1>
            <p className="text-gray-400 text-sm font-light">
              Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="group relative"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors duration-300">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu mới"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 -z-10 blur-sm" />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="group relative"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors duration-300">
                <Lock size={20} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 -z-10 blur-sm" />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                type="submit"
                className="w-full relative group overflow-hidden rounded-xl p-[1px]"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-red-600 animate-gradient-xy opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gray-900/90 hover:bg-gray-900/80 rounded-xl py-4 px-6 transition-all duration-300 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="font-medium text-white">Đặt lại mật khẩu</span>
                  )}
                </div>
              </button>
            </motion.div>
          </form>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400 text-sm">
              Nhớ mật khẩu rồi?{' '}
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors hover:underline decoration-purple-500/30 underline-offset-4">
                Đăng nhập
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
