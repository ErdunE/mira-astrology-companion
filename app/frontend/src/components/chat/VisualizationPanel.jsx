import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Moon, Sun, Star, History } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VisualizationPanel({ profile, conversation }) {
  const [visualizations, setVisualizations] = useState([]);
  const [selectedViz, setSelectedViz] = useState(null);

  useEffect(() => {
    if (conversation?.id) {
      loadVisualizations();
    }
  }, [conversation]);

  const loadVisualizations = async () => {
    if (!conversation?.id) return;
    
    try {
      const vizs = await base44.entities.Visualization.filter({
        conversation_id: conversation.id
      });
      setVisualizations(vizs);
      if (vizs.length > 0) {
        setSelectedViz(vizs[0]);
      } else {
        setSelectedViz(null);
      }
    } catch (error) {
      console.error("Error loading visualizations:", error);
    }
  };

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-white/40 text-center">Select a profile to begin</p>
      </div>
    );
  }

  // Empty state - beautiful constellation background with minimal profile info
  if (!selectedViz) {
    return (
      <div className="h-full relative overflow-hidden">
        {/* Constellation Background */}
        <div className="absolute inset-0">
          {/* Central glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          {/* Constellation pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="starGlow">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
              </radialGradient>
            </defs>
            {/* Draw constellation lines and stars */}
            <line x1="20%" y1="20%" x2="30%" y2="35%" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1"/>
            <line x1="30%" y1="35%" x2="40%" y2="30%" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1"/>
            <line x1="40%" y1="30%" x2="50%" y2="40%" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1"/>
            <line x1="50%" y1="40%" x2="60%" y2="35%" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1"/>
            <line x1="60%" y1="35%" x2="70%" y2="45%" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1"/>
            
            <line x1="25%" y1="60%" x2="35%" y2="70%" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1"/>
            <line x1="35%" y1="70%" x2="45%" y2="65%" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1"/>
            <line x1="45%" y1="65%" x2="55%" y2="75%" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1"/>
            <line x1="55%" y1="75%" x2="65%" y2="70%" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1"/>
            
            {/* Stars */}
            <circle cx="20%" cy="20%" r="3" fill="url(#starGlow)"/>
            <circle cx="30%" cy="35%" r="4" fill="url(#starGlow)"/>
            <circle cx="40%" cy="30%" r="2" fill="url(#starGlow)"/>
            <circle cx="50%" cy="40%" r="5" fill="url(#starGlow)"/>
            <circle cx="60%" cy="35%" r="3" fill="url(#starGlow)"/>
            <circle cx="70%" cy="45%" r="2" fill="url(#starGlow)"/>
            
            <circle cx="25%" cy="60%" r="3" fill="rgba(59, 130, 246, 0.8)"/>
            <circle cx="35%" cy="70%" r="4" fill="rgba(59, 130, 246, 0.8)"/>
            <circle cx="45%" cy="65%" r="2" fill="rgba(59, 130, 246, 0.8)"/>
            <circle cx="55%" cy="75%" r="3" fill="rgba(59, 130, 246, 0.8)"/>
            <circle cx="65%" cy="70%" r="4" fill="rgba(59, 130, 246, 0.8)"/>
            
            <circle cx="80%" cy="25%" r="2" fill="white" opacity="0.6"/>
            <circle cx="15%" cy="45%" r="2" fill="white" opacity="0.5"/>
            <circle cx="75%" cy="80%" r="2" fill="white" opacity="0.7"/>
            <circle cx="85%" cy="60%" r="2" fill="white" opacity="0.4"/>
          </svg>
        </div>

        {/* Floating Profile Info */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
          <div className="max-w-lg w-full">
            {/* Profile Card */}
            <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl p-8 mb-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {profile.profile_name}
                </h2>
                <p className="text-white/60">{profile.full_name}</p>
              </div>

              {/* Astrological Signs */}
              {(profile.sun_sign || profile.moon_sign || profile.rising_sign) && (
                <div className="space-y-3">
                  {profile.sun_sign && (
                    <div className="flex items-center gap-3 backdrop-blur-md bg-white/5 rounded-xl border border-white/10 p-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                        <Sun className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Sun Sign</div>
                        <div className="text-white font-semibold">{profile.sun_sign}</div>
                      </div>
                    </div>
                  )}
                  {profile.moon_sign && (
                    <div className="flex items-center gap-3 backdrop-blur-md bg-white/5 rounded-xl border border-white/10 p-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg flex items-center justify-center">
                        <Moon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Moon Sign</div>
                        <div className="text-white font-semibold">{profile.moon_sign}</div>
                      </div>
                    </div>
                  )}
                  {profile.rising_sign && (
                    <div className="flex items-center gap-3 backdrop-blur-md bg-white/5 rounded-xl border border-white/10 p-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Rising Sign</div>
                        <div className="text-white font-semibold">{profile.rising_sign}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info Text */}
            <div className="text-center">
              <p className="text-white/40 text-sm">
                Ask Mira to generate charts and visualizations.<br/>
                They will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show visualization when selected
  return (
    <div className="h-full flex flex-col">
      {/* Header with history */}
      {visualizations.length > 1 && (
        <div className="p-4 border-b border-white/10 backdrop-blur-md bg-white/5">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-white/60" />
            <span className="text-white/60 text-sm">Chart History</span>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {visualizations.map((viz) => (
              <Button
                key={viz.id}
                onClick={() => setSelectedViz(viz)}
                variant="outline"
                size="sm"
                className={`flex-shrink-0 ${
                  selectedViz?.id === viz.id
                    ? "bg-white/10 border-blue-400/30 text-white"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                {viz.title}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Visualization Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">{selectedViz.title}</h2>
          {selectedViz.description && (
            <p className="text-white/70 mb-6">{selectedViz.description}</p>
          )}

          {/* Image or Data Visualization */}
          {selectedViz.image_url ? (
            <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl p-8">
              <img 
                src={selectedViz.image_url} 
                alt={selectedViz.title}
                className="w-full rounded-xl"
              />
            </div>
          ) : (
            <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl p-8">
              <div className="aspect-square bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-2xl border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-white/70">Chart Visualization</p>
                  <p className="text-white/50 text-sm mt-2">API data will be rendered here</p>
                </div>
              </div>
            </div>
          )}

          {/* Data Display */}
          {selectedViz.data && Object.keys(selectedViz.data).length > 0 && (
            <div className="mt-6 backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Chart Data</h3>
              <pre className="text-white/70 text-sm overflow-auto">
                {JSON.stringify(selectedViz.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}