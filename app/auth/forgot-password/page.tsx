'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Sparkles, Star, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://w3l0qc4g2h.execute-api.ap-southeast-1.amazonaws.com/dev'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsEmailSent(true);
        toast.success('Email khôi phục mật khẩu đã được gửi!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
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
              Email đã được gửi!
            </h2>

            <p className="text-gray-400 mb-8 text-sm font-light">
              Chúng tôi đã gửi một email khôi phục mật khẩu đến <span className="text-white font-semibold">{email}</span>.
              Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full relative group overflow-hidden rounded-xl p-[1px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 animate-gradient-xy opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gray-900/90 hover:bg-gray-900/80 rounded-xl py-3.5 px-6 transition-all duration-300">
                  <span className="font-medium text-white">Quay lại đăng nhập</span>
                </div>
              </button>

              <button
                onClick={() => setIsEmailSent(false)}
                className="w-full text-gray-400 hover:text-white transition-colors py-2 text-sm"
              >
                Gửi lại email
              </button>
            </div>
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
              Quên mật khẩu?
            </h1>
            <p className="text-gray-400 text-sm font-light">
              Đừng lo lắng, hãy nhập email để nhận liên kết khôi phục
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
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
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 -z-10 blur-sm" />
            </motion.div>

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
                    <span className="font-medium text-white">Gửi email khôi phục</span>
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
