import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
import { SUPPORTED_LANGUAGES } from '@/i18n/config';

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
  const { t, i18n } = useTranslation();
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
    language: i18n.language,
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
    i18n.changeLanguage(value);
    localStorage.setItem('app_language', value);
    toast.success(t('settings.languageSaved'));
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
            <h1 className="text-xl sm:text-2xl font-bold">{t('settings.title')}</h1>
          </div>
        </div>
      </header>

      {/* Account Section */}
      <div className="px-4 sm:px-5 md:px-8 mt-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          {t('settings.account')}
        </h2>
        <DashboardCard className="p-1">
          <SettingRow 
            icon={User}
            label={t('settings.personalDetails')}
            value={displayName || t('settings.notSet')}
            onClick={() => setShowEditDetails(true)}
          />
          <div className="border-t border-border/50 mx-3" />
          <SettingRow 
            icon={LogOut}
            label={t('settings.signOut')}
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
              <span className="text-sm sm:text-base font-medium text-destructive">{t('settings.deleteAccount')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-destructive" />
          </button>
        </DashboardCard>
      </div>

      {/* General Section */}
      <div className="px-4 sm:px-5 md:px-8 mt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          {t('settings.general')}
        </h2>
        <DashboardCard className="p-1">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <span className="text-sm sm:text-base font-medium">{t('settings.language')}</span>
              </div>
              <Select value={settings.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[120px] sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.nativeName}
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
                  <span className="text-sm sm:text-base font-medium">{t('settings.units')}</span>
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
                  <SelectItem value="metric">{t('settings.metric')}</SelectItem>
                  <SelectItem value="imperial">{t('settings.imperial')}</SelectItem>
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
                  <span className="text-sm sm:text-base font-medium">{t('settings.smartReminders')}</span>
                  <p className="text-xs text-muted-foreground">{t('settings.aiPoweredNotifications')}</p>
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
                        toast.success(t('settings.notificationsEnabled'), {
                          description: t('settings.notificationsEnabledDesc'),
                        });
                      } else if (permissionStatus === 'denied') {
                        toast.error(t('settings.notificationsBlocked'), {
                          description: t('settings.notificationsBlockedDesc'),
                        });
                      }
                    }}
                    disabled={notificationLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 hover:border-primary/50 transition-all"
                  >
                    <BellRing className="w-5 h-5 text-primary" />
                    <span className="font-medium text-primary">
                      {notificationLoading ? t('settings.enabling') : t('settings.enableSmartReminders')}
                    </span>
                    <Sparkles className="w-4 h-4 text-primary" />
                  </motion.button>
                ) : (
                <>
                    {/* Enabled State - Show toggle options */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">{t('settings.notificationsActive')}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          disableNotifications();
                          toast.success(t('settings.notificationsDisabled'));
                        }}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        {t('settings.disable')}
                      </Button>
                    </div>
                    
                    {/* Individual notification type toggles */}
                    <div className="space-y-3 pl-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-water" />
                          <span className="text-sm text-muted-foreground">{t('settings.waterReminders')}</span>
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
                          <span className="text-sm text-muted-foreground">{t('settings.goalCheckIns')}</span>
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
                          <span className="text-sm text-muted-foreground">{t('settings.aiMotivation')}</span>
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
                          <span className="text-sm text-muted-foreground">{t('settings.weeklyRecap')}</span>
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
                          toast.success(t('settings.testNotificationSent'));
                        } else {
                          toast.error(t('settings.couldNotSendNotification'));
                        }
                      }}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      {t('settings.sendTestNotification')}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('settings.notificationsNotSupported')}
                </p>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Help & Support Section */}
      <div className="px-4 sm:px-5 md:px-8 mt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          {t('settings.help')}
        </h2>
        <DashboardCard className="p-1">
          <SettingRow 
            icon={RotateCcw}
            label={t('settings.replayTour')}
            onClick={handleReplayTour}
          />
        </DashboardCard>
      </div>

      {/* Support Section */}
      <div className="px-4 sm:px-5 md:px-8 mt-6 mb-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          {t('settings.support')}
        </h2>
        <DashboardCard className="p-1">
          <SettingRow 
            icon={Shield}
            label={t('settings.privacyPolicy')}
            disabled
          />
          <div className="border-t border-border/50 mx-3" />
          <SettingRow 
            icon={Mail}
            label={t('settings.contactUs')}
            disabled
          />
          <div className="border-t border-border/50 mx-3" />
          <SettingRow 
            icon={Share2}
            label={t('settings.shareApp')}
            disabled
          />
          <div className="border-t border-border/50 mx-3" />
          <SettingRow 
            icon={Star}
            label={t('settings.rateUs')}
            disabled
          />
          <div className="border-t border-border/50 mx-3" />
          <SettingRow 
            icon={Info}
            label={t('settings.about')}
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
            <DialogTitle>{t('settings.personalDetails')}</DialogTitle>
            <DialogDescription>
              {t('settings.updatePersonalInfo')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>{t('settings.username')}</Label>
              <Input
                value={settings.username}
                onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
                placeholder={t('settings.yourName')}
              />
            </div>
            <div>
              <Label>{t('settings.age')}</Label>
              <Input
                type="number"
                value={settings.age}
                onChange={(e) => setSettings(prev => ({ ...prev, age: e.target.value }))}
                placeholder="25"
              />
            </div>
            <div>
              <Label>{t('settings.height')} ({settings.units === 'metric' ? 'cm' : 'feet'})</Label>
              <Input
                type="number"
                value={settings.height}
                onChange={(e) => setSettings(prev => ({ ...prev, height: e.target.value }))}
                placeholder={settings.units === 'metric' ? '175' : '5.9'}
              />
            </div>
            <div>
              <Label>{t('settings.weight')} ({settings.units === 'metric' ? 'kg' : 'lbs'})</Label>
              <Input
                type="number"
                value={settings.weight}
                onChange={(e) => setSettings(prev => ({ ...prev, weight: e.target.value }))}
                placeholder={settings.units === 'metric' ? '70' : '154'}
              />
            </div>
            <Button onClick={handleSaveDetails} className="w-full">
              {t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sign Out Confirmation */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.signOut')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.signOutConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>{t('settings.signOut')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">{t('settings.deleteAccount')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.deleteAccountConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('settings.deleteAccount')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
