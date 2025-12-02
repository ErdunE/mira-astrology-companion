import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';
import { cognitoAuth } from '@/services/cognitoAuth';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Moon, Sparkles } from 'lucide-react';
import ProfileForm from '../components/onboarding/ProfileForm';
import { toast } from 'sonner';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Cache user profile with user ID
   */
  const cacheUserProfile = (profileData) => {
    const currentUser = cognitoAuth.getCurrentUser();
    localStorage.setItem('user_profile', JSON.stringify(profileData));
    localStorage.setItem('profile_check_time', Date.now().toString());
    localStorage.setItem('profile_user_id', currentUser?.sub || '');
  };
  
  /**
   * Check if cached profile belongs to current user
   */
  const getValidCachedProfile = () => {
    try {
      const cachedProfile = localStorage.getItem('user_profile');
      const cachedUserId = localStorage.getItem('profile_user_id');
      const currentUser = cognitoAuth.getCurrentUser();
      
      if (!cachedProfile) return null;
      
      // Check if cache belongs to current user
      if (cachedUserId && currentUser?.sub && cachedUserId !== currentUser.sub) {
        console.log('🔄 Cache belongs to different user');
        return null;
      }
      
      return JSON.parse(cachedProfile);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    // First check if user is authenticated
    if (!cognitoAuth.isAuthenticated()) {
      console.warn('User not authenticated, redirecting to login');
      window.location.href = '/';
      return;
    }

    const init = async () => {
      // Get user info from Cognito tokens
      const currentUser = cognitoAuth.getCurrentUser();
      setUser(currentUser || { email: 'user@example.com' });

      try {
        // Try to get profile from API
        console.log('🔍 Fetching profile from API...');
        const existingProfile = await apiClient.profile.get();
        
        if (existingProfile && existingProfile.birth_date) {
          // Transform backend format to form format
          setProfile({
            birth_date: existingProfile.birth_date,
            birth_time: existingProfile.birth_time,
            birth_city: existingProfile.birth_location?.split(',')[0]?.trim() || '',
            birth_country: existingProfile.birth_country,
            zodiac_sign: existingProfile.zodiac_sign
          });
          
          // Cache the profile with user ID
          cacheUserProfile(existingProfile);
          console.log('✅ Profile loaded and cached');
        }
      } catch (error) {
        // If 404, no profile exists yet - that's fine
        if (error.status === 404) {
          console.log('📝 No profile found - user can create one');
        } else {
          // 500 or other errors - try to use cached data if valid
          console.warn('⚠️ Could not fetch profile:', error);
          const cachedProfile = getValidCachedProfile();
          if (cachedProfile) {
            setProfile({
              birth_date: cachedProfile.birth_date,
              birth_time: cachedProfile.birth_time,
              birth_city: cachedProfile.birth_location?.split(',')[0]?.trim() || '',
              birth_country: cachedProfile.birth_country,
              zodiac_sign: cachedProfile.zodiac_sign
            });
            console.log('📦 Using cached profile data');
          }
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSubmit = async (profileData) => {
    try {
      let savedProfile;
      
      if (profile) {
        // Update existing profile
        const response = await apiClient.profile.update(profileData);
        savedProfile = response.profile || response;
        toast.success('Profile updated successfully!');
      } else {
        // Create new profile
        const response = await apiClient.profile.create(profileData);
        savedProfile = response.profile;
        toast.success('🎉 Profile created successfully!', {
          description: `Zodiac sign: ${savedProfile?.zodiac_sign || 'Unknown'}`,
        });
      }
      
      // Cache the updated profile
      if (savedProfile) {
        cacheUserProfile(savedProfile);
      }
      
      // Redirect to chat
      setTimeout(() => {
        window.location.href = createPageUrl('Chat');
      }, 1500);
    } catch (error) {
      console.error('Error saving profile:', error);
      
      // Parse error response
      let errorMessage = 'Failed to save profile. Please try again.';
      try {
        if (error.message) {
          const errorData = JSON.parse(error.message);
          if (errorData.error) {
            errorMessage = errorData.error.message || errorMessage;
          }
        }
      } catch (parseError) {
        // Use default error message
      }

      toast.error('Failed to save profile', {
        description: errorMessage,
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
        {/* Back button */}
        <div className="w-full max-w-2xl mb-6">
          <Link to={createPageUrl('Chat')}>
            <Button variant="ghost" className="text-purple-200 hover:text-purple-100 hover:bg-purple-500/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Moon className="w-8 h-8 text-purple-300" />
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              Your Profile
            </h1>
            <Sparkles className="w-8 h-8 text-purple-300" />
          </div>
          <p className="text-purple-200/80 text-lg">
            Update your birth details to refine your cosmic insights
          </p>
        </div>

        {/* Form */}
        <ProfileForm onSubmit={handleSubmit} user={user} initialData={profile} />
      </div>
    </div>
  );
}