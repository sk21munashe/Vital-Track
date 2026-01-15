import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSettings {
  enabled: boolean;
  waterReminders: boolean;
  goalCheckIns: boolean;
  aiMotivation: boolean;
  weeklyRecap: boolean;
}

interface UserProgress {
  waterIntake: number;
  waterGoal: number;
  caloriesConsumed: number;
  calorieGoal: number;
  streak: number;
  yesterdayWater: number;
  weeklyGoalsMet: number;
}

const STORAGE_KEY = 'vitaltrack_notification_settings';
const LAST_NOTIFICATION_KEY = 'vitaltrack_last_notifications';

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  waterReminders: true,
  goalCheckIns: true,
  aiMotivation: true,
  weeklyRecap: true,
};

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const scheduledTimersRef = useRef<NodeJS.Timeout[]>([]);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
      
      // Check current permission status without requesting
      if ('Notification' in window) {
        setPermissionStatus(Notification.permission);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  }, []);

  // Request notification permission - ONLY called on user action
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        saveSettings({ ...settings, enabled: true });
        return true;
      } else {
        // Silently disable if denied
        saveSettings({ ...settings, enabled: false });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [settings, saveSettings]);

  // Enable notifications - entry point for user action
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        scheduleNotifications();
      }
      return granted;
    } finally {
      setIsLoading(false);
    }
  }, [requestPermission]);

  // Disable notifications
  const disableNotifications = useCallback(() => {
    saveSettings({ ...settings, enabled: false });
    clearScheduledNotifications();
  }, [settings, saveSettings]);

  // Clear all scheduled notifications
  const clearScheduledNotifications = useCallback(() => {
    scheduledTimersRef.current.forEach(timer => clearTimeout(timer));
    scheduledTimersRef.current = [];
  }, []);

  // Get time of day for context
  const getTimeOfDay = useCallback((): 'morning' | 'afternoon' | 'evening' => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }, []);

  // Get AI-powered motivational message
  const getAIMotivationalMessage = useCallback(async (progress: UserProgress): Promise<string> => {
    try {
      const response = await supabase.functions.invoke('generate-motivation', {
        body: { progress, timeOfDay: getTimeOfDay() }
      });

      if (response.error) {
        throw response.error;
      }

      return response.data?.message || getLocalMotivationalMessage(progress);
    } catch (error) {
      console.error('AI motivation error:', error);
      // Fallback to local message
      return getLocalMotivationalMessage(progress);
    }
  }, [getTimeOfDay]);

  // Local fallback motivational messages
  const getLocalMotivationalMessage = useCallback((progress: UserProgress): string => {
    const timeOfDay = getTimeOfDay();
    const waterRemaining = progress.waterGoal - progress.waterIntake;
    const caloriesRemaining = progress.calorieGoal - progress.caloriesConsumed;
    const waterPercent = Math.round((progress.waterIntake / progress.waterGoal) * 100);
    const caloriePercent = Math.round((progress.caloriesConsumed / progress.calorieGoal) * 100);

    // Water reminders
    if (waterPercent < 50 && timeOfDay !== 'morning') {
      return `Your body is 60% water—let's hydrate! 💧 Only ${waterRemaining}ml to go!`;
    }

    // Close to calorie goal
    if (caloriePercent >= 80 && caloriePercent <= 100) {
      return `You're killing it! 🎯 Only ${caloriesRemaining} calories left today.`;
    }

    // Streak motivation
    if (progress.streak >= 3) {
      return `${progress.streak}-day streak! Don't break the chain! 🔥`;
    }

    // Missed yesterday
    if (progress.yesterdayWater < progress.waterGoal * 0.5) {
      return "Today's a fresh start. Let's get back on track! 🌟";
    }

    // Consistently hitting goals
    if (progress.weeklyGoalsMet >= 5) {
      return "AI Tip: You're on fire! Try adding more protein for extra energy! 💪";
    }

    // Time-based defaults
    switch (timeOfDay) {
      case 'morning':
        return "Good morning! Start strong and make today count! ☀️";
      case 'afternoon':
        return "Keep the momentum going! You're doing great! 🚀";
      case 'evening':
        return "Finish the day well! You're almost there! 🌙";
      default:
        return "Every step counts on your wellness journey! ✨";
    }
  }, [getTimeOfDay]);

  // Send a notification
  const sendNotification = useCallback(async (title: string, body: string, tag?: string) => {
    if (!settings.enabled || permissionStatus !== 'granted') {
      return;
    }

    try {
      // Check if we should throttle this notification
      const lastNotifications = JSON.parse(localStorage.getItem(LAST_NOTIFICATION_KEY) || '{}');
      const now = Date.now();
      
      if (tag && lastNotifications[tag] && now - lastNotifications[tag] < 30 * 60 * 1000) {
        // Skip if same type sent within 30 minutes
        return;
      }

      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: tag || 'vitaltrack-notification',
        requireInteraction: false,
        silent: false,
      });

      // Update last notification time
      if (tag) {
        lastNotifications[tag] = now;
        localStorage.setItem(LAST_NOTIFICATION_KEY, JSON.stringify(lastNotifications));
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      // Don't retry aggressively
    }
  }, [settings.enabled, permissionStatus]);

  // Schedule notifications for the day
  const scheduleNotifications = useCallback(() => {
    clearScheduledNotifications();

    if (!settings.enabled || permissionStatus !== 'granted') {
      return;
    }

    const now = new Date();
    const today = now.toDateString();

    // Helper to schedule a notification at a specific hour
    const scheduleAt = (hour: number, minute: number, callback: () => void) => {
      const targetTime = new Date();
      targetTime.setHours(hour, minute, 0, 0);

      if (targetTime <= now) {
        // Already passed today, skip
        return;
      }

      const delay = targetTime.getTime() - now.getTime();
      const timer = setTimeout(callback, delay);
      scheduledTimersRef.current.push(timer);
    };

    // 9 AM - Daily AI Motivation
    if (settings.aiMotivation) {
      scheduleAt(9, 0, async () => {
        const progress = getProgressFromStorage();
        const message = await getAIMotivationalMessage(progress);
        sendNotification('VitalTrack 🌟', message, 'ai-motivation');
      });
    }

    // 10 AM - Water reminder (if behind)
    if (settings.waterReminders) {
      scheduleAt(10, 0, () => {
        const progress = getProgressFromStorage();
        if (progress.waterIntake < progress.waterGoal * 0.3) {
          sendNotification('Hydration Reminder 💧', `Time to drink some water! You're at ${Math.round((progress.waterIntake / progress.waterGoal) * 100)}% of your goal.`, 'water-10am');
        }
      });
    }

    // 12 PM - Goal Check-in
    if (settings.goalCheckIns) {
      scheduleAt(12, 0, async () => {
        const progress = getProgressFromStorage();
        const message = await getAIMotivationalMessage(progress);
        sendNotification('Midday Check-in 📊', message, 'checkin-12pm');
      });
    }

    // 2 PM - Water reminder (if behind)
    if (settings.waterReminders) {
      scheduleAt(14, 0, () => {
        const progress = getProgressFromStorage();
        if (progress.waterIntake < progress.waterGoal * 0.5) {
          const remaining = progress.waterGoal - progress.waterIntake;
          sendNotification('Stay Hydrated 💧', `You're halfway through the day! ${remaining}ml to go!`, 'water-2pm');
        }
      });
    }

    // 6 PM - Water reminder (if behind)
    if (settings.waterReminders) {
      scheduleAt(18, 0, () => {
        const progress = getProgressFromStorage();
        if (progress.waterIntake < progress.waterGoal * 0.75) {
          sendNotification('Evening Hydration 💧', `Evening check! Let's finish strong with your water goal!`, 'water-6pm');
        }
      });
    }

    // 8 PM - Evening Goal Check-in
    if (settings.goalCheckIns) {
      scheduleAt(20, 0, async () => {
        const progress = getProgressFromStorage();
        const caloriePercent = Math.round((progress.caloriesConsumed / progress.calorieGoal) * 100);
        const waterPercent = Math.round((progress.waterIntake / progress.waterGoal) * 100);
        
        if (caloriePercent >= 90 && waterPercent >= 90) {
          sendNotification('Amazing Day! 🎉', `You crushed it today! Calories: ${caloriePercent}%, Water: ${waterPercent}%`, 'checkin-8pm');
        } else {
          const message = await getAIMotivationalMessage(progress);
          sendNotification('Evening Wrap-up 🌙', message, 'checkin-8pm');
        }
      });
    }

    // Sunday 7 PM - Weekly Recap
    if (settings.weeklyRecap && now.getDay() === 0) {
      scheduleAt(19, 0, () => {
        const progress = getProgressFromStorage();
        sendNotification('Weekly Recap 📈', `Great week! You maintained a ${progress.streak}-day streak and hit your goals ${progress.weeklyGoalsMet} times!`, 'weekly-recap');
      });
    }
  }, [settings, permissionStatus, clearScheduledNotifications, sendNotification, getAIMotivationalMessage]);

  // Get progress from localStorage (used by scheduled notifications)
  const getProgressFromStorage = useCallback((): UserProgress => {
    try {
      const waterLogs = JSON.parse(localStorage.getItem('vitaltrack_water_logs') || '[]');
      const foodLogs = JSON.parse(localStorage.getItem('vitaltrack_food_logs') || '[]');
      const profile = JSON.parse(localStorage.getItem('vitaltrack_user_profile') || '{}');
      
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      const todayWater = waterLogs
        .filter((log: any) => log.date === today)
        .reduce((sum: number, log: any) => sum + log.amount, 0);
      
      const yesterdayWater = waterLogs
        .filter((log: any) => log.date === yesterday)
        .reduce((sum: number, log: any) => sum + log.amount, 0);
      
      const todayCalories = foodLogs
        .filter((log: any) => log.date === today)
        .reduce((sum: number, log: any) => sum + (log.foodItem?.calories || 0), 0);

      return {
        waterIntake: todayWater,
        waterGoal: profile.goals?.waterGoal || 2000,
        caloriesConsumed: todayCalories,
        calorieGoal: profile.goals?.calorieGoal || 2000,
        streak: profile.streak || 0,
        yesterdayWater,
        weeklyGoalsMet: Math.min(profile.streak || 0, 7),
      };
    } catch (error) {
      console.error('Error getting progress from storage:', error);
      return {
        waterIntake: 0,
        waterGoal: 2000,
        caloriesConsumed: 0,
        calorieGoal: 2000,
        streak: 0,
        yesterdayWater: 0,
        weeklyGoalsMet: 0,
      };
    }
  }, []);

  // Re-schedule when settings change
  useEffect(() => {
    if (settings.enabled && permissionStatus === 'granted') {
      scheduleNotifications();
    }
    
    return () => clearScheduledNotifications();
  }, [settings.enabled, permissionStatus, scheduleNotifications, clearScheduledNotifications]);

  // Update individual settings
  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Send immediate test notification
  const sendTestNotification = useCallback(async () => {
    if (permissionStatus !== 'granted') {
      return false;
    }
    
    const progress = getProgressFromStorage();
    const message = await getAIMotivationalMessage(progress);
    sendNotification('VitalTrack Test ✨', message, 'test');
    return true;
  }, [permissionStatus, getProgressFromStorage, getAIMotivationalMessage, sendNotification]);

  return {
    settings,
    permissionStatus,
    isLoading,
    isSupported: 'Notification' in window,
    enableNotifications,
    disableNotifications,
    updateSettings,
    sendTestNotification,
    sendNotification,
    getAIMotivationalMessage,
    getProgressFromStorage,
  };
}
