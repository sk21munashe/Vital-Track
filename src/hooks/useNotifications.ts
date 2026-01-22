import { useState, useEffect, useCallback, useRef } from 'react';
import { LocalNotifications, ScheduleOptions, LocalNotificationSchema } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
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

// Notification channel IDs for Android 8+
const CHANNELS = {
  WATER: 'vitaltrack-water',
  GOALS: 'vitaltrack-goals',
  MOTIVATION: 'vitaltrack-motivation',
  WEEKLY: 'vitaltrack-weekly',
};

// Notification IDs (unique per notification type)
const NOTIFICATION_IDS = {
  AI_MOTIVATION: 1,
  WATER_10AM: 2,
  WATER_2PM: 3,
  WATER_6PM: 4,
  CHECKIN_12PM: 5,
  CHECKIN_8PM: 6,
  WEEKLY_RECAP: 7,
  TEST: 100,
};

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default');
  const [isLoading, setIsLoading] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  // Create notification channels for Android 8+
  const createNotificationChannels = useCallback(async () => {
    if (!isNative) return;

    try {
      await LocalNotifications.createChannel({
        id: CHANNELS.WATER,
        name: 'Water Reminders',
        description: 'Reminders to stay hydrated',
        importance: 4, // HIGH
        visibility: 1, // PUBLIC
        sound: 'default',
        vibration: true,
      });

      await LocalNotifications.createChannel({
        id: CHANNELS.GOALS,
        name: 'Goal Check-ins',
        description: 'Daily goal progress updates',
        importance: 3, // DEFAULT
        visibility: 1,
        sound: 'default',
        vibration: true,
      });

      await LocalNotifications.createChannel({
        id: CHANNELS.MOTIVATION,
        name: 'AI Motivation',
        description: 'Personalized motivational messages',
        importance: 3,
        visibility: 1,
        sound: 'default',
        vibration: true,
      });

      await LocalNotifications.createChannel({
        id: CHANNELS.WEEKLY,
        name: 'Weekly Recap',
        description: 'Weekly progress summary',
        importance: 3,
        visibility: 1,
        sound: 'default',
        vibration: true,
      });
    } catch (error) {
      console.error('Error creating notification channels:', error);
    }
  }, [isNative]);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
      
      // Check current permission status
      checkPermissionStatus();
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }, []);

  // Check permission status
  const checkPermissionStatus = useCallback(async () => {
    if (isNative) {
      try {
        const status = await LocalNotifications.checkPermissions();
        if (status.display === 'granted') {
          setPermissionStatus('granted');
        } else if (status.display === 'denied') {
          setPermissionStatus('denied');
        } else {
          setPermissionStatus('default');
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setPermissionStatus('default');
      }
    } else {
      // For web preview, just set as default
      setPermissionStatus('default');
    }
  }, [isNative]);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  }, []);

  // Request notification permission - ONLY called on user action
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isNative) {
      // In web preview, just enable without actual notifications
      console.log('Notifications work best in the native app');
      return true;
    }

    try {
      const status = await LocalNotifications.requestPermissions();
      
      if (status.display === 'granted') {
        setPermissionStatus('granted');
        await createNotificationChannels();
        saveSettings({ ...settings, enabled: true });
        return true;
      } else {
        // Silently disable if denied
        setPermissionStatus('denied');
        saveSettings({ ...settings, enabled: false });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isNative, settings, saveSettings, createNotificationChannels]);

  // Enable notifications - entry point for user action
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        await scheduleNotifications();
      }
      return granted;
    } finally {
      setIsLoading(false);
    }
  }, [requestPermission]);

  // Disable notifications
  const disableNotifications = useCallback(async () => {
    saveSettings({ ...settings, enabled: false });
    await clearScheduledNotifications();
  }, [settings, saveSettings]);

  // Clear all scheduled notifications
  const clearScheduledNotifications = useCallback(async () => {
    if (!isNative) return;

    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map(n => ({ id: n.id })),
        });
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, [isNative]);

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

    if (waterPercent < 50 && timeOfDay !== 'morning') {
      return `Your body is 60% water—let's hydrate! 💧 Only ${waterRemaining}ml to go!`;
    }

    if (caloriePercent >= 80 && caloriePercent <= 100) {
      return `You're killing it! 🎯 Only ${caloriesRemaining} calories left today.`;
    }

    if (progress.streak >= 3) {
      return `${progress.streak}-day streak! Don't break the chain! 🔥`;
    }

    if (progress.yesterdayWater < progress.waterGoal * 0.5) {
      return "Today's a fresh start. Let's get back on track! 🌟";
    }

    if (progress.weeklyGoalsMet >= 5) {
      return "AI Tip: You're on fire! Try adding more protein for extra energy! 💪";
    }

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

  // Schedule a single notification at specific time
  const scheduleNotificationAt = useCallback(async (
    id: number,
    title: string,
    body: string,
    hour: number,
    minute: number,
    channelId: string
  ) => {
    if (!isNative) return;

    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(hour, minute, 0, 0);

    // If time has passed, schedule for tomorrow
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    try {
      await LocalNotifications.schedule({
        notifications: [{
          id,
          title,
          body,
          schedule: { at: targetTime },
          channelId,
          sound: 'default',
          smallIcon: 'ic_stat_notification',
          largeIcon: 'ic_launcher',
          autoCancel: true,
        }],
      });
    } catch (error) {
      console.error(`Error scheduling notification ${id}:`, error);
    }
  }, [isNative]);

  // Send immediate notification
  const sendNotification = useCallback(async (title: string, body: string, tag?: string) => {
    if (!settings.enabled) return;

    // Check throttling
    const lastNotifications = JSON.parse(localStorage.getItem(LAST_NOTIFICATION_KEY) || '{}');
    const now = Date.now();
    
    if (tag && lastNotifications[tag] && now - lastNotifications[tag] < 30 * 60 * 1000) {
      return;
    }

    if (isNative) {
      try {
        await LocalNotifications.schedule({
          notifications: [{
            id: Math.floor(Math.random() * 10000) + 1000,
            title,
            body,
            schedule: { at: new Date(Date.now() + 100) }, // Immediate
            channelId: CHANNELS.MOTIVATION,
            sound: 'default',
            smallIcon: 'ic_stat_notification',
            largeIcon: 'ic_launcher',
            autoCancel: true,
          }],
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }

    // Update last notification time
    if (tag) {
      lastNotifications[tag] = now;
      localStorage.setItem(LAST_NOTIFICATION_KEY, JSON.stringify(lastNotifications));
    }
  }, [settings.enabled, isNative]);

  // Schedule all notifications for the day
  const scheduleNotifications = useCallback(async () => {
    await clearScheduledNotifications();

    if (!settings.enabled || !isNative) return;

    const progress = getProgressFromStorage();
    const now = new Date();

    // 9 AM - Daily AI Motivation
    if (settings.aiMotivation) {
      const message = await getAIMotivationalMessage(progress);
      await scheduleNotificationAt(
        NOTIFICATION_IDS.AI_MOTIVATION,
        'VitalTrack 🌟',
        message,
        9, 0,
        CHANNELS.MOTIVATION
      );
    }

    // 10 AM - Water reminder
    if (settings.waterReminders) {
      await scheduleNotificationAt(
        NOTIFICATION_IDS.WATER_10AM,
        'Hydration Reminder 💧',
        'Time to drink some water! Stay hydrated for better focus and energy.',
        10, 0,
        CHANNELS.WATER
      );
    }

    // 12 PM - Goal Check-in
    if (settings.goalCheckIns) {
      const message = await getAIMotivationalMessage(progress);
      await scheduleNotificationAt(
        NOTIFICATION_IDS.CHECKIN_12PM,
        'Midday Check-in 📊',
        message,
        12, 0,
        CHANNELS.GOALS
      );
    }

    // 2 PM - Water reminder
    if (settings.waterReminders) {
      await scheduleNotificationAt(
        NOTIFICATION_IDS.WATER_2PM,
        'Stay Hydrated 💧',
        "You're halfway through the day! Keep up with your water intake!",
        14, 0,
        CHANNELS.WATER
      );
    }

    // 6 PM - Water reminder
    if (settings.waterReminders) {
      await scheduleNotificationAt(
        NOTIFICATION_IDS.WATER_6PM,
        'Evening Hydration 💧',
        "Evening check! Let's finish strong with your water goal!",
        18, 0,
        CHANNELS.WATER
      );
    }

    // 8 PM - Evening Goal Check-in
    if (settings.goalCheckIns) {
      const message = await getAIMotivationalMessage(progress);
      await scheduleNotificationAt(
        NOTIFICATION_IDS.CHECKIN_8PM,
        'Evening Wrap-up 🌙',
        message,
        20, 0,
        CHANNELS.GOALS
      );
    }

    // Sunday 7 PM - Weekly Recap
    if (settings.weeklyRecap && now.getDay() === 0) {
      await scheduleNotificationAt(
        NOTIFICATION_IDS.WEEKLY_RECAP,
        'Weekly Recap 📈',
        `Great week! You maintained a ${progress.streak}-day streak and hit your goals ${progress.weeklyGoalsMet} times!`,
        19, 0,
        CHANNELS.WEEKLY
      );
    }
  }, [settings, isNative, clearScheduledNotifications, scheduleNotificationAt, getAIMotivationalMessage]);

  // Get progress from localStorage
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
    if (settings.enabled && (permissionStatus === 'granted' || !isNative)) {
      scheduleNotifications();
    }
    
    return () => {
      clearScheduledNotifications();
    };
  }, [settings.enabled, permissionStatus, isNative]);

  // Update individual settings
  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Send immediate test notification
  const sendTestNotification = useCallback(async () => {
    if (!isNative) {
      // For web, show a toast instead
      console.log('Test notification: Notifications work best in the native app!');
      return true;
    }

    if (permissionStatus !== 'granted') {
      return false;
    }
    
    const progress = getProgressFromStorage();
    const message = await getAIMotivationalMessage(progress);
    
    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: NOTIFICATION_IDS.TEST,
          title: 'VitalTrack Test ✨',
          body: message,
          schedule: { at: new Date(Date.now() + 500) },
          channelId: CHANNELS.MOTIVATION,
          sound: 'default',
          smallIcon: 'ic_stat_notification',
          largeIcon: 'ic_launcher',
          autoCancel: true,
        }],
      });
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }, [isNative, permissionStatus, getProgressFromStorage, getAIMotivationalMessage]);

  // Listen for notification actions
  useEffect(() => {
    if (!isNative) return;

    const setupListeners = async () => {
      await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('Notification action performed:', notification);
        // Handle notification tap - could navigate to specific screen
      });
    };

    setupListeners();

    return () => {
      LocalNotifications.removeAllListeners();
    };
  }, [isNative]);

  return {
    settings,
    permissionStatus,
    isLoading,
    isSupported: true, // Always true since we handle both native and web gracefully
    enableNotifications,
    disableNotifications,
    updateSettings,
    sendTestNotification,
    sendNotification,
    getAIMotivationalMessage,
    getProgressFromStorage,
  };
}
