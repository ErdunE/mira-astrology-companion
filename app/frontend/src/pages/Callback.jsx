/**
 * OAuth Callback Page
 * 
 * Handles the redirect from Cognito Hosted UI after successful authentication.
 * Extracts tokens from URL, stores them, and redirects to the appropriate page.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function Callback() {
  const navigate = useNavigate();
  const { handleCallback, checkAuthStatus } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Processing authentication...');
  
  useEffect(() => {
    processCallback();
  }, []);
  
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
      
      // Handle the callback
      const success = handleCallback();
      
      if (success) {
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        
        // Wait a moment to show success message, then redirect
        setTimeout(() => {
          // Check if user already has a profile
          // For now, redirect to onboarding
          navigate('/onboarding');
        }, 1500);
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
          {status === 'processing' && (
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
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>
        
        <p className="text-purple-200 text-lg">
          {message}
        </p>
        
        {/* Loading Dots */}
        {status === 'processing' && (
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

