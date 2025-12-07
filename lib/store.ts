import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, profileApi, partnerApi } from './api-client';

interface User {
  id: string;
  email: string;
  name?: string;
  gender?: string;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
  is_vip?: boolean;
  vipTier?: string;
  vipExpiresAt?: string;
  isProfileComplete?: boolean;
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
  upgradeToVip: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: async (email, password) => {
        try {
          const { token, user } = await authApi.login(email, password);

          // Cookie fallback
          document.cookie = `token=${token}; path=/; max-age=604800;`;
          const isProfileComplete = !!(user.name && user.birth_date && user.birth_time && user.birth_place);

          // Map snake_case from backend to camelCase for frontend
          const mappedUser = {
            ...user,
            isProfileComplete,
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

      register: async (email: string, password: string) => {
        try {
          const { token, user } = await authApi.register(email, password);

          // Save token and user after successful registration
          const mappedUser = {
            ...user,
            isProfileComplete: false, // New registration has incomplete profile
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
        if (token) {
          try {
            const updatedUser = await profileApi.update({ name, gender, birth_date, birth_time, birth_place }, token);
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
            const user = await profileApi.update({
              name,
              birth_date: birthDate,
              birth_time: birthTime,
              birth_place: birthPlace
            }, token);
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
        useProfileStore.getState().clear();
      },

      upgradeToVip: async () => {
        const { token, user } = get();
        if (!token || !user) {
          throw new Error('Not authenticated');
        }

        try {
          const response = await profileApi.upgradeToVIP(token);
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
  isLoading: boolean;
  error: string | null;
  fetchPartner: () => Promise<void>;
  addPartner: (partnerData: Omit<Partner, 'id' | 'startDate'>) => Promise<void>;
  updatePartner: (partnerData: Partial<Partner>) => void;
  breakup: () => Promise<void>;
  moveOn: () => void;
  confirmRecovery: () => void;
  clear: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      partner: null,
      breakupData: null,
      isLoading: false,
      error: null,

      fetchPartner: async () => {
        const token = useAuthStore.getState().token;
        if (!token) return;

        set({ isLoading: true, error: null });
        try {
          const partnerData = await partnerApi.get(token);

          if (partnerData) {
            // Map snake_case to camelCase
            // Backend returns partner_name, partner_gender, partner_birth_date, relationship start date (or created_at)
            const mappedPartner: Partner = {
              id: partnerData.id?.toString() || partnerData.partner_id?.toString() || 'unknown',
              name: partnerData.partner_name,
              gender: partnerData.partner_gender,
              birthDate: partnerData.partner_birth_date,
              birthTime: partnerData.partner_birth_time || '',
              birthPlace: partnerData.partner_birth_place || '',
              startDate: partnerData['relationship start date'] || partnerData.created_at || partnerData.createdAt || new Date().toISOString()
            };
            set({ partner: mappedPartner, breakupData: null });
          } else {
            set({ partner: null });
          }
        } catch (error: any) {
          // Silence expected 404/No partner errors
          if (error.message?.includes('404') || error.message?.includes('No partner') || error.message?.includes('not found') || error.message === 'Request failed') {
            set({ partner: null });
          } else {
            console.error('Failed to fetch partner:', error);
            set({ error: error.message });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      addPartner: async (partnerData) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          throw new Error('Not authenticated');
        }

        set({ isLoading: true, error: null });
        try {
          const validGender = (partnerData.gender === 'male' || partnerData.gender === 'female') ? partnerData.gender : 'female';

          const payload = {
            partner_name: partnerData.name,
            partner_gender: validGender,
            // Backend validation requires ISO string for date
            partner_birth_date: new Date(partnerData.birthDate).toISOString(),
            partner_birth_time: partnerData.birthTime,
            partner_birth_place: partnerData.birthPlace
          };

          const response = await partnerApi.add(payload, token);
          const backendPartner = response.partner || response.data || response;

          const newPartner: Partner = {
            id: backendPartner.id?.toString() || 'temp-id',
            name: backendPartner.partner_name,
            gender: backendPartner.partner_gender,
            birthDate: backendPartner.partner_birth_date,
            birthTime: backendPartner.partner_birth_time || '',
            birthPlace: backendPartner.partner_birth_place || '',
            startDate: backendPartner['relationship start date'] || backendPartner.created_at || new Date().toISOString()
          };

          set({ partner: newPartner, breakupData: null });
        } catch (error: any) {
          console.error('Failed to add partner:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updatePartner: (partnerData) => {
        const { partner } = get();
        if (partner) {
          const updated = { ...partner, ...partnerData };
          set({ partner: updated });
        }
      },

      breakup: async () => {
        const { partner } = get();
        const token = useAuthStore.getState().token;

        if (partner) {
          try {
            if (token) {
              await partnerApi.remove(token);
            }

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
          } catch (e) {
            console.error('Breakup sync failed', e);
            // Still perform local breakup
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
          }
        }
      },

      moveOn: () => {
        set({ breakupData: null, partner: null });
      },

      confirmRecovery: () => {
        set({ breakupData: null });
      },

      clear: () => set({ partner: null, breakupData: null, error: null, isLoading: false })
    }),
    {
      name: 'profile-storage',
    }
  )
);
