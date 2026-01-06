import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek, subWeeks, subMonths } from 'date-fns';
import { JourneyData } from './types';

interface ProgressTrendsProps {
  data: JourneyData;
}

type TimeFrame = 'week' | 'month' | 'year';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function ProgressTrends({ data }: ProgressTrendsProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('week');

  // Generate weekly data from actual history
  const getWeeklyData = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    return DAYS.map((dayName, index) => {
      const daysFromMonday = index;
      const daysFromToday = mondayOffset - daysFromMonday;
      
      if (daysFromToday < 0) {
        // Future day
        return { label: dayName, progress: 0, isFuture: true };
      }
      
      // Find matching data from history
      const historyIndex = 6 - daysFromToday;
      const waterValue = data.water.history[historyIndex]?.value || 0;
      const caloriesValue = data.calories.history[historyIndex]?.value || 0;
      
      const waterProgress = Math.min((waterValue / data.water.goal) * 100, 100);
      const caloriesProgress = Math.min((caloriesValue / data.calories.goal) * 100, 100);
      const combinedProgress = Math.round((waterProgress + caloriesProgress) / 2);
      
      return { label: dayName, progress: combinedProgress, isFuture: false };
    });
  };

  // Generate monthly data (4 weeks)
  const getMonthlyData = () => {
    return [
      { label: 'Week 1', progress: 92, isFuture: false },
      { label: 'Week 2', progress: 78, isFuture: false },
      { label: 'Week 3', progress: 45, isFuture: false },
      { label: 'Week 4', progress: 88, isFuture: false },
    ];
  };

  // Generate yearly data (12 months)
  const getYearlyData = () => {
    const currentMonth = new Date().getMonth();
    return MONTHS.slice(0, currentMonth + 1).map((month) => ({
      label: month,
      isFuture: false,
      progress: Math.floor(Math.random() * 50) + 50, // Placeholder - would come from real data
    }));
  };

  const getData = () => {
    switch (timeFrame) {
      case 'week': return getWeeklyData();
      case 'month': return getMonthlyData();
      case 'year': return getYearlyData();
    }
  };

  const getTrendTitle = () => {
    switch (timeFrame) {
      case 'week': return 'WEEKLY TRENDS';
      case 'month': return 'MONTHLY OVERVIEW';
      case 'year': return 'YEARLY TRENDS';
    }
  };

  const chartData = getData();

  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm rounded-2xl border border-border/30 overflow-hidden">
      {/* Timeframe Tabs */}
      <div className="flex justify-center gap-1 p-3 pb-2">
        {(['week', 'month', 'year'] as TimeFrame[]).map((tf) => (
          <motion.button
            key={tf}
            onClick={() => setTimeFrame(tf)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              timeFrame === tf 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tf.charAt(0).toUpperCase() + tf.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Trend Title */}
      <div className="px-4 py-1 flex items-center gap-2">
        <span className="text-sm">📊</span>
        <span className="text-xs font-semibold text-muted-foreground tracking-wide">{getTrendTitle()}</span>
      </div>

      {/* Bar Chart */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        <div className="space-y-2">
          {chartData.map((item, index) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="text-xs text-muted-foreground w-20 truncate">{item.label}:</span>
              <div className="flex-1 h-5 bg-muted/30 rounded overflow-hidden">
                <motion.div
                  className={`h-full rounded ${
                    item.isFuture 
                      ? 'bg-muted/20' 
                      : item.progress >= 80 
                        ? 'bg-primary' 
                        : item.progress >= 50 
                          ? 'bg-primary/70' 
                          : 'bg-primary/40'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: item.isFuture ? 0 : `${item.progress}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                />
              </div>
              <span className={`text-xs font-medium w-10 text-right ${
                item.isFuture ? 'text-muted-foreground/50' : 'text-foreground'
              }`}>
                {item.isFuture ? '-' : `${item.progress}%`}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}