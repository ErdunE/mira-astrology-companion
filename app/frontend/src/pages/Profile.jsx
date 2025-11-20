import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Moon, Sparkles } from 'lucide-react';
import ProfileForm from '../components/onboarding/ProfileForm';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await apiClient.auth.me();
        setUser(currentUser);

        const profiles = await apiClient.entities.UserProfile.filter({
          user_email: currentUser.email
        });

        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }
      } catch (error) {
        console.log('Backend not available - using local profile data');
        // If backend is not ready, use local data for development
        const devProfile = localStorage.getItem('dev_profile');
        if (devProfile) {
          const profileData = JSON.parse(devProfile);
          setUser({ email: profileData.user_email });
          setProfile(profileData);
        } else {
          setUser({ email: 'user@example.com' });
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSubmit = async (profileData) => {
    try {
      if (profile) {
        await apiClient.entities.UserProfile.update(profile.id, profileData);
      } else {
        await apiClient.entities.UserProfile.create({
          ...profileData,
          user_email: user.email
        });
      }
      window.location.href = createPageUrl('Chat');
    } catch (error) {
      console.error('Error updating profile:', error);
      console.log('Backend not available - saving profile locally');
      // If backend is not ready, save locally for development
      localStorage.setItem('dev_profile', JSON.stringify({
        ...profileData,
        user_email: user.email
      }));
      alert('Profile saved locally!\n\nBackend not connected yet.\nConnect your AWS backend to save permanently.');
      window.location.href = createPageUrl('Chat');
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