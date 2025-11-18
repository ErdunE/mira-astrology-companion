import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileForm from "../components/onboarding/ProfileForm";

export default function Auth() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const profiles = await base44.entities.Profile.filter({
          created_by: (await base44.auth.me()).email
        });
        
        if (profiles.length === 0) {
          setShowOnboarding(true);
        } else {
          navigate(createPageUrl("Chat"));
        }
      }
    } catch (error) {
      console.error("Error checking profile:", error);
    }
    setIsChecking(false);
  };

  const handleOnboardingComplete = () => {
    navigate(createPageUrl("Chat"));
  };

  if (isChecking) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-b from-[#0a0e27] via-[#16213e] to-[#0f1729]"></div>
        <div className="relative z-10 text-white">Loading...</div>
      </div>
    );
  }

  if (showOnboarding) {
    return <ProfileForm onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Night Sky Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0e27] via-[#16213e] to-[#0f1729]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200')] opacity-30 bg-cover bg-center"></div>
      </div>

      {/* Glowing Orbs */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <Button
            onClick={() => navigate(createPageUrl("Landing"))}
            variant="ghost"
            className="text-white hover:bg-white/10 backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Auth Card */}
        <div className="max-w-md w-full">
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl p-8 md:p-12">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-3xl font-bold text-white text-center mb-3">
              Welcome to Mira
            </h2>
            <p className="text-white/60 text-center mb-8">
              Sign in or create an account to start your cosmic journey
            </p>

            {/* Placeholder Message */}
            <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
              <p className="text-white/80 text-center text-sm leading-relaxed">
                This page will integrate with <span className="font-semibold text-blue-300">Amazon Cognito</span> for 
                secure authentication. The login and signup functionality will be implemented here.
              </p>
            </div>

            {/* Placeholder Buttons */}
            <div className="space-y-3">
              <Button
                onClick={async () => {
                  const isAuth = await base44.auth.isAuthenticated();
                  if (!isAuth) {
                    base44.auth.redirectToLogin(createPageUrl("Auth"));
                  } else {
                    checkUserProfile();
                  }
                }}
                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white py-6 rounded-xl shadow-lg border border-white/20"
              >
                Continue with Email
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-white/40">or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/20 py-6 rounded-xl backdrop-blur-md"
              >
                Sign up
              </Button>
            </div>

            {/* Footer Text */}
            <p className="text-white/40 text-xs text-center mt-8">
              By continuing, you agree to Mira's Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}