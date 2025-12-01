'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Calendar, Clock, MapPin, Sparkles, Star, Moon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import toast from 'react-hot-toast';

export default function CompleteProfilePage() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated, completeProfile, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !birthDate || !birthTime || !birthPlace) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!token) {
      toast.error('Phiên đăng nhập không hợp lệ');
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    try {
      // completeProfile expects: name, gender, birth_date, birth_time, birth_place, token
      await completeProfile(
        name,
        gender,
        birthDate,
        birthTime,
        birthPlace,
        token
      );

      toast.success('Cập nhật hồ sơ thành công!');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Cập nhật thất bại, vui lòng thử lại');
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
          animate={{ y: [0, -40, 0], rotate: [0, 15, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-20 text-amber-500/20"
        >
          <Star size={50} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-20 text-orange-500/20"
        >
          <Moon size={70} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="relative backdrop-blur-xl bg-black/30 rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_-12px_rgba(255,0,0,0.25)] overflow-hidden">

          {/* Card Glow Effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-600/20 rounded-full blur-3xl" />

          <div className="relative text-center mb-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 mb-4 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <User className="w-8 h-8 text-amber-400" />
            </motion.div>
            <motion.h1
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent"
              style={{ fontFamily: 'Pacifico, cursive' }}
            >
              Hoàn tất hồ sơ
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-sm mt-2 font-light tracking-wide"
            >
              Hãy cho chúng tôi biết thêm về bạn để bắt đầu hành trình
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="group relative"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-400 transition-colors duration-300">
                <User size={20} />
              </div>
              <input
                type="text"
                placeholder="Họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all duration-300"
                disabled={isLoading}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 -z-10 blur-sm" />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="group relative"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-400 transition-colors duration-300">
                <User size={20} />
              </div>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all duration-300 appearance-none"
                disabled={isLoading}
              >
                <option value="male" className="bg-gray-900 text-white">Nam</option>
                <option value="female" className="bg-gray-900 text-white">Nữ</option>
                <option value="other" className="bg-gray-900 text-white">Khác</option>
              </select>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 -z-10 blur-sm" />
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="group relative"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-400 transition-colors duration-300">
                  <Calendar size={20} />
                </div>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all duration-300 [color-scheme:dark]"
                  disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 -z-10 blur-sm" />
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="group relative"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-400 transition-colors duration-300">
                  <Clock size={20} />
                </div>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all duration-300 [color-scheme:dark]"
                  disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 -z-10 blur-sm" />
              </motion.div>
            </div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="group relative"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-400 transition-colors duration-300">
                <MapPin size={20} />
              </div>
              <input
                type="text"
                placeholder="Nơi sinh (Tỉnh/Thành phố)"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all duration-300"
                disabled={isLoading}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500 -z-10 blur-sm" />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <button
                type="submit"
                className="w-full relative group overflow-hidden rounded-xl p-[1px]"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 animate-gradient-xy opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gray-900/90 hover:bg-gray-900/80 rounded-xl py-4 px-6 transition-all duration-300 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="font-medium bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Hoàn tất hồ sơ</span>
                      <Sparkles size={16} className="text-amber-200" />
                    </>
                  )}
                </div>
              </button>
            </motion.div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 font-light">
              Thông tin của bạn sẽ được bảo mật tuyệt đối và chỉ sử dụng cho mục đích tử vi.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
