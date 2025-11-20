import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';
import { createPageUrl } from '../utils';
import ProfileForm from '../components/onboarding/ProfileForm';
import { Moon, Sparkles } from 'lucide-react';

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await apiClient.auth.me();
        setUser(currentUser);

        // Check if profile already exists
        const profiles = await apiClient.entities.UserProfile.filter({
          user_email: currentUser.email
        });

        if (profiles.length > 0) {
          // Profile exists, redirect to chat
          window.location.href = createPageUrl('FirstChat');
        }
      } catch (error) {
        console.log('Backend not available yet - continuing with onboarding');
        // If backend is not ready, allow user to continue with onboarding
        // Set a mock user for development
        setUser({ email: 'user@example.com', name: 'User' });
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const handleSubmit = async (profileData) => {
    try {
      await apiClient.entities.UserProfile.create({
        ...profileData,
        user_email: user.email
      });
      window.location.href = createPageUrl('FirstChat');
    } catch (error) {
      console.error('Error creating profile:', error);
      // If backend is not ready, store profile data locally and continue
      console.log('Backend not available - storing profile locally for development');
      localStorage.setItem('dev_profile', JSON.stringify({
        ...profileData,
        user_email: user.email
      }));
      // Continue to FirstChat for development
      window.location.href = createPageUrl('FirstChat');
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