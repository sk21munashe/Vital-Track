import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  User, 
  Globe, 
  Ruler, 
  Bell, 
  Shield, 
  Mail, 
  Share2, 
  Star, 
  Info,
  LogOut,
  Trash2,
  ChevronRight,
  RotateCcw,
  BellRing,
  Sparkles,
  Droplets,
  Target,
  Calendar
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from '@/components/DashboardCard';
import { useWellnessData } from '@/hooks/useWellnessData';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTourStatus } from '@/components/WelcomeTour';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian' },
];

interface UserSettings {
  username: string;
  age: string;
  height: string;
  weight: string;
  units: 'metric' | 'imperial';
  language: string;
  notifications: {
    dailyReminders: boolean;
    goalAlerts: boolean;
    weeklyReports: boolean;
  };
}

export default function Settings() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useWellnessData();
  const { displayName, updateDisplayName } = useUserProfile();
  const { resetTour } = useTourStatus();
  const { 
    settings: notificationSettings, 
    permissionStatus, 
    isLoading: notificationLoading,
    isSupported: notificationsSupported,
    enableNotifications,
    disableNotifications,
    updateSettings: updateNotificationSettings,
    sendTestNotification 
  } = useNotifications();
  
  const [settings, setSettings] = useState<UserSettings>({
    username: displayName || '',
    age: '',
    height: '',
    weight: '',
    units: 'metric',
    language: 'en',
    notifications: {
      dailyReminders: true,
      goalAlerts: true,
      weeklyReports: false,
    },
  });

  // Sync settings username when displayName changes from context
  useEffect(() => {
    if (displayName) {
      setSettings(prev => ({ ...prev, username: displayName }));
    }
  }, [displayName]);

  const [showEditDetails, setShowEditDetails] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleReplayTour = () => {
    resetTour();
    sessionStorage.setItem('replay_tour', 'true');
    navigate('/');
    toast.success('Tour will start on the home screen');
  };

  const handleSaveDetails = async () => {
    try {
      // Optimistically update via context (handles DB sync)
      await updateDisplayName(settings.username);
      // Also update local wellness profile
      updateProfile({ name: settings.username });
      setShowEditDetails(false);
      toast.success('Personal details updated!');
    } catch (error) {
      toast.error('Failed to update details');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    toast.success('Signed out successfully');
  };

  const handleDeleteAccount = async () => {
    // Note: Full account deletion would require backend implementation
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/auth');
    toast.success('Account deleted');
  };

  const handleUnitsChange = (value: 'metric' | 'imperial') => {
    setSettings(prev => ({ ...prev, units: value }));
    toast.success(`Units changed to ${value}`);
  };

  const handleLanguageChange = (value: string) => {
    setSettings(prev => ({ ...prev, language: value }));
    toast.success('Language preference saved');
  };

  const handleNotificationToggle = (key: keyof UserSettings['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const SettingRow = ({ 
    icon: Icon, 
    label, 
    value, 
    onClick, 
    rightElement,
    disabled = false 
  }: { 
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value?: string;
    onClick?: () => void;
    rightElement?: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || !onClick}
      className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : onClick ? 'hover:bg-muted/50 active:bg-muted' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <span className="text-sm sm:text-base font-medium">{label}</span>
      </div>
      {rightElement || (
        <div className="flex items-center gap-2 text-muted-foreground">
          {value && <span className="text-xs sm:text-sm">{value}</span>}
          {onClick && <ChevronRight className="w-4 h-4" />}
        </div>
      )}
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-background pb-4 overflow-y-auto">
      {/* Header */}
      <header className="pt-4 sm:pt-6 pb-3 sm:pb-4 px-4 sm:px-5 md:px-8 sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      {/* Account Section */}
      <div className="px-4 sm:px-5 md:px-8 mt-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Account
        </h2>
        <DashboardCard className="p-1">
          <SettingRow 
            icon={User}
            label="Personal Details"
            value={displayName || 'Not set'}
            onClick={() => setShowEditDetails(true)}
          />
          <div className="border-t border-border/50 mx-3" />
          <SettingRow 
            icon={LogOut}
            label="Sign Out"
            onClick={() => setShowSignOutDialog(true)}
          />
          <div className="border-t border-border/50 mx-3" />
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-destructive/10 active:bg-destructive/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
              </div>
              <span className="text-sm sm:text-base font-medium text-destructive">Delete Account</span>
            </div>
            <ChevronRight className="w-4 h-4 text-destructive" />
          </button>
        </DashboardCard>
      </div>

      {/* General Section */}
      <div className="px-4 sm:px-5 md:px-8 mt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          General
        </h2>
        <DashboardCard className="p-1">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <span className="text-sm sm:text-base font-medium">Language</span>
              </div>
              <Select value={settings.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[120px] sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border-t border-border/50 mx-3" />
          
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-medium">Units</span>
                  <p className="text-xs text-muted-foreground">
                    {settings.units === 'metric' ? 'kg, cm, mL' : 'lbs, feet, fl oz'}
                  </p>
                </div>
              </div>
              <Select value={settings.units} onValueChange={(v) => handleUnitsChange(v as 'metric' | 'imperial')}>
                <SelectTrigger className="w-[120px] sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric</SelectItem>
                  <SelectItem value="imperial">Imperial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border-t border-border/50 mx-3" />
          
          {/* Enhanced AI-Powered Notifications Section */}
          <div className="p-3 sm:p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-medium">Smart Reminders</span>
                  <p className="text-xs text-muted-foreground">AI-powered motivational notifications</p>
                </div>
              </div>
            </div>
            
            {/* Main Enable/Disable Button */}
            {notificationsSupported ? (
              <div className="space-y-4">
                {!notificationSettings.enabled ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      const success = await enableNotifications();
                      if (success) {
                        toast.success('Notifications enabled! 🔔', {
                          description: 'You\'ll receive personalized reminders throughout the day.',
                        });
                      } else if (permissionStatus === 'denied') {
                        toast.error('Notifications blocked', {
                          description: 'Please enable notifications in your browser settings.',
                        });
                      }
                    }}
                    disabled={notificationLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 hover:border-primary/50 transition-all"
                  >
                    <BellRing className="w-5 h-5 text-primary" />
                    <span className="font-medium text-primary">
                      {notificationLoading ? 'Enabling...' : 'Enable Smart Reminders'}
                    </span>
                    <Sparkles className="w-4 h-4 text-primary" />
                  </motion.button>
                ) : (
                  <>
                    {/* Enabled State - Show toggle options */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">Notifications Active</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          disableNotifications();
                          toast.success('Notifications disabled');
                        }}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Disable
                      </Button>
                    </div>
                    
                    {/* Individual notification type toggles */}
                    <div className="space-y-3 pl-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-water" />
                          <span className="text-sm text-muted-foreground">Water Reminders</span>
                          <span className="text-[10px] text-muted-foreground">(10AM, 2PM, 6PM)</span>
                        </div>
                        <Switch 
                          checked={notificationSettings.waterReminders}
                          onCheckedChange={(checked) => updateNotificationSettings({ waterReminders: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-nutrition" />
                          <span className="text-sm text-muted-foreground">Goal Check-ins</span>
                          <span className="text-[10px] text-muted-foreground">(12PM, 8PM)</span>
                        </div>
                        <Switch 
                          checked={notificationSettings.goalCheckIns}
                          onCheckedChange={(checked) => updateNotificationSettings({ goalCheckIns: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-sm text-muted-foreground">AI Motivation</span>
                          <span className="text-[10px] text-muted-foreground">(9AM daily)</span>
                        </div>
                        <Switch 
                          checked={notificationSettings.aiMotivation}
                          onCheckedChange={(checked) => updateNotificationSettings({ aiMotivation: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-accent-foreground" />
                          <span className="text-sm text-muted-foreground">Weekly Recap</span>
                          <span className="text-[10px] text-muted-foreground">(Sun 7PM)</span>
                        </div>
                        <Switch 
                          checked={notificationSettings.weeklyRecap}
                          onCheckedChange={(checked) => updateNotificationSettings({ weeklyRecap: checked })}
                        />
                      </div>
                    </div>
                    
                    {/* Test Notification Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={async () => {
                        const sent = await sendTestNotification();
                        if (sent) {
                          toast.success('Test notification sent!');
                        } else {
                          toast.error('Could not send notification');
                        }
                      }}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Send Test Notification
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">
                  Notifications are not supported in this browser.
                </p>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Help & Support Section */}
      <div className="px-4 sm:px-5 md:px-8 mt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Help
        </h2>
        <DashboardCard className="p-1">
          <SettingRow 
            icon={RotateCcw}
            label="Replay App Tour"
            onClick={handleReplayTour}
          />
        </DashboardCard>
      </div>

      {/* Support Section */}
      <div className="px-4 sm:px-5 md:px-8 mt-6 mb-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Support
        </h2>
        <DashboardCard className="p-1">
          <SettingRow 
            icon={Shield}
            label="Privacy Policy"
            disabled
          />
          <div className="border-t border-border/50 mx-3" />
          <SettingRow 
            icon={Mail}
            label="Contact Us"
            disabled
          />
          <div className="border-t border-border/50 mx-3" />
          <SettingRow 
            icon={Share2}
            label="Share App"
            disabled
          />
          <div className="border-t border-border/50 mx-3" />
          <SettingRow 
            icon={Star}
            label="Rate Us"
            disabled
          />
          <div className="border-t border-border/50 mx-3" />
          <SettingRow 
            icon={Info}
            label="About"
            value="v1.0.0"
            disabled
          />
        </DashboardCard>
        
        <p className="text-center text-xs text-muted-foreground mt-4">
          VitalTrack v1.0.0 • Build 1
        </p>
      </div>

      {/* Edit Personal Details Dialog */}
      <Dialog open={showEditDetails} onOpenChange={setShowEditDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personal Details</DialogTitle>
            <DialogDescription>
              Update your personal information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Username</Label>
              <Input
                value={settings.username}
                onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                value={settings.age}
                onChange={(e) => setSettings(prev => ({ ...prev, age: e.target.value }))}
                placeholder="e.g., 25"
              />
            </div>
            <div>
              <Label>Height ({settings.units === 'metric' ? 'cm' : 'feet'})</Label>
              <Input
                type="number"
                value={settings.height}
                onChange={(e) => setSettings(prev => ({ ...prev, height: e.target.value }))}
                placeholder={settings.units === 'metric' ? 'e.g., 175' : 'e.g., 5.9'}
              />
            </div>
            <div>
              <Label>Weight ({settings.units === 'metric' ? 'kg' : 'lbs'})</Label>
              <Input
                type="number"
                value={settings.weight}
                onChange={(e) => setSettings(prev => ({ ...prev, weight: e.target.value }))}
                placeholder={settings.units === 'metric' ? 'e.g., 70' : 'e.g., 154'}
              />
            </div>
            <Button onClick={handleSaveDetails} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sign Out Confirmation */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
