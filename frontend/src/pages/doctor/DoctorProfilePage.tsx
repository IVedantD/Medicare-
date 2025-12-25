import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Lock, Save, Stethoscope, Building, Eye, EyeOff, Edit } from 'lucide-react';
import { toast } from 'sonner';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const DoctorProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialization, setSpecialization] = useState(user?.specialization || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [bio, setBio] = useState('Board-certified specialist with expertise in diagnosing and treating complex conditions.');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    specialization: user?.specialization || '',
    department: user?.department || '',
    bio: bio
  });
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateUser({ name, phone, specialization, department });
    toast.success('Profile updated successfully!');
    setIsLoading(false);
  };

  const handleImageUpdate = (imageUrl: string) => {
    // This will be called when a new image is uploaded
    updateUser({ profileImage: imageUrl });
    toast.success('Profile picture updated successfully!');
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetEditForm = () => {
    setEditForm({
      name: user?.name || '',
      phone: user?.phone || '',
      specialization: user?.specialization || '',
      department: user?.department || '',
      bio: bio
    });
  };

  const handleEditModalOpenChange = (open: boolean) => {
    setIsEditModalOpen(open);
    if (open) {
      resetEditForm();
    }
  };

  const handleEditSave = async () => {
    // Basic validation
    if (!editForm.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    if (!editForm.specialization.trim()) {
      toast.error('Specialization is required');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Update user data
      updateUser(editForm);
      
      // Update local state
      setName(editForm.name);
      setPhone(editForm.phone);
      setSpecialization(editForm.specialization);
      setDepartment(editForm.department);
      setBio(editForm.bio);
      
      toast.success('Profile updated successfully!');
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordFormChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const resetPasswordForm = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
  };

  const handlePasswordModalOpenChange = (open: boolean) => {
    setIsPasswordModalOpen(open);
    if (open) {
      resetPasswordForm();
    }
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumbers) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const handlePasswordSave = async () => {
    // Validation
    if (!passwordForm.currentPassword.trim()) {
      toast.error('Current password is required');
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      toast.error('New password is required');
      return;
    }

    if (!passwordForm.confirmPassword.trim()) {
      toast.error('Please confirm your new password');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    // Validate new password strength
    const passwordError = validatePassword(passwordForm.newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setIsPasswordLoading(true);
    try {
      // Simulate API call to change password
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      toast.success('Password updated successfully!');
      setIsPasswordModalOpen(false);
      resetPasswordForm();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update password. Please try again.');
      }
    } finally {
      setIsPasswordLoading(false);
    }
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <ProfileAvatar
                user={{
                  id: user?.id || '',
                  name: user?.name || '',
                  email: user?.email || '',
                  profileImage: user?.profileImage
                }}
                size="large"
                editable={true}
                onImageUpdate={handleImageUpdate}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-display font-semibold text-foreground">
                    Dr. {user?.name}
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
            
            {/* Edit Button */}
            <Dialog open={isEditModalOpen} onOpenChange={handleEditModalOpenChange}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Doctor Profile</DialogTitle>
                  <DialogDescription>
                    Update your professional information below.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground border-b pb-2">
                      Personal Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => handleEditFormChange('name', e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Enter full name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-muted text-muted-foreground cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Email cannot be changed
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => handleEditFormChange('phone', e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information Section */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground border-b pb-2">
                      Professional Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Specialization *
                        </label>
                        <div className="relative">
                          <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={editForm.specialization}
                            onChange={(e) => handleEditFormChange('specialization', e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="e.g., Cardiology"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Department
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={editForm.department}
                            onChange={(e) => handleEditFormChange('department', e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="e.g., Heart Center"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Bio
                      </label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => handleEditFormChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        placeholder="Tell patients about your expertise..."
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => handleEditModalOpenChange(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="hero"
                    onClick={handleEditSave}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
            
            {/* Change Password Dialog */}
            <Dialog open={isPasswordModalOpen} onOpenChange={handlePasswordModalOpenChange}>
              <DialogTrigger asChild>
                <Button variant="outline">Change Password</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new secure password.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Current Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordFormChange('currentPassword', e.target.value)}
                        className="w-full h-10 pl-10 pr-12 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordFormChange('newPassword', e.target.value)}
                        className="w-full h-10 pl-10 pr-12 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Must be at least 8 characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handlePasswordFormChange('confirmPassword', e.target.value)}
                        className="w-full h-10 pl-10 pr-12 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => handlePasswordModalOpenChange(false)}
                    disabled={isPasswordLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="hero"
                    onClick={handlePasswordSave}
                    disabled={isPasswordLoading}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isPasswordLoading ? 'Updating...' : 'Save Password'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorProfilePage;
