import { useState, useMemo } from 'react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, parseISO, isWithinInterval } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Droplets, Utensils, TrendingUp } from 'lucide-react';
import { DashboardCard } from '@/components/DashboardCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WaterLog, FoodLog } from '@/types/wellness';

interface ProgressChartsProps {
  waterLogs: WaterLog[];
  foodLogs: FoodLog[];
  waterGoal: number;
  calorieGoal: number;
}

type TimeRange = 'weekly' | 'monthly' | 'annual';

export function ProgressCharts({ waterLogs, foodLogs, waterGoal, calorieGoal }: ProgressChartsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');

  const chartData = useMemo(() => {
    const now = new Date();
    
    if (timeRange === 'weekly') {
      const days = eachDayOfInterval({
        start: subDays(now, 6),
        end: now,
      });
      
      return days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayWater = waterLogs
          .filter(log => log.date === dateStr)
          .reduce((sum, log) => sum + log.amount, 0);
        const dayCalories = foodLogs
          .filter(log => log.date === dateStr)
          .reduce((sum, log) => sum + log.foodItem.calories, 0);
        
        return {
          name: format(day, 'EEE'),
          fullDate: format(day, 'MMM d'),
          water: Math.round(dayWater / 1000 * 10) / 10,
          calories: dayCalories,
          waterGoal: waterGoal / 1000,
          calorieGoal,
        };
      });
    } else if (timeRange === 'monthly') {
      const days = eachDayOfInterval({
        start: subDays(now, 29),
        end: now,
      });
      
      return days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayWater = waterLogs
          .filter(log => log.date === dateStr)
          .reduce((sum, log) => sum + log.amount, 0);
        const dayCalories = foodLogs
          .filter(log => log.date === dateStr)
          .reduce((sum, log) => sum + log.foodItem.calories, 0);
        
        return {
          name: format(day, 'd'),
          fullDate: format(day, 'MMM d'),
          water: Math.round(dayWater / 1000 * 10) / 10,
          calories: dayCalories,
          waterGoal: waterGoal / 1000,
          calorieGoal,
        };
      });
    } else {
      const months = eachMonthOfInterval({
        start: subMonths(now, 11),
        end: now,
      });
      
      return months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthWater = waterLogs
          .filter(log => {
            const logDate = parseISO(log.date);
            return isWithinInterval(logDate, { start: monthStart, end: monthEnd });
          })
          .reduce((sum, log) => sum + log.amount, 0);
        const monthCalories = foodLogs
          .filter(log => {
            const logDate = parseISO(log.date);
            return isWithinInterval(logDate, { start: monthStart, end: monthEnd });
          })
          .reduce((sum, log) => sum + log.foodItem.calories, 0);
        
        const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd }).length;
        
        return {
          name: format(month, 'MMM'),
          fullDate: format(month, 'MMMM yyyy'),
          water: Math.round((monthWater / daysInMonth) / 1000 * 10) / 10,
          calories: Math.round(monthCalories / daysInMonth),
          waterGoal: waterGoal / 1000,
          calorieGoal,
        };
      });
    }
  }, [timeRange, waterLogs, foodLogs, waterGoal, calorieGoal]);

  const totals = useMemo(() => {
    return {
      water: chartData.reduce((sum, d) => sum + d.water, 0),
      calories: chartData.reduce((sum, d) => sum + d.calories, 0),
    };
  }, [chartData]);

  return (
    <DashboardCard className="mx-4 sm:mx-5 md:mx-8 mb-4 sm:mb-6" delay={0.2}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Progress Trends
        </h2>
      </div>

      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="weekly" className="text-xs sm:text-sm">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs sm:text-sm">Monthly</TabsTrigger>
          <TabsTrigger value="annual" className="text-xs sm:text-sm">Annual</TabsTrigger>
        </TabsList>

        <TabsContent value={timeRange} className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div className="text-center p-2 sm:p-3 rounded-lg bg-water-light/50">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-water mx-auto mb-1" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                {timeRange === 'annual' ? 'Avg/Day' : 'Total'}
              </p>
              <p className="text-sm sm:text-lg font-bold text-water">
                {totals.water.toFixed(1)}L
              </p>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg bg-nutrition-light/50">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-nutrition mx-auto mb-1" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                {timeRange === 'annual' ? 'Avg/Day' : 'Total'}
              </p>
              <p className="text-sm sm:text-lg font-bold text-nutrition">
                {totals.calories.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Water Chart */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Droplets className="w-4 h-4 text-water" />
              Water Intake (L)
            </h3>
            <div className="h-32 sm:h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(200, 85%, 55%)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(200, 85%, 55%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="water" 
                    stroke="hsl(200, 85%, 55%)" 
                    strokeWidth={2}
                    fill="url(#waterGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calories Chart */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Utensils className="w-4 h-4 text-nutrition" />
              Calories
            </h3>
            <div className="h-32 sm:h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate}
                  />
                  <Bar 
                    dataKey="calories" 
                    fill="hsl(145, 65%, 42%)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardCard>
  );
}