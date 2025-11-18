import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sparkles, Moon, Stars, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Night Sky Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0e27] via-[#16213e] to-[#0f1729]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200')] opacity-30 bg-cover bg-center"></div>
        {/* Stars */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                           radial-gradient(2px 2px at 60% 70%, white, transparent),
                           radial-gradient(1px 1px at 50% 50%, white, transparent),
                           radial-gradient(1px 1px at 80% 10%, white, transparent),
                           radial-gradient(2px 2px at 90% 60%, white, transparent),
                           radial-gradient(1px 1px at 33% 80%, white, transparent),
                           radial-gradient(1px 1px at 15% 60%, white, transparent)`,
          backgroundSize: '200px 200px, 300px 300px, 250px 250px, 400px 400px, 350px 350px, 300px 300px, 450px 450px',
          backgroundRepeat: 'repeat'
        }}></div>
      </div>

      {/* Glowing Orbs */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="fixed top-1/2 left-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-pulse delay-500"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="p-6 md:p-8">
          <div className="max-w-7xl mx-auto backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 px-6 py-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">Mira</span>
              </div>
              <Button
                onClick={() => navigate(createPageUrl("Auth"))}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
              >
                Sign In
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-5xl w-full">
            {/* Main Glass Card */}
            <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl p-8 md:p-16">
              {/* Decorative Icons */}
              <div className="flex justify-center gap-8 mb-8">
                <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/20 p-4 animate-float hover:bg-white/10 transition-all">
                  <Sun className="w-8 h-8 text-blue-300" />
                </div>
                <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/20 p-4 animate-float delay-300 hover:bg-white/10 transition-all">
                  <Moon className="w-8 h-8 text-purple-300" />
                </div>
                <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/20 p-4 animate-float delay-500 hover:bg-white/10 transition-all">
                  <Stars className="w-8 h-8 text-indigo-300" />
                </div>
              </div>

              {/* Heading */}
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                  Meet <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Mira</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-4 font-light">
                  Your Personal AI Astrology Guide
                </p>
                <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                  Discover cosmic insights tailored to your birth chart. Get personalized readings, 
                  daily guidance, and unlock the wisdom of the stars.
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center">
                <Button
                  onClick={() => navigate(createPageUrl("Auth"))}
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white px-12 py-7 text-lg rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 border border-white/20"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Begin Your Journey
                </Button>
              </div>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6 mt-16">
                {[
                  { title: "Birth Chart Analysis", desc: "Deep insights into your cosmic blueprint" },
                  { title: "Daily Guidance", desc: "Personalized astrological forecasts" },
                  { title: "Compatibility", desc: "Explore connections with others" }
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-blue-400/30"
                  >
                    <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-white/60 text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center">
          <p className="text-white/40 text-sm">© 2024 Mira. Your journey to the stars begins here.</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}