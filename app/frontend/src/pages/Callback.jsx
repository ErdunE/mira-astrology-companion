/**
 * OAuth Callback Page
 * 
 * Handles the redirect from Cognito Hosted UI after successful authentication.
 * Extracts tokens from URL, stores them, and redirects to the appropriate page.
 * 
 * Flow:
 * 1. Extract tokens from URL hash
 * 2. Check if user has an existing profile in DynamoDB via GET /profile
 * 3. If profile exists (200) → redirect to /chat
 * 4. If no profile (404) → redirect to /onboarding
 * 5. If error (500, network) → redirect to /onboarding (will check again there)
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/apiClient';
import { cognitoAuth } from '../services/cognitoAuth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function Callback() {
  const navigate = useNavigate();
  const { handleCallback, checkAuthStatus } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error, checking
  const [message, setMessage] = useState('Processing authentication...');
  
  useEffect(() => {
    processCallback();
  }, []);
  
  /**
   * Clear any cached profile data for a fresh start.
   * This ensures a new user doesn't see stale data from a previous session.
   */
  const clearProfileCache = () => {
    localStorage.removeItem('user_profile');
    localStorage.removeItem('profile_check_time');
  };
  
  /**
   * Cache the user profile with the current user's ID to prevent cross-user caching issues.
   */
  const cacheUserProfile = (profile) => {
    const userInfo = cognitoAuth.getCurrentUser();
    const cacheData = {
      profile,
      userId: userInfo?.sub,
      cachedAt: Date.now()
    };
    localStorage.setItem('user_profile', JSON.stringify(profile));
    localStorage.setItem('profile_user_id', userInfo?.sub || '');
    localStorage.setItem('profile_check_time', Date.now().toString());
  };
  
  const processCallback = async () => {
    try {
      // Check if we have tokens in the URL
      const hasTokens = window.location.hash.includes('id_token') && 
                        window.location.hash.includes('access_token');
      
      if (!hasTokens) {
        console.warn('No tokens found in URL');
        setStatus('error');
        setMessage('No authentication tokens found. Redirecting...');
        setTimeout(() => navigate('/'), 2000);
        return;
      }
      
      // Handle the callback (stores tokens)
      const success = handleCallback();
      
      if (success) {
        setStatus('checking');
        setMessage('Checking your profile...');
        
        // Clear any stale profile cache from previous user
        clearProfileCache();
        
        // Give a moment for auth state to fully propagate
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Try to check if user already has a profile in DynamoDB
        try {
          console.log('🔍 Checking for existing profile...');
          const existingProfile = await apiClient.profile.get();
          
          if (existingProfile && existingProfile.birth_date) {
            // Profile exists - cache it and go to chat
            console.log('✅ Existing profile found:', existingProfile);
            cacheUserProfile(existingProfile);
            
            setStatus('success');
            setMessage('Welcome back! Redirecting to chat...');
            setTimeout(() => navigate('/chat'), 1000);
            return;
          } else {
            // Profile response exists but incomplete - go to onboarding
            console.log('⚠️ Profile incomplete (no birth_date) - redirecting to onboarding');
            clearProfileCache();
            setStatus('success');
            setMessage('Let\'s complete your profile...');
            setTimeout(() => navigate('/onboarding'), 1000);
            return;
          }
        } catch (profileError) {
          // 404 means no profile exists - new user, go to onboarding
          if (profileError.status === 404) {
            console.log('📝 No profile found (404) - new user, redirecting to onboarding');
            clearProfileCache();
            setStatus('success');
            setMessage('Welcome! Let\'s set up your profile...');
            setTimeout(() => navigate('/onboarding'), 1000);
            return;
          }
          
          // For other errors (500, network issues), still go to onboarding
          // Onboarding will try to check again and handle gracefully
          console.warn('⚠️ Could not check profile (API error):', profileError);
          console.log('Redirecting to onboarding - will check profile again there');
          clearProfileCache();
          setStatus('success');
          setMessage('Setting up your experience...');
          setTimeout(() => navigate('/onboarding'), 1000);
          return;
        }
        
      } else {
        setStatus('error');
        setMessage('Failed to process authentication. Redirecting...');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      console.error('Error in callback:', error);
      setStatus('error');
      setMessage('An error occurred during authentication. Redirecting...');
      setTimeout(() => navigate('/'), 2000);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex items-center justify-center px-6">
      <div className="text-center">
        {/* Status Icon */}
        <div className="mb-6">
          {(status === 'processing' || status === 'checking') && (
            <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto" />
          )}
          {status === 'success' && (
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 blur-2xl opacity-30 animate-pulse" />
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto relative animate-bounce" />
            </div>
          )}
          {status === 'error' && (
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 blur-2xl opacity-30 animate-pulse" />
              <XCircle className="w-16 h-16 text-red-400 mx-auto relative" />
            </div>
          )}
        </div>
        
        {/* Status Message */}
        <h2 className="text-2xl font-bold text-white mb-2">
          {status === 'processing' && 'Authenticating...'}
          {status === 'checking' && 'Checking Profile...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>
        
        <p className="text-purple-200 text-lg">
          {message}
        </p>
        
        {/* Loading Dots */}
        {(status === 'processing' || status === 'checking') && (
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    </div>
  );
}

