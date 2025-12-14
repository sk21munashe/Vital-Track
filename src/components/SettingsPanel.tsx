import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  User, 
  Sun, 
  Moon, 
  Monitor, 
  Bell, 
  Shield, 
  Info, 
  LogOut,
  Settings,
  ChevronRight,
  Edit2
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AvatarDisplay } from '@/components/AvatarSelector';
import { useWellnessData } from '@/hooks/useWellnessData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserProfile as CloudUserProfile } from '@/hooks/useAuth';

interface SettingsPanelProps {
  onSignOut?: () => void;
  displayName?: string;
  cloudProfile?: CloudUserProfile | null;
  onUpdatePreferredName?: (name: string) => Promise<{ error: Error | null }>;
  onUpdateAvatar?: (type: string, value: string) => Promise<{ error: Error | null }>;
}

export function SettingsPanel({ 
  onSignOut, 
  displayName,
  cloudProfile,
  onUpdatePreferredName,
  onUpdateAvatar
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const { theme, setTheme } = useTheme();
  const { profile, updateProfile } = useWellnessData();
  
  // Notification settings state (stored in localStorage)
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('vitaltrack_notification_settings');
    return saved ? JSON.parse(saved) : {
      dailyReminders: true,
      goalAlerts: true,
      streakWarnings: true,
    };
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    localStorage.setItem('vitaltrack_notification_settings', JSON.stringify(updated));
  };

  const handleUpdateProfile = async () => {
    if (editName.trim()) {
      if (onUpdatePreferredName) {
        const { error } = await onUpdatePreferredName(editName.trim());
        if (error) {
          toast.error('Failed to update name');
          return;
        }
      }
      updateProfile({ name: editName.trim() });
      setShowEditProfile(false);
      toast.success('Profile updated!');
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl hover:bg-muted transition-colors"
        aria-label="Open settings menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Full-screen Overlay with Blur */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-md z-50"
            />
            
            {/* Full-screen Settings Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex-shrink-0 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Settings</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-card/80 hover:bg-card transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-8">
                <div className="max-w-sm mx-auto space-y-6">
                {/* User Profile Section */}
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </h3>
                  <div className="bg-muted/50 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <AvatarDisplay 
                        avatar={profile.avatar}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{displayName || profile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {profile.streak} day streak • {profile.totalPoints} pts
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditName(displayName || profile.name);
                          setShowEditProfile(true);
                        }}
                        className="p-2 rounded-lg hover:bg-muted"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Theme Selector */}
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Theme
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {themeOptions.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setTheme(value)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                          theme === value 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <Separator />

                {/* Notification Settings */}
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium">Daily Reminders</p>
                        <p className="text-xs text-muted-foreground">Get reminded to log activities</p>
                      </div>
                      <Switch
                        checked={notifications.dailyReminders}
                        onCheckedChange={(checked) => handleNotificationChange('dailyReminders', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium">Goal Alerts</p>
                        <p className="text-xs text-muted-foreground">Celebrate when goals are met</p>
                      </div>
                      <Switch
                        checked={notifications.goalAlerts}
                        onCheckedChange={(checked) => handleNotificationChange('goalAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium">Streak Warnings</p>
                        <p className="text-xs text-muted-foreground">Don't break your streak</p>
                      </div>
                      <Switch
                        checked={notifications.streakWarnings}
                        onCheckedChange={(checked) => handleNotificationChange('streakWarnings', checked)}
                      />
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Privacy */}
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Privacy
                  </h3>
                  <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Your data is stored locally on your device and securely in the cloud when signed in.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Shield className="w-4 h-4 mr-2" />
                      Privacy Policy
                    </Button>
                  </div>
                </section>

                <Separator />

                {/* About */}
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    About
                  </h3>
                  <div className="bg-muted/50 rounded-2xl p-4">
                    <div className="text-center">
                      <h4 className="font-bold text-lg text-primary">VitalTrack</h4>
                      <p className="text-xs text-muted-foreground mt-1">Version 1.0.0</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Your daily wellness companion for tracking water, nutrition, fitness, and sleep.
                      </p>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Logout */}
                {onSignOut && (
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={() => {
                      setIsOpen(false);
                      onSignOut();
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Preferred Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="What should we call you?"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This name will appear in personalized greetings
              </p>
            </div>
            <Button onClick={handleUpdateProfile} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
