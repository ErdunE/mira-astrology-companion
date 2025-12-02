import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar as CalendarIcon, Sparkles, AlertCircle, MapPin, Clock } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 
  'Italy', 'Spain', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'South Korea',
  'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland', 'Austria',
  'Belgium', 'Portugal', 'Greece', 'Russia', 'Argentina', 'Chile', 'Colombia', 'Other'
];

export default function ProfileForm({ onSubmit, user, initialData = null }) {
  const [formData, setFormData] = useState({
    birth_date: initialData?.birth_date ? new Date(initialData.birth_date) : null,
    birth_time: initialData?.birth_time || '',
    birth_country: initialData?.birth_country || '',
    birth_city: initialData?.birth_city || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    // Validate birth date
    if (!formData.birth_date) {
      newErrors.birth_date = 'Birth date is required';
    } else {
      const today = new Date();
      const hundredYearsAgo = new Date();
      hundredYearsAgo.setFullYear(today.getFullYear() - 120);
      
      if (isAfter(formData.birth_date, today)) {
        newErrors.birth_date = 'Birth date cannot be in the future';
      } else if (isBefore(formData.birth_date, hundredYearsAgo)) {
        newErrors.birth_date = 'Birth date seems too far in the past';
      }
    }

    // Validate birth time (REQUIRED by backend)
    if (!formData.birth_time || formData.birth_time.trim().length === 0) {
      newErrors.birth_time = 'Birth time is required';
    } else {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.birth_time)) {
        newErrors.birth_time = 'Please enter a valid time (HH:MM)';
      }
    }

    // Validate birth location
    if (!formData.birth_city || formData.birth_city.trim().length === 0) {
      newErrors.birth_city = 'Birth city is required';
    } else if (formData.birth_city.trim().length < 2) {
      newErrors.birth_city = 'Birth city must be at least 2 characters';
    }

    if (!formData.birth_country) {
      newErrors.birth_country = 'Birth country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      birth_date: true,
      birth_time: true,
      birth_city: true,
      birth_country: true
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for backend (all fields are required by backend validator)
      const profileData = {
        birth_date: format(formData.birth_date, 'yyyy-MM-dd'),
        birth_time: formData.birth_time.trim(), // Required by backend
        birth_location: `${formData.birth_city.trim()}, ${formData.birth_country}`,
        birth_country: formData.birth_country.trim()
      };

      await onSubmit(profileData);
    } catch (err) {
      // Error will be handled by parent component
      setIsSubmitting(false);
      throw err;
    }
  };

  return (
    <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-900/90 via-purple-900/80 to-indigo-900/90 backdrop-blur-lg border-purple-400/40 shadow-2xl">
      <CardHeader className="border-b border-purple-400/30 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <CardTitle className="text-3xl text-white font-bold">Your Cosmic Profile</CardTitle>
            <CardDescription className="text-purple-200/80 mt-1">
              Enter your birth details to unlock personalized astrology insights
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Birth date */}
          <div className="space-y-2">
            <Label className="text-white font-medium flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-purple-400" />
              Birth Date <span className="text-pink-400">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full justify-start text-left font-normal bg-white/10 border-2 text-white hover:bg-white/20 hover:border-purple-400/60 transition-all ${
                    touched.birth_date && errors.birth_date 
                      ? 'border-red-400/60' 
                      : 'border-purple-400/40'
                  }`}
                  onBlur={() => handleBlur('birth_date')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-purple-400" />
                  {formData.birth_date ? (
                    <span className="text-white">{format(formData.birth_date, 'PPP')}</span>
                  ) : (
                    <span className="text-purple-300/70">Select your date of birth</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-900 border-purple-400/50">
                <Calendar
                  mode="single"
                  selected={formData.birth_date}
                  onSelect={(date) => {
                    setFormData({ ...formData, birth_date: date });
                    setTouched({ ...touched, birth_date: true });
                  }}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
            {touched.birth_date && errors.birth_date && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.birth_date}
              </p>
            )}
          </div>

          {/* Birth time */}
          <div className="space-y-2">
            <Label htmlFor="birth_time" className="text-white font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Birth Time <span className="text-pink-400">*</span>
            </Label>
            <Input
              id="birth_time"
              type="time"
              value={formData.birth_time}
              onChange={(e) => {
                setFormData({ ...formData, birth_time: e.target.value });
                setTouched({ ...touched, birth_time: true });
              }}
              onBlur={() => handleBlur('birth_time')}
              className={`bg-white/10 border-2 text-white placeholder:text-purple-300/50 focus:border-purple-400 transition-colors ${
                touched.birth_time && errors.birth_time 
                  ? 'border-red-400/60' 
                  : 'border-purple-400/40'
              }`}
              placeholder="14:30"
              required
            />
            {touched.birth_time && errors.birth_time && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.birth_time}
              </p>
            )}
            <p className="text-purple-300/60 text-xs">
              💡 Required for accurate birth chart and personalized astrology insights
            </p>
          </div>

          {/* Birth place */}
          <div className="space-y-4">
            <Label className="text-white font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              Birth Location <span className="text-pink-400">*</span>
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth_city" className="text-purple-200 text-sm">City</Label>
                <Input
                  id="birth_city"
                  value={formData.birth_city}
                  onChange={(e) => {
                    setFormData({ ...formData, birth_city: e.target.value });
                    setTouched({ ...touched, birth_city: true });
                  }}
                  onBlur={() => handleBlur('birth_city')}
                  className={`bg-white/10 border-2 text-white placeholder:text-purple-300/50 focus:border-purple-400 transition-colors ${
                    touched.birth_city && errors.birth_city 
                      ? 'border-red-400/60' 
                      : 'border-purple-400/40'
                  }`}
                  placeholder="e.g., New York"
                />
                {touched.birth_city && errors.birth_city && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.birth_city}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birth_country" className="text-purple-200 text-sm">Country</Label>
                <Select
                  value={formData.birth_country}
                  onValueChange={(value) => {
                    setFormData({ ...formData, birth_country: value });
                    setTouched({ ...touched, birth_country: true });
                  }}
                >
                  <SelectTrigger 
                    id="birth_country"
                    className={`bg-white/10 border-2 text-white focus:border-purple-400 transition-colors ${
                      touched.birth_country && errors.birth_country 
                        ? 'border-red-400/60' 
                        : 'border-purple-400/40'
                    }`}
                    onBlur={() => handleBlur('birth_country')}
                  >
                    <SelectValue placeholder="Select country" className="text-purple-300/70" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-purple-400/50 max-h-[200px]">
                    {countries.map((country) => (
                      <SelectItem 
                        key={country} 
                        value={country} 
                        className="text-white hover:bg-purple-500/20 focus:bg-purple-500/30"
                      >
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {touched.birth_country && errors.birth_country && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.birth_country}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Info box */}
          <Alert className="bg-indigo-500/10 border-indigo-400/30">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <AlertDescription className="text-indigo-200 text-sm ml-2">
              Your birth details help us create a personalized astrological profile and provide accurate cosmic insights.
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 text-lg rounded-xl font-semibold shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating your profile...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>Continue to MIRA</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}