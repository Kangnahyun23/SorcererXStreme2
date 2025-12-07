
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RequestOptions {
  method?: string;
  body?: any;
  token?: string;
}

async function apiRequest(endpoint: string, options: RequestOptions = {}) {
  const { method = 'GET', body, token } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const text = await response.text();
    let error;
    try {
      error = JSON.parse(text);
    } catch {
      error = { message: text || 'Request failed' };
    }
    throw new Error(error.message || 'Request failed');
  }

  if (response.status === 204) {
    return {};
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

import { signUp, signIn, signOut, fetchAuthSession, confirmSignUp } from 'aws-amplify/auth';

// ... existing code ...

export const authApi = {
  confirmSignUp: async (email: string, code: string) => {
    return await confirmSignUp({ username: email, confirmationCode: code });
  },

  register: async (email: string, password: string) => {
    // 1. Create user in Cognito
    await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
        },
      },
    });

    // 2. Sync user to Backend DB (using existing endpoint)
    // Note: We're sending password to backend too to maintain compatibility 
    // with existing backend logic that likely hashes it. 
    // In a pure Cognito setup, backend wouldn't need the password.
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: { email, password },
    });
  },

  login: async (email: string, password: string) => {
    // 1. Authenticate with Cognito
    let signInResult;
    try {
      signInResult = await signIn({ username: email, password });
    } catch (error: any) {
      // If user is already signed in (stale session), sign out and try again
      if (error.name === 'UserAlreadyAuthenticatedException' ||
        error.message?.includes('already a signed in user')) {
        await signOut();
        signInResult = await signIn({ username: email, password });
      } else {
        throw error;
      }
    }

    const { isSignedIn, nextStep } = signInResult;

    if (isSignedIn) {
      // 2. Authenticate with Backend to get Access Token
      // We ignore the Cognito token for now because our backend doesn't support it yet
      // This ensures 403 errors are resolved by using the backend's expected token
      return apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });
    }

    throw new Error(`Login incomplete. Next step: ${nextStep?.signInStep}`);
  },

  forgotPassword: (email: string) =>
    apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: { email },
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
    }),

  logout: async () => {
    await signOut();
  }
};

export const profileApi = {
  get: (token: string) =>
    apiRequest('/api/users/profile', { token }),

  update: (data: any, token: string) =>
    apiRequest('/api/users/complete-profile', {
      method: 'PUT',
      body: data,
      token,
    }),

  upgradeToVIP: (token: string, tier: string = 'VIP', durationDays: number = 30) =>
    apiRequest('/api/users/upgrade-vip', {
      method: 'POST',
      body: { tier, durationDays },
      token,
    }),
};

export const chatApi = {
  createSession: (token: string) =>
    apiRequest('/api/chat/new-session', {
      method: 'POST',
      token,
    }),

  sendMessage: (sessionId: string, message: string, token: string) =>
    apiRequest('/api/chat/message', {
      method: 'POST',
      body: { sessionId, message },
      token,
    }),
};

export const tarotApi = {
  getReading: (data: {
    domain: 'tarot';
    feature_type: 'overview' | 'question';
    user_context: {
      name: string;
      gender: string;
      birth_date: string;
      [key: string]: any;
    };
    partner_context?: {
      name: string;
      gender: string;
      birth_date: string;
      [key: string]: any;
    };
    data: {
      question: string | null;
      cards_drawn: Array<{
        card_name: string;
        is_upright: boolean;
        position?: string;
      }>;
    };
  }, token: string) =>
    apiRequest('/api/tarot/reading', {
      method: 'POST',
      body: data,
      token,
    }),
};

export const astrologyApi = {
  getReading: (data: {
    domain: 'astrology';
    feature_type: 'overview' | 'love';
    user_context: {
      name: string;
      gender: string;
      birth_date: string;
      birth_time?: string;
      birth_place?: string;
      [key: string]: any;
    };
    partner_context?: {
      name: string;
      gender: string;
      birth_date: string;
      birth_time?: string;
      birth_place?: string;
      [key: string]: any;
    };
  }, token: string) =>
    apiRequest('/api/astrology/reading', {
      method: 'POST',
      body: data,
      token,
    }),
};

export const numerologyApi = {
  getAnalysis: (data: {
    domain: 'numerology';
    feature_type: 'overview';
    user_context: {
      name: string;
      gender: string;
      birth_date: string;
      [key: string]: any;
    };
  }, token: string) =>
    apiRequest('/api/numerology', {
      method: 'POST',
      body: data,
      token,
    }),
};

export const horoscopeApi = {
  getHoroscope: (data: {
    domain: 'horoscope';
    feature_type: 'daily' | 'natal_chart';
    user_context: {
      name: string;
      gender: string;
      birth_date: string;
      birth_time?: string;
      birth_place?: string;
      [key: string]: any;
    };
    data?: {
      target_date?: string;
    };
  }, token: string) => {
    // Xác định endpoint dựa vào feature_type
    const endpoint = data.feature_type === 'daily'
      ? '/api/horoscope/daily'
      : '/api/horoscope/natal';

    return apiRequest(endpoint, {
      method: 'POST',
      body: data,
      token,
    });
  },
};

export const partnerApi = {
  add: (data: {
    partner_name: string;
    partner_gender: 'male' | 'female' | 'other';
    partner_birth_date: string;
    partner_birth_time?: string;
    partner_birth_place?: string;
  }, token: string) =>
    apiRequest('/api/partners/', {
      method: 'POST',
      body: data,
      token,
    }),

  remove: (token: string) =>
    apiRequest('/api/partners/', {
      method: 'DELETE',
      token,
    }),

  get: (token: string) =>
    apiRequest('/api/partners/', {
      method: 'GET',
      token,
    }),
};

export const reminderApi = {
  get: (token: string) =>
    apiRequest('/api/reminders', { token }),

  update: (data: {
    emailEnabled?: boolean;
    email?: string;
    dailyHoroscope?: boolean;
    weeklyFortune?: boolean;
    monthlyInsight?: boolean;
    reminderTime?: string;
    timezone?: string;
  }, token: string) =>
    apiRequest('/api/reminders', {
      method: 'PATCH',
      body: data,
      token,
    }),
};

export const subscriptionApi = {
  getPlans: () =>
    apiRequest('/api/subscription/plans'),

  getCurrentSubscription: (token: string) =>
    apiRequest('/api/subscription/current', { token }),

  subscribe: (data: any, token: string) =>
    apiRequest('/api/subscription/subscribe', {
      method: 'POST',
      body: data,
      token,
    }),

  cancel: (token: string) =>
    apiRequest('/api/subscription/cancel', {
      method: 'POST',
      token,
    }),

  getHistory: (token: string) =>
    apiRequest('/api/subscription/history', { token }),

  checkFeatureAccess: (feature: string, token: string) =>
    apiRequest(`/api/subscription/check-access?feature=${feature}`, { token }),
};