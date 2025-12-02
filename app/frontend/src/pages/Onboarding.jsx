import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';
import { cognitoAuth } from '@/services/cognitoAuth';
import { createPageUrl } from '../utils';
import ProfileForm from '../components/onboarding/ProfileForm';
import { Moon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Check if cached profile belongs to current user and is valid
   */
  const isValidCachedProfile = () => {
    try {
      const cachedProfile = localStorage.getItem('user_profile');
      const profileCheckTime = localStorage.getItem('profile_check_time');
      const cachedUserId = localStorage.getItem('profile_user_id');
      const currentUser = cognitoAuth.getCurrentUser();
      
      if (!cachedProfile || !profileCheckTime) return null;
      
      // Check if cache belongs to current user
      if (cachedUserId && currentUser?.sub && cachedUserId !== currentUser.sub) {
        console.log('🔄 Cache belongs to different user - clearing');
        clearProfileCache();
        return null;
      }
      
      // Check if cache is still valid (5 minutes)
      const fiveMinutes = 5 * 60 * 1000;
      const timeSinceCheck = Date.now() - parseInt(profileCheckTime);
      if (timeSinceCheck >= fiveMinutes) {
        console.log('⏰ Cache expired');
        return null;
      }
      
      const profile = JSON.parse(cachedProfile);
      if (profile?.birth_date) {
        return profile;
      }
      
      return null;
    } catch (e) {
      console.error('Error checking cached profile:', e);
      clearProfileCache();
      return null;
    }
  };
  
  /**
   * Clear profile cache
   */
  const clearProfileCache = () => {
    localStorage.removeItem('user_profile');
    localStorage.removeItem('profile_check_time');
    localStorage.removeItem('profile_user_id');
  };
  
  /**
   * Cache user profile with user ID
   */
  const cacheUserProfile = (profile) => {
    const currentUser = cognitoAuth.getCurrentUser();
    localStorage.setItem('user_profile', JSON.stringify(profile));
    localStorage.setItem('profile_check_time', Date.now().toString());
    localStorage.setItem('profile_user_id', currentUser?.sub || '');
  };

  useEffect(() => {
    // First check if user is authenticated
    if (!cognitoAuth.isAuthenticated()) {
      window.location.href = '/';
      return;
    }
    
    // Check valid cached profile for current user
    const cachedProfile = isValidCachedProfile();
    if (cachedProfile) {
      console.log('✅ Valid cached profile found - redirecting to chat');
      window.location.href = createPageUrl('Chat');
      return;
    }
    
    // Check with API
    const checkUser = async () => {
      try {
        const currentUser = cognitoAuth.getCurrentUser();
        if (!currentUser) {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);

        // Check if profile exists in DynamoDB
        console.log('🔍 Checking for existing profile in database...');
        try {
          const existingProfile = await apiClient.profile.get();
          
          if (existingProfile?.birth_date) {
            // Profile exists in DynamoDB - cache and redirect to chat
            console.log('✅ Profile found in database:', existingProfile);
            cacheUserProfile(existingProfile);
            
            toast.success('Welcome back!', {
              description: `Zodiac: ${existingProfile.zodiac_sign || 'Unknown'}`,
              duration: 2000,
            });
            
            setTimeout(() => {
              window.location.href = createPageUrl('Chat');
            }, 1000);
            return;
          } else {
            // Profile exists but incomplete
            console.log('⚠️ Profile incomplete - showing form');
            clearProfileCache();
          }
        } catch (profileError) {
          if (profileError.status === 404) {
            // No profile exists - this is expected for new users, show the form
            console.log('📝 No profile in database (404) - showing form for new user');
            clearProfileCache();
          } else {
            // Other errors (500, network) - log but continue with form
            console.warn('⚠️ Error checking profile (will show form):', profileError);
            clearProfileCache();
          }
        }
      } catch (error) {
        console.error('Error in onboarding setup:', error);
        if (!cognitoAuth.isAuthenticated()) {
          window.location.href = '/';
          return;
        }
        setUser(cognitoAuth.getCurrentUser() || { email: 'user@example.com' });
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const handleSubmit = async (profileData) => {
    try {
      const response = await apiClient.profile.create(profileData);
      
      // Cache the profile in localStorage with user ID
      if (response.profile) {
        cacheUserProfile(response.profile);
      }
      
      // Show success message
      toast.success('🎉 Profile created successfully!', {
        description: `Welcome to MIRA! Zodiac sign: ${response.profile?.zodiac_sign || 'Unknown'}`,
        duration: 3000,
      });

      // Redirect to chat
      setTimeout(() => {
        window.location.href = createPageUrl('Chat');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating profile:', error);
      
      // Parse error message
      let errorMessage = 'Failed to create profile. Please try again.';
      let errorDetails = '';
      
      if (error.message === 'Failed to fetch') {
        errorMessage = 'Cannot connect to server';
        errorDetails = 'Please check your internet connection';
      } else if (error.status === 401) {
        errorMessage = 'Session expired';
        errorDetails = 'Please log in again';
      } else if (error.data?.error) {
        errorMessage = error.data.error.message || errorMessage;
        if (error.data.error.details) {
          const { field, reason } = error.data.error.details;
          errorDetails = field && reason ? `${field}: ${reason}` : reason || '';
        }
      }

      toast.error(errorMessage, {
        description: errorDetails,
        duration: 5000,
      });

      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            <div className="w-1 h-1 bg-white rounded-full opacity-60" />
          </div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Moon className="w-8 h-8 text-purple-300" />
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              Welcome to MIRA
            </h1>
            <Sparkles className="w-8 h-8 text-purple-300" />
          </div>
          <p className="text-purple-200/80 text-lg">
            Let's map your cosmic journey. Share your birth details to unlock personalized insights.
          </p>
        </div>

        {/* Form */}
        <ProfileForm onSubmit={handleSubmit} user={user} />
      </div>
    </div>
  );
}