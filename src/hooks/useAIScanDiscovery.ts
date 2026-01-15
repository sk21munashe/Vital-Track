import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  FIRST_TIME_TOOLTIP_SHOWN: 'ai_scan_first_time_tooltip_shown',
  LAST_SCAN_DATE: 'ai_scan_last_used_date',
  LAST_REENGAGEMENT_SHOWN: 'ai_scan_reengagement_shown_date',
  MEAL_TIME_BANNER_DISMISSED: 'ai_scan_meal_banner_dismissed',
};

interface DiscoveryState {
  showFirstTimeTooltip: boolean;
  showReengagementSuggestion: boolean;
  showEmptyStateCard: boolean;
  showMealTimeBanner: boolean;
  currentMealWindow: 'breakfast' | 'lunch' | 'dinner' | null;
}

export function useAIScanDiscovery(hasMealsToday: boolean) {
  const [state, setState] = useState<DiscoveryState>({
    showFirstTimeTooltip: false,
    showReengagementSuggestion: false,
    showEmptyStateCard: false,
    showMealTimeBanner: false,
    currentMealWindow: null,
  });

  // Get current meal window based on time
  const getMealWindow = useCallback((): 'breakfast' | 'lunch' | 'dinner' | null => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 10) return 'breakfast';
    if (hour >= 11 && hour < 14) return 'lunch';
    if (hour >= 18 && hour < 21) return 'dinner';
    return null;
  }, []);

  // Check if meal time banner was dismissed today for current window
  const isBannerDismissedForWindow = useCallback((window: string): boolean => {
    const dismissed = localStorage.getItem(STORAGE_KEYS.MEAL_TIME_BANNER_DISMISSED);
    if (!dismissed) return false;
    
    try {
      const data = JSON.parse(dismissed);
      const today = new Date().toDateString();
      return data.date === today && data.window === window;
    } catch {
      return false;
    }
  }, []);

  // Initialize and update discovery state
  useEffect(() => {
    const checkDiscoveryState = () => {
      
      // Layer 1: First-time tooltip
      const firstTimeShown = localStorage.getItem(STORAGE_KEYS.FIRST_TIME_TOOLTIP_SHOWN);
      const showFirstTimeTooltip = !firstTimeShown;
      
      // Layer 2: Re-engagement (3 days without scan)
      const lastScanDate = localStorage.getItem(STORAGE_KEYS.LAST_SCAN_DATE);
      const lastReengagementShown = localStorage.getItem(STORAGE_KEYS.LAST_REENGAGEMENT_SHOWN);
      let showReengagementSuggestion = false;
      
      if (lastScanDate && !showFirstTimeTooltip) {
        const daysSinceLastScan = Math.floor(
          (Date.now() - new Date(lastScanDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Show if 3+ days since last scan AND not shown in the last 7 days
        if (daysSinceLastScan >= 3) {
          if (lastReengagementShown) {
            const daysSinceReengagement = Math.floor(
              (Date.now() - new Date(lastReengagementShown).getTime()) / (1000 * 60 * 60 * 24)
            );
            showReengagementSuggestion = daysSinceReengagement >= 7;
          } else {
            showReengagementSuggestion = true;
          }
        }
      }
      
      // Layer 3: Empty state card (no meals today)
      const showEmptyStateCard = !hasMealsToday && !showFirstTimeTooltip;
      
      // Layer 4: Meal time banner
      const mealWindow = getMealWindow();
      const showMealTimeBanner = 
        mealWindow !== null && 
        !isBannerDismissedForWindow(mealWindow) &&
        !showFirstTimeTooltip;
      
      setState({
        showFirstTimeTooltip,
        showReengagementSuggestion,
        showEmptyStateCard,
        showMealTimeBanner,
        currentMealWindow: mealWindow,
      });
    };
    
    checkDiscoveryState();
    
    // Re-check every minute for meal time windows
    const interval = setInterval(checkDiscoveryState, 60000);
    return () => clearInterval(interval);
  }, [hasMealsToday, getMealWindow, isBannerDismissedForWindow]);

  // Dismiss first-time tooltip
  const dismissFirstTimeTooltip = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.FIRST_TIME_TOOLTIP_SHOWN, 'true');
    setState(prev => ({ ...prev, showFirstTimeTooltip: false }));
  }, []);

  // Dismiss re-engagement suggestion
  const dismissReengagement = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.LAST_REENGAGEMENT_SHOWN, new Date().toISOString());
    setState(prev => ({ ...prev, showReengagementSuggestion: false }));
  }, []);

  // Dismiss meal time banner
  const dismissMealTimeBanner = useCallback(() => {
    const mealWindow = getMealWindow();
    if (mealWindow) {
      localStorage.setItem(STORAGE_KEYS.MEAL_TIME_BANNER_DISMISSED, JSON.stringify({
        date: new Date().toDateString(),
        window: mealWindow,
      }));
    }
    setState(prev => ({ ...prev, showMealTimeBanner: false }));
  }, [getMealWindow]);

  // Record that user used the scanner
  const recordScanUsage = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.LAST_SCAN_DATE, new Date().toISOString());
    // Also dismiss first-time tooltip if shown
    if (!localStorage.getItem(STORAGE_KEYS.FIRST_TIME_TOOLTIP_SHOWN)) {
      localStorage.setItem(STORAGE_KEYS.FIRST_TIME_TOOLTIP_SHOWN, 'true');
    }
    setState(prev => ({
      ...prev,
      showFirstTimeTooltip: false,
      showReengagementSuggestion: false,
      showEmptyStateCard: false,
    }));
  }, []);

  // When user logs any food (scan or manual)
  const onFoodLogged = useCallback(() => {
    setState(prev => ({ ...prev, showEmptyStateCard: false }));
  }, []);

  return {
    ...state,
    dismissFirstTimeTooltip,
    dismissReengagement,
    dismissMealTimeBanner,
    recordScanUsage,
    onFoodLogged,
  };
}
