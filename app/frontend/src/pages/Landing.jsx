import React, { useEffect, useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Sparkles, Moon, Star } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function Landing() {



  const handleSignIn = async () => {
    // Redirect to login/signup page
    // TODO: Implement your own auth flow here
    window.location.href = createPageUrl('Onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
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

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Logo/Icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-30 animate-pulse" />
          <div className="relative bg-gradient-to-br from-purple-400 to-indigo-600 p-6 rounded-full">
            <Moon className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 mb-4 text-center">
          MIRA
        </h1>
        
        <div className="flex items-center gap-2 mb-8">
          <Star className="w-4 h-4 text-yellow-300" />
          <p className="text-xl md:text-2xl text-purple-200 text-center">
            Your Cosmic Companion
          </p>
          <Star className="w-4 h-4 text-yellow-300" />
        </div>

        {/* Description */}
        <p className="text-lg text-purple-100/80 text-center max-w-2xl mb-12 leading-relaxed">
          Discover the wisdom of the stars. MIRA is your personal astrology AI,
          ready to guide you through birth charts, cosmic compatibility, and the
          mysteries of the zodiac.
        </p>

        {/* CTA Button */}
        <Button
          onClick={handleSignIn}
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-12 py-6 text-lg rounded-full shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/70"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Begin Your Journey
        </Button>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl">
          <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-purple-400/20">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Moon className="w-6 h-6 text-purple-300" />
            </div>
            <h3 className="text-lg font-semibold text-purple-100 mb-2">Birth Charts</h3>
            <p className="text-purple-200/70 text-sm">
              Explore your unique cosmic blueprint and celestial influences
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-purple-400/20">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-indigo-300" />
            </div>
            <h3 className="text-lg font-semibold text-purple-100 mb-2">Compatibility</h3>
            <p className="text-purple-200/70 text-sm">
              Discover cosmic connections and relationship dynamics
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-purple-400/20">
            <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-pink-300" />
            </div>
            <h3 className="text-lg font-semibold text-purple-100 mb-2">Daily Guidance</h3>
            <p className="text-purple-200/70 text-sm">
              Receive personalized insights and cosmic wisdom
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}