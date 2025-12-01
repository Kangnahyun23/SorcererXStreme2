'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, Star, Heart, Calendar, ArrowRight, MapPin, Clock, RotateCcw, User as UserIcon, Briefcase as BriefcaseIcon } from 'lucide-react';
import { Sidebar, useSidebarCollapsed } from '@/components/layout/Sidebar';
import { useAuthStore, useProfileStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { FormattedContent } from '@/components/ui/FormattedContent';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { horoscopeApi } from '@/lib/api-client';

type Tab = 'daily' | 'tuvi' | 'love';

export default function FortunePage() {
  const sidebarCollapsed = useSidebarCollapsed();
  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const { user, isAuthenticated, token } = useAuthStore();
  const { partner, breakupData } = useProfileStore();

  // States for Tu Vi
  const [tuviInput, setTuviInput] = useState({
    name: user?.name || '',
    gender: user?.gender || 'male',
    birthDate: user?.birth_date || '',
    birthTime: user?.birth_time || '',
    birthPlace: user?.birth_place || ''
  });
  const [tuviResult, setTuviResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync user data to form when user loads
  useEffect(() => {
    if (user) {
      // Format birth_date to dd/mm/yyyy for display
      let formattedBirthDate = '';
      if (user.birth_date) {
        const date = new Date(user.birth_date);
        if (!isNaN(date.getTime())) {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          formattedBirthDate = `${day}/${month}/${year}`;
        }
      }
      
      setTuviInput({
        name: user.name || '',
        gender: user.gender || 'male',
        birthDate: formattedBirthDate,
        birthTime: user.birth_time || '',
        birthPlace: user.birth_place || ''
      });
    }
  }, [user]);

  // Mock Daily Horoscope
  const dailyHoroscope = {
    general: "Hôm nay là một ngày tràn đầy năng lượng tích cực. Bạn sẽ cảm thấy hứng khởi và sẵn sàng đối mặt với mọi thử thách.",
    love: "Tình cảm thăng hoa, hãy dành thời gian cho người ấy.",
    career: "Công việc thuận lợi, có cơ hội thăng tiến hoặc nhận được lời khen ngợi.",
    luckyNumber: "8, 16, 24",
    luckyColor: "Xanh dương, Tím"
  };

  const handleTuviSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('[Fortune] Checking auth:', { 
        hasToken: !!token, 
        isAuthenticated, 
        user: user?.email 
      });
      
      if (!token || !isAuthenticated) {
        toast.error('Vui lòng đăng nhập để sử dụng tính năng này');
        setIsLoading(false);
        return;
      }

      // Validate required fields
      if (!tuviInput.name || !tuviInput.birthDate || !tuviInput.birthTime || !tuviInput.birthPlace) {
        toast.error('Vui lòng điền đầy đủ thông tin');
        setIsLoading(false);
        return;
      }

      // Format birth_date from dd/mm/yyyy to DD-MM-YYYY for Python AI
      const formatBirthDate = (dateStr: string) => {
        if (!dateStr) return dateStr;
        // Check if already in dd/mm/yyyy format
        if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/');
          return `${day}-${month}-${year}`;
        }
        // Fallback for other formats
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        }
        return dateStr;
      };

      const response = await horoscopeApi.getHoroscope({
        domain: 'horoscope',
        feature_type: 'natal_chart' as any,
        user_context: {
          name: tuviInput.name,
          gender: tuviInput.gender,
          birth_date: formatBirthDate(tuviInput.birthDate),
          birth_time: tuviInput.birthTime,
          birth_place: tuviInput.birthPlace
        }
      }, token);

      console.log('[Fortune] Backend response:', response);

      // Extract analysis from response (backend returns {analysis: answer})
      const analysis = response?.analysis || '';
      
      if (!analysis || analysis.trim() === '') {
        toast.error('Không nhận được kết quả từ hệ thống. Vui lòng thử lại');
        setIsLoading(false);
        return;
      }

      setTuviResult({
        analysis: analysis
      });

      toast.success('Đã lập lá số tử vi thành công!');
    } catch (error: any) {
      console.error('Error in Tu Vi:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi lập lá số');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-black font-sans text-white">
      <AnimatedBackground />
      <Sidebar />

      <main 
        className="flex-1 flex flex-col transition-all duration-200 relative z-10"
        style={{ marginLeft: sidebarCollapsed ? '80px' : '280px' }}
      >
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Star className="w-6 h-6 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 via-orange-200 to-yellow-200 bg-clip-text text-transparent" style={{ fontFamily: 'Pacifico, cursive' }}>
                Bói Toán & Tử Vi
              </h1>
              <p className="text-sm text-gray-400 font-light">Khám phá vận mệnh qua các vì sao</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-black/20 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-4 text-sm font-medium transition-all relative ${activeTab === 'daily' ? 'text-yellow-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Star className="w-4 h-4" />
              Tử Vi Hàng Ngày
            </div>
            {activeTab === 'daily' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('tuvi')}
            className={`flex-1 py-4 text-sm font-medium transition-all relative ${activeTab === 'tuvi' ? 'text-purple-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Moon className="w-4 h-4" />
              Lập Lá Số Tử Vi
            </div>
            {activeTab === 'tuvi' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('love')}
            className={`flex-1 py-4 text-sm font-medium transition-all relative ${activeTab === 'love' ? 'text-pink-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" />
              Bói Tình Duyên
            </div>
            {activeTab === 'love' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-400 to-rose-500" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'daily' && (
                <motion.div
                  key="daily"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Tử Vi Hôm Nay</h2>
                    <p className="text-gray-400">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-yellow-500/30 transition-all group">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Star className="w-6 h-6 text-yellow-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">Tổng Quan</h3>
                      <p className="text-gray-300 leading-relaxed">{dailyHoroscope.general}</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-pink-500/30 transition-all group">
                      <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Heart className="w-6 h-6 text-pink-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">Tình Cảm</h3>
                      <p className="text-gray-300 leading-relaxed">{dailyHoroscope.love}</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-blue-500/30 transition-all group">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <BriefcaseIcon className="w-6 h-6 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">Sự Nghiệp</h3>
                      <p className="text-gray-300 leading-relaxed">{dailyHoroscope.career}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 hover:border-purple-500/50 transition-all group">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">Con Số May Mắn</h3>
                      <div className="space-y-2">
                        <p className="text-gray-300"><span className="text-purple-300 font-semibold">Số:</span> {dailyHoroscope.luckyNumber}</p>
                        <p className="text-gray-300"><span className="text-purple-300 font-semibold">Màu:</span> {dailyHoroscope.luckyColor}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'tuvi' && (
                <motion.div
                  key="tuvi"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {!tuviResult ? (
                    <div className="max-w-2xl mx-auto">
                      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-xl">
                        <div className="text-center mb-8">
                          <h2 className="text-2xl font-bold text-white mb-2">Lập Lá Số Tử Vi</h2>
                          <p className="text-gray-400">Nhập thông tin chính xác để có kết quả luận giải chi tiết nhất</p>
                        </div>

                        <form onSubmit={handleTuviSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-300">Họ và tên</label>
                              <input
                                type="text"
                                value={tuviInput.name}
                                onChange={(e) => setTuviInput({ ...tuviInput, name: e.target.value })}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                                placeholder="Nguyễn Văn A"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-300">Giới tính</label>
                              <select
                                value={tuviInput.gender}
                                onChange={(e) => setTuviInput({ ...tuviInput, gender: e.target.value })}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all appearance-none"
                              >
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-300">Ngày sinh (Dương lịch)</label>
                              <input
                                type="text"
                                value={tuviInput.birthDate}
                                onChange={(e) => setTuviInput({ ...tuviInput, birthDate: e.target.value })}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                                placeholder="dd/mm/yyyy"
                                pattern="\d{2}/\d{2}/\d{4}"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-300">Giờ sinh</label>
                              <input
                                type="time"
                                value={tuviInput.birthTime}
                                onChange={(e) => setTuviInput({ ...tuviInput, birthTime: e.target.value })}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Nơi sinh</label>
                            <input
                              type="text"
                              value={tuviInput.birthPlace}
                              onChange={(e) => setTuviInput({ ...tuviInput, birthPlace: e.target.value })}
                              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                              placeholder="Hà Nội, TP.HCM..."
                            />
                          </div>

                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-4 text-lg shadow-lg shadow-purple-500/25"
                          >
                            {isLoading ? (
                              <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Đang luận giải...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Lập Lá Số
                              </>
                            )}
                          </Button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Kết Quả Luận Giải Tử Vi</h2>
                        <Button
                          onClick={() => setTuviResult(null)}
                          variant="secondary"
                          size="sm"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Lập lá số khác
                        </Button>
                      </div>

                      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                        <div className="flex items-center mb-6">
                          <Sparkles className="w-6 h-6 text-purple-400 mr-3" />
                          <h3 className="text-xl font-bold text-white">Lá Số Tử Vi - {tuviInput.name}</h3>
                        </div>
                        <FormattedContent content={tuviResult.analysis} className="text-gray-300 leading-relaxed space-y-4" />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'love' && (
                <motion.div
                  key="love"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <Heart className="w-12 h-12 text-pink-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Bói Tình Duyên</h2>
                  <p className="text-gray-400 max-w-md mx-auto mb-8">
                    Tính năng đang được cập nhật. Hãy quay lại sau để khám phá những bí ẩn về tình yêu của bạn!
                  </p>
                  <Button variant="secondary" disabled>
                    Sắp ra mắt
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
