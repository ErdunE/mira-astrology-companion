import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Calendar, Clock, MapPin, User } from "lucide-react";
import { toast } from "sonner";

export default function ProfileForm({ onComplete, editingProfile = null }) {
  const [formData, setFormData] = useState({
    profile_name: editingProfile?.profile_name || "",
    full_name: editingProfile?.full_name || "",
    birth_date: editingProfile?.birth_date || "",
    birth_time: editingProfile?.birth_time || "",
    birth_place: editingProfile?.birth_place || "",
    sun_sign: editingProfile?.sun_sign || "",
    moon_sign: editingProfile?.moon_sign || "",
    rising_sign: editingProfile?.rising_sign || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.profile_name || !formData.full_name || !formData.birth_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProfile) {
        await base44.entities.Profile.update(editingProfile.id, formData);
        toast.success("Profile updated successfully!");
      } else {
        const user = await base44.auth.me();
        const existingProfiles = await base44.entities.Profile.filter({
          created_by: user.email
        });
        
        await base44.entities.Profile.create({
          ...formData,
          is_default: existingProfiles.length === 0
        });
        toast.success("Profile created successfully!");
      }
      
      if (onComplete) onComplete();
    } catch (error) {
      toast.error("Failed to save profile");
      console.error(error);
    }
    setIsSubmitting(false);
  };

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
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6 py-12">
        <div className="max-w-2xl w-full">
          {/* Form Card */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {editingProfile ? "Edit Your Profile" : "Create Your Astrological Profile"}
              </h2>
              <p className="text-white/60">
                Help Mira understand your cosmic blueprint
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Name */}
              <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
                <div className="flex items-center gap-2 text-white/80 mb-4">
                  <User className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold">Profile Details</span>
                </div>
                
                <div>
                  <Label className="text-white/80 mb-2 block">Profile Name *</Label>
                  <Input
                    value={formData.profile_name}
                    onChange={(e) => handleChange("profile_name", e.target.value)}
                    placeholder="e.g., My Profile, John's Chart"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 backdrop-blur-md focus:border-blue-400/50"
                    required
                  />
                </div>

                <div>
                  <Label className="text-white/80 mb-2 block">Full Name *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    placeholder="Your full name"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 backdrop-blur-md focus:border-blue-400/50"
                    required
                  />
                </div>
              </div>

              {/* Birth Information */}
              <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
                <div className="flex items-center gap-2 text-white/80 mb-4">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold">Birth Information</span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80 mb-2 block">Birth Date *</Label>
                    <Input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => handleChange("birth_date", e.target.value)}
                      className="bg-white/5 border-white/20 text-white backdrop-blur-md focus:border-blue-400/50"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-white/80 mb-2 block flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Birth Time
                    </Label>
                    <Input
                      type="time"
                      value={formData.birth_time}
                      onChange={(e) => handleChange("birth_time", e.target.value)}
                      className="bg-white/5 border-white/20 text-white backdrop-blur-md focus:border-blue-400/50"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white/80 mb-2 block flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Birth Place
                  </Label>
                  <Input
                    value={formData.birth_place}
                    onChange={(e) => handleChange("birth_place", e.target.value)}
                    placeholder="City, Country"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 backdrop-blur-md focus:border-blue-400/50"
                  />
                </div>
              </div>

              {/* Astrological Signs (Optional) */}
              <div className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
                <div className="flex items-center gap-2 text-white/80 mb-4">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span className="font-semibold">Astrological Signs (Optional)</span>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white/80 mb-2 block">Sun Sign</Label>
                    <Input
                      value={formData.sun_sign}
                      onChange={(e) => handleChange("sun_sign", e.target.value)}
                      placeholder="e.g., Aries"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 backdrop-blur-md focus:border-blue-400/50"
                    />
                  </div>

                  <div>
                    <Label className="text-white/80 mb-2 block">Moon Sign</Label>
                    <Input
                      value={formData.moon_sign}
                      onChange={(e) => handleChange("moon_sign", e.target.value)}
                      placeholder="e.g., Leo"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 backdrop-blur-md focus:border-blue-400/50"
                    />
                  </div>

                  <div>
                    <Label className="text-white/80 mb-2 block">Rising Sign</Label>
                    <Input
                      value={formData.rising_sign}
                      onChange={(e) => handleChange("rising_sign", e.target.value)}
                      placeholder="e.g., Virgo"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 backdrop-blur-md focus:border-blue-400/50"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white py-6 rounded-xl shadow-lg border border-white/20"
              >
                {isSubmitting ? "Saving..." : editingProfile ? "Update Profile" : "Create Profile"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}