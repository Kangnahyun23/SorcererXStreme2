'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Sparkles, Star, Moon, ArrowLeft } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { authApi } from '@/lib/api-client';
import toast from 'react-hot-toast';
import Link from 'next/link';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token || !email) {
            toast.error('Link không hợp lệ (thiếu token hoặc email)');
            return;
        }

        if (!password || !confirmPassword) {
            toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        if (password.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setIsLoading(true);
        try {
            await authApi.resetPassword(email, token, password);
            toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
            router.push('/auth/login');
        } catch (error) {
            console.error(error);
            toast.error('Đặt lại mật khẩu thất bại. Token có thể đã hết hạn.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Liên kết không hợp lệ</h2>
                <p className="text-gray-400 mb-6">Liên kết đặt lại mật khẩu này thiếu token hoặc không hợp lệ.</p>
                <Link href="/auth/login" className="text-white hover:text-purple-300 underline">Quay lại đăng nhập</Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 relative">
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="group relative"
            >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-400 transition-colors duration-300">
                    <Lock size={20} />
                </div>
                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all duration-300"
                    disabled={isLoading}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 -z-10 blur-sm" />
            </motion.div>

            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="group relative"
            >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-400 transition-colors duration-300">
                    <Lock size={20} />
                </div>
                <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all duration-300"
                    disabled={isLoading}
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 -z-10 blur-sm" />
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                <button
                    type="submit"
                    className="w-full relative group overflow-hidden rounded-xl p-[1px]"
                    disabled={isLoading}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-purple-600 animate-gradient-xy opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-gray-900/90 hover:bg-gray-900/80 rounded-xl py-4 px-6 transition-all duration-300 flex items-center justify-center gap-2">
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span className="font-medium bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Đặt lại mật khẩu</span>
                                <Sparkles size={16} className="text-yellow-200" />
                            </>
                        )}
                    </div>
                </button>
            </motion.div>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans text-white">
            <Link
                href="/"
                className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 border border-white/5 transition-colors">
                    <ArrowLeft size={18} />
                </div>
                <span className="font-medium">Trang chủ</span>
            </Link>
            <AnimatedBackground />

            {/* Mystical Floating Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ y: [0, -30, 0], rotate: [0, 10, 0], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-10 text-purple-500/20"
                >
                    <Star size={60} />
                </motion.div>
                <motion.div
                    animate={{ y: [0, 40, 0], rotate: [0, -5, 0], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-1/3 right-10 text-red-500/20"
                >
                    <Moon size={90} />
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Card Container */}
                <div className="relative backdrop-blur-xl bg-black/30 rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_-12px_rgba(255,0,0,0.25)] overflow-hidden">

                    {/* Card Glow Effect */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-600/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl" />

                    <div className="relative text-center mb-8">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-white/10 mb-4 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                        >
                            <Sparkles className="w-8 h-8 text-red-400" />
                        </motion.div>
                        <motion.h1
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-bold bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent"
                            style={{ fontFamily: 'Pacifico, cursive' }}
                        >
                            Cấp lại mật khẩu
                        </motion.h1>
                    </div>
                    <Suspense fallback={<div className="text-center text-gray-400">Đang tải...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </motion.div>
        </div>
    );
}
