import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 
  'Italy', 'Spain', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'South Korea',
  'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland', 'Other'
];

export default function ProfileForm({ onSubmit, user, initialData = null }) {
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    birth_date: initialData?.birth_date ? new Date(initialData.birth_date) : null,
    birth_time: initialData?.birth_time || '',
    birth_country: initialData?.birth_country || '',
    birth_city: initialData?.birth_city || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.first_name || !formData.birth_date) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        birth_date: format(formData.birth_date, 'yyyy-MM-dd')
      });
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-md border-purple-400/30 shadow-2xl">
      <CardHeader className="border-b border-purple-400/20">
        <CardTitle className="text-2xl text-purple-100">Your Cosmic Profile</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-purple-200">
                First Name <span className="text-pink-400">*</span>
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="bg-white/10 border-purple-400/30 text-white placeholder:text-purple-300/50"
                placeholder="Enter your first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-purple-200">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="bg-white/10 border-purple-400/30 text-white placeholder:text-purple-300/50"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          {/* Birth date */}
          <div className="space-y-2">
            <Label className="text-purple-200">
              Birth Date <span className="text-pink-400">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white/10 border-purple-400/30 text-white hover:bg-white/20"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-purple-300" />
                  {formData.birth_date ? format(formData.birth_date, 'PPP') : 'Select your birth date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-900 border-purple-400/30">
                <Calendar
                  mode="single"
                  selected={formData.birth_date}
                  onSelect={(date) => setFormData({ ...formData, birth_date: date })}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Birth time */}
          <div className="space-y-2">
            <Label htmlFor="birth_time" className="text-purple-200">
              Birth Time (Optional but recommended for accuracy)
            </Label>
            <Input
              id="birth_time"
              type="time"
              value={formData.birth_time}
              onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
              className="bg-white/10 border-purple-400/30 text-white"
            />
          </div>

          {/* Birth place */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-purple-200">Birth Country</Label>
              <Select
                value={formData.birth_country}
                onValueChange={(value) => setFormData({ ...formData, birth_country: value })}
              >
                <SelectTrigger className="bg-white/10 border-purple-400/30 text-white">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-purple-400/30">
                  {countries.map((country) => (
                    <SelectItem key={country} value={country} className="text-white">
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_city" className="text-purple-200">Birth City</Label>
              <Input
                id="birth_city"
                value={formData.birth_city}
                onChange={(e) => setFormData({ ...formData, birth_city: e.target.value })}
                className="bg-white/10 border-purple-400/30 text-white placeholder:text-purple-300/50"
                placeholder="Enter city name"
              />
            </div>
          </div>

          {error && (
            <div className="text-pink-400 text-sm bg-pink-500/10 p-3 rounded-lg border border-pink-400/30">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-6 text-lg rounded-xl"
          >
            {isSubmitting ? (
              'Saving...'
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Continue to MIRA
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}