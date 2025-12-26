import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Lock, Camera, Save, Stethoscope, Building } from 'lucide-react';
import { toast } from 'sonner';

const DoctorProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialization, setSpecialization] = useState(user?.specialization || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [bio, setBio] = useState('Board-certified specialist with expertise in diagnosing and treating complex conditions.');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateUser({ name, phone, specialization, department });
    toast.success('Profile updated successfully!');
    setIsLoading(false);
  };

  return (
    <DashboardLayout title="Profile">
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
          Doctor Profile
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage your professional information
        </p>
      </div>

      <div className="max-w-2xl">
        {/* Avatar & Verification Badge */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground font-display font-bold text-3xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-display font-semibold text-foreground">
                  {user?.name}
                </h3>
                {user?.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-primary font-medium">{user?.specialization}</p>
              <p className="text-sm text-muted-foreground">{user?.department}</p>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-6">
            Personal Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Info */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-6">
            Professional Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Specialization
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Department
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., Heart Center"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Tell patients about your expertise..."
              />
            </div>
          </div>

          <Button
            variant="hero"
            className="mt-6"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Security */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-6">
            Security
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">Password</p>
                <p className="text-sm text-muted-foreground">
                  Last changed 30 days ago
                </p>
              </div>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorProfilePage;
