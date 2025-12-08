'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Mail, Clock, Calendar, Check, AlertCircle, Save, Loader2, X, Edit } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { reminderApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface ReminderSettingsState {
    emailEnabled: boolean;
    email: string;
    dailyHoroscope: boolean;
    weeklyFortune: boolean;
    monthlyInsight: boolean;
    timezone: string;
}

export function ReminderSettings() {
    const { token, user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [isEditing, setIsEditing] = useState(true);

    const [settings, setSettings] = useState<ReminderSettingsState>({
        emailEnabled: false,
        email: user?.email || '',
        dailyHoroscope: false,
        weeklyFortune: false,
        monthlyInsight: false,
        timezone: 'Asia/Ho_Chi_Minh'
    });

    useEffect(() => {
        const loadSettings = async () => {
            if (!token) return;
            try {
                const data = await reminderApi.get(token);
                // Map backend snake_case to frontend camelCase
                const mappedSettings = {
                    emailEnabled: data.is_subscribed ?? false,
                    email: user?.email || '', // Backend doesn't return email in settings data, use auth user
                    dailyHoroscope: true, // Default to true as backend simplifies this
                    weeklyFortune: true,
                    monthlyInsight: true,

                    timezone: 'Asia/Ho_Chi_Minh',
                };

                setSettings(mappedSettings);

                if (mappedSettings.emailEnabled) {
                    setIsEditing(false);
                }
            } catch (error) {
                console.log('No existing settings found, using defaults');
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, [token, user?.email]);

    const handleSave = async (isUnsubscribing = false) => {
        if (!token) {
            toast.error('Vui lòng đăng nhập lại');
            return;
        }

        setSaving(true);
        try {
            // Map frontend camelCase to backend snake_case
            // Spec: { is_subscribed: boolean, preferred_time?: string }
            const payload = {
                is_subscribed: isUnsubscribing ? false : settings.emailEnabled
            };

            if (isUnsubscribing) {
                setSettings(prev => ({ ...prev, emailEnabled: false }));
            }

            await reminderApi.update(payload, token);

            const message = isUnsubscribing ? 'Đã hủy đăng ký nhắc nhở' : 'Đã lưu cài đặt nhắc nhở';
            toast.success(message);

            if (!isUnsubscribing) {
                setSavedSuccess(true);
                setTimeout(() => {
                    setSavedSuccess(false);
                    setIsEditing(false);
                }, 1500);
            } else {
                setIsEditing(true);
            }
        } catch (error: any) {
            console.error('Failed to save settings:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi lưu cài đặt');
        } finally {
            setSaving(false);
        }
    };

    const handleUnsubscribe = () => {
        if (confirm('Bạn có chắc chắn muốn hủy đăng ký tất cả nhắc nhở không?')) {
            handleSave(true);
        }
    };

    const disabledStyle = !isEditing ? "opacity-60 pointer-events-none grayscale-[0.3]" : "";
    const inputDisabledStyle = !isEditing ? "opacity-60 pointer-events-none bg-black/60 text-gray-400" : "bg-black/40";

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 bg-white/5 rounded-3xl border border-white/10">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />

            <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Cài Đặt Nhắc Nhở</h2>
                    <p className="text-blue-300/70 text-sm">Nhận thông báo tử vi và lá số định kỳ</p>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                <div className={`flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 ${disabledStyle}`}>
                    <div className="flex items-center gap-3">
                        <Mail className={`w-5 h-5 ${settings.emailEnabled ? 'text-green-400' : 'text-gray-400'}`} />
                        <div>
                            <p className="font-medium text-white">Nhận thông báo qua Email</p>
                            <p className="text-xs text-gray-400">Gửi tử vi trực tiếp vào hòm thư của bạn</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.emailEnabled}
                            disabled={!isEditing}
                            onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className={`w-11 h-6 rounded-full peer-focus:outline-none transition-colors duration-200 relative ${settings.emailEnabled ? 'bg-green-600' : 'bg-gray-700'}`}>
                            <div className={`absolute top-[2px] left-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-transform duration-200 ${settings.emailEnabled ? 'translate-x-full border-white' : ''}`}></div>
                        </div>
                    </label>
                </div>

                <AnimatePresence>
                    {settings.emailEnabled && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-6 overflow-hidden"
                        >
                            <div className={`space-y-2 ${disabledStyle}`}>
                                <label className="text-sm font-medium text-gray-300">Email nhận thông báo</label>
                                <Input
                                    type="email"
                                    value={settings.email}
                                    disabled={!isEditing}
                                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                    placeholder="name@example.com"
                                    className={`border-white/10 focus:border-blue-500/50 ${inputDisabledStyle}`}
                                />
                            </div>

                            {/* Removed 'Loại thông báo' section as per user request */}

                            <div className={`bg-black/20 rounded-xl p-5 border border-white/5 space-y-4 ${disabledStyle}`}>
                                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-2">
                                    <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-200">
                                        Email sẽ được gửi tự động mỗi ngày vào 08:00 sáng. Hãy kiểm tra cả hộp thư Spam nhé.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-4">
                                {!isEditing ? (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="flex-1 bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-indigo-900/80 hover:from-indigo-800/90 hover:via-purple-800/90 hover:to-indigo-800/90 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] text-white hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.5)] transition-all duration-300 relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                        <Edit className="w-4 h-4 mr-2 relative z-10" />
                                        <span className="relative z-10">Chỉnh sửa cài đặt</span>
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleSave(false)}
                                        disabled={saving || savedSuccess}
                                        className={`flex-1 transition-all duration-300 ${savedSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'}`}
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Đang lưu...
                                            </>
                                        ) : savedSuccess ? (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                Đã lưu thành công!
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Lưu thay đổi
                                            </>
                                        )}
                                    </Button>
                                )}

                                <Button
                                    variant="ghost"
                                    onClick={handleUnsubscribe}
                                    disabled={saving || (!isEditing && !settings.emailEnabled)}
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Hủy đăng ký
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!settings.emailEnabled && (
                    <div className="text-center p-6 border-t border-white/10">
                        <p className="text-gray-500 text-sm italic">
                            Bật tính năng email để không bỏ lỡ những thông điệp vũ trụ dành riêng cho bạn mỗi ngày.
                        </p>
                    </div>
                )}
            </div>
        </motion.div >
    );
}
