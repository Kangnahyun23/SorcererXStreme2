'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, profileApi } from './api-client';

interface User {
  id: string;
  email: string;
  name?: string;
  gender?: string;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
  isProfileComplete: boolean;
  is_vip?: boolean;
  vipTier?: string;
  vipExpiresAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  completeProfile: (name: string, gender: string, birth_date: string, birth_time: string, birth_place: string, token: string) => Promise<void>;
  updateProfile: (name: string, birthDate: string, birthTime: string, birthPlace: string, token: string) => Promise<void>;
  logout: () => void;
  upgradeToVip: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: async (email: string, password: string) => {
        console.log('login called');
        try {
          const { token, user } = await authApi.login(email, password);
          console.log('login user from backend:', user);
          console.log('Profile fields check:', {
            name: user.name,
            birth_date: user.birth_date,
            birth_time: user.birth_time,
            birth_place: user.birth_place
          });

          document.cookie = `token=${token}; path=/; max-age=604800;`;
          const isProfileComplete = !!(user.name && user.birth_date && user.birth_time && user.birth_place);
          console.log('isProfileComplete:', isProfileComplete);

          // Map snake_case từ backend sang camelCase cho frontend
          const mappedUser = {
            ...user,
            isProfileComplete,
            vipTier: user.vip_tier,
            vipExpiresAt: user.vip_expires_at,
          };
          console.log('mappedUser with VIP fields:', mappedUser);

          set({ user: mappedUser, isAuthenticated: true, token });
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      },

      register: async (email: string, password: string) => {
        try {
          const { token, user } = await authApi.register(email, password);
          console.log('register user from backend:', user);
          console.log('register token:', token);
          
          // Lưu token và user sau khi đăng ký thành công
          const mappedUser = {
            ...user,
            isProfileComplete: false, // Mới đăng ký chưa hoàn thiện profile
            vipTier: user.vip_tier,
            vipExpiresAt: user.vip_expires_at,
          };
          
          set({ user: mappedUser, isAuthenticated: true, token });
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      },

      completeProfile: async (name: string, gender: string, birth_date: string, birth_time: string, birth_place: string, token: string) => {
        console.log('completeProfile called');
        if (token) {
          try {
            const updatedUser = await profileApi.update({ name, gender, birth_date, birth_time, birth_place }, token);
            console.log('completeProfile updatedUser:', updatedUser);
            // Map snake_case từ backend sang camelCase
            const mappedUser = {
              ...get().user,
              ...updatedUser,
              isProfileComplete: true,
              vipTier: updatedUser.vip_tier || get().user?.vipTier,
              vipExpiresAt: updatedUser.vip_expires_at || get().user?.vipExpiresAt,
            };
            set({ user: mappedUser });
          } catch (error) {
            console.error(error);
            throw error;
          }
        }
      },

      updateProfile: async (name: string, birthDate: string, birthTime: string, birthPlace: string, token: string) => {
        if (token) {
          try {
            // Convert to snake_case for backend
            const user = await profileApi.update({ 
              name, 
              birth_date: birthDate, 
              birth_time: birthTime, 
              birth_place: birthPlace 
            }, token);
            // Map snake_case từ backend sang camelCase
            const mappedUser = {
              ...user,
              vipTier: user.vip_tier,
              vipExpiresAt: user.vip_expires_at,
            };
            set({ user: mappedUser });
          } catch (error) {
            console.error(error);
          }
        }
      },

      logout: () => {
        document.cookie = 'token=; path=/; max-age=0';
        set({ user: null, isAuthenticated: false, token: null });
      },

      upgradeToVip: async () => {
        const { token, user } = get();
        if (!token || !user) {
          throw new Error('Not authenticated');
        }

        try {
          const response = await profileApi.upgradeToVIP(token);
          // Update user trong store với dữ liệu mới từ server
          set({ 
            user: { 
              ...user, 
              is_vip: response.user.is_vip,
              vipTier: response.user.vip_tier,
              vipExpiresAt: response.user.vip_expires_at,
              isProfileComplete: true
            } 
          });
          return true;
        } catch (error) {
          console.error('Upgrade VIP error:', error);
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'tarot' | 'astrology' | 'numerology';
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  sessionId: string | null;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setSessionId: (sessionId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  sessionId: null,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    }]
  })),

  clearMessages: () => set({ messages: [] }),

  setLoading: (loading) => set({ isLoading: loading }),

  setSessionId: (sessionId) => set({ sessionId })
}));

export interface Partner {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  gender: 'male' | 'female' | 'other';
  startDate: string;
  relationship?: string;
}

export interface BreakupData {
  isActive: boolean;
  partnerName: string;
  partnerInfo: Partner;
  breakupDate: string;
  autoDeleteDate: string;
  weeklyCheckDone: boolean[];
}

interface ProfileState {
  partner: Partner | null;
  breakupData: BreakupData | null;
  addPartner: (partnerData: Omit<Partner, 'id' | 'startDate'>) => void;
  updatePartner: (partnerData: Partial<Partner>) => void;
  breakup: () => void;
  confirmRecovery: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      partner: null,
      breakupData: null,

      addPartner: (partnerData) => {
        const newPartner: Partner = {
          ...partnerData,
          id: Date.now().toString(),
          startDate: new Date().toISOString()
        };
        set({ partner: newPartner, breakupData: null });
      },

      updatePartner: (partnerData) => {
        const { partner } = get();
        if (partner) {
          set({ partner: { ...partner, ...partnerData } });
        }
      },

      breakup: () => {
        const { partner } = get();
        if (partner) {
          const breakupDate = new Date();
          const autoDeleteDate = new Date(breakupDate);
          autoDeleteDate.setMonth(autoDeleteDate.getMonth() + 1);

          const breakupData: BreakupData = {
            isActive: true,
            partnerName: partner.name,
            partnerInfo: partner,
            breakupDate: breakupDate.toISOString(),
            autoDeleteDate: autoDeleteDate.toISOString(),
            weeklyCheckDone: []
          };

          set({ partner: null, breakupData });

          setTimeout(() => {
            const { breakupData: currentBreakupData } = get();
            if (currentBreakupData && currentBreakupData.isActive) {
              set({ breakupData: null });
            }
          }, 30 * 24 * 60 * 60 * 1000);
        }
      },

      confirmRecovery: () => {
        set({ breakupData: null });
      }
    }),
    {
      name: 'profile-storage'
    }
  )
);
