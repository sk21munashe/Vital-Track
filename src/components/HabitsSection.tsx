import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Check, Target, Zap, Heart, Moon, Book, Smile, ChevronRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from '@/components/DashboardCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Habit, HabitLog } from '@/types/wellness';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const ICONS = [
  { name: 'target', icon: Target },
  { name: 'zap', icon: Zap },
  { name: 'heart', icon: Heart },
  { name: 'moon', icon: Moon },
  { name: 'book', icon: Book },
  { name: 'smile', icon: Smile },
];

const COLORS: { value: Habit['color']; label: string; className: string }[] = [
  { value: 'water', label: 'Blue', className: 'bg-water' },
  { value: 'nutrition', label: 'Green', className: 'bg-nutrition' },
  { value: 'fitness', label: 'Orange', className: 'bg-fitness' },
  { value: 'custom', label: 'Purple', className: 'bg-primary' },
];

interface HabitsSectionProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  addHabit: (name: string, icon: string, color: Habit['color'], targetCount: number, unit: string) => void;
  deleteHabit: (habitId: string) => void;
  logHabit: (habitId: string, count?: number) => void;
  getTodayHabitProgress: (habitId: string) => number;
}

const variantStyles = {
  water: {
    bg: 'bg-water-light hover:bg-water/20',
    icon: 'text-water',
  },
  nutrition: {
    bg: 'bg-nutrition-light hover:bg-nutrition/20',
    icon: 'text-nutrition',
  },
  fitness: {
    bg: 'bg-fitness-light hover:bg-fitness/20',
    icon: 'text-fitness',
  },
  custom: {
    bg: 'bg-primary/10 hover:bg-primary/20',
    icon: 'text-primary',
  },
};

export function HabitsSection({
  habits,
  habitLogs,
  addHabit,
  deleteHabit,
  logHabit,
  getTodayHabitProgress,
}: HabitsSectionProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('target');
  const [selectedColor, setSelectedColor] = useState<Habit['color']>('custom');
  const [targetCount, setTargetCount] = useState('1');
  const [unit, setUnit] = useState('times');

  // Get weekly progress data for a habit
  const getWeeklyData = (habitId: string) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLogs = habitLogs.filter(l => l.habitId === habitId && l.date === dateStr);
      const total = dayLogs.reduce((sum, log) => sum + log.count, 0);
      data.push({
        day: days[date.getDay()],
        value: total,
      });
    }
    return data;
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    addHabit(name.trim(), selectedIcon, selectedColor, parseInt(targetCount) || 1, unit);
    setName('');
    setSelectedIcon('target');
    setSelectedColor('custom');
    setTargetCount('1');
    setUnit('times');
    setIsOpen(false);
  };

  const getIconComponent = (iconName: string) => {
    const iconData = ICONS.find(i => i.name === iconName);
    return iconData?.icon || Target;
  };

  const getColorClass = (color: Habit['color']) => {
    return COLORS.find(c => c.value === color)?.className || 'bg-primary';
  };

  return (
    <DashboardCard className="mx-4 sm:mx-5 md:mx-8 mb-6" delay={0.4}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">My Habits</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="habit-name">Habit Name</Label>
                <Input
                  id="habit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Meditate, Read, Exercise..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Icon</Label>
                <div className="flex gap-2 mt-1">
                  {ICONS.map(({ name: iconName, icon: IconComp }) => (
                    <button
                      key={iconName}
                      onClick={() => setSelectedIcon(iconName)}
                      className={`p-2 rounded-lg border transition-colors ${
                        selectedIcon === iconName
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-1">
                  {COLORS.map(({ value, label, className }) => (
                    <button
                      key={value}
                      onClick={() => setSelectedColor(value)}
                      className={`w-8 h-8 rounded-full ${className} ${
                        selectedColor === value
                          ? 'ring-2 ring-offset-2 ring-primary'
                          : ''
                      }`}
                      title={label}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="target">Daily Target</Label>
                  <Input
                    id="target"
                    type="number"
                    min="1"
                    value={targetCount}
                    onChange={(e) => setTargetCount(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="times">times</SelectItem>
                      <SelectItem value="minutes">minutes</SelectItem>
                      <SelectItem value="hours">hours</SelectItem>
                      <SelectItem value="pages">pages</SelectItem>
                      <SelectItem value="glasses">glasses</SelectItem>
                      <SelectItem value="reps">reps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleCreate} className="w-full" disabled={!name.trim()}>
                Create Habit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Log Style Habits */}
      {habits.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No habits yet. Tap + to create one!
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {habits.map((habit) => {
            const IconComp = getIconComponent(habit.icon);
            const progress = getTodayHabitProgress(habit.id);
            const isComplete = progress >= habit.targetCount;
            const styles = variantStyles[habit.color] || variantStyles.custom;

            return (
              <motion.button
                key={habit.id}
                onClick={() => setSelectedHabitId(habit.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 ${styles.bg}`}
              >
                <div className={`p-2.5 rounded-xl bg-card ${styles.icon}`}>
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <IconComp className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span className="font-medium text-foreground text-sm truncate block">{habit.name}</span>
                  <span className="text-xs text-muted-foreground">{progress}/{habit.targetCount} {habit.unit}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Habit Progress Graphs Section */}
      {habits.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Weekly Progress</span>
          </div>
          {habits.map((habit) => {
            const IconComp = getIconComponent(habit.icon);
            const weeklyData = getWeeklyData(habit.id);
            const styles = variantStyles[habit.color] || variantStyles.custom;
            const colorClass = getColorClass(habit.color);
            const strokeColor = habit.color === 'water' ? 'hsl(var(--water))' 
              : habit.color === 'nutrition' ? 'hsl(var(--nutrition))' 
              : habit.color === 'fitness' ? 'hsl(var(--fitness))' 
              : 'hsl(var(--primary))';

            return (
              <div key={habit.id} className="p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${styles.bg}`}>
                    <IconComp className={`w-3.5 h-3.5 ${styles.icon}`} />
                  </div>
                  <span className="text-sm font-medium">{habit.name}</span>
                </div>
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id={`gradient-${habit.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={strokeColor}
                        strokeWidth={2}
                        fill={`url(#gradient-${habit.id})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Habit Detail Dialog */}
      <Dialog open={!!selectedHabitId} onOpenChange={(open) => !open && setSelectedHabitId(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedHabitId && (() => {
            const habit = habits.find(h => h.id === selectedHabitId);
            if (!habit) return null;
            const IconComp = getIconComponent(habit.icon);
            const progress = getTodayHabitProgress(habit.id);
            const isComplete = progress >= habit.targetCount;
            const progressPercent = Math.min((progress / habit.targetCount) * 100, 100);
            const weeklyData = getWeeklyData(habit.id);
            const styles = variantStyles[habit.color] || variantStyles.custom;
            const strokeColor = habit.color === 'water' ? 'hsl(var(--water))' 
              : habit.color === 'nutrition' ? 'hsl(var(--nutrition))' 
              : habit.color === 'fitness' ? 'hsl(var(--fitness))' 
              : 'hsl(var(--primary))';

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${styles.bg}`}>
                      <IconComp className={`w-5 h-5 ${styles.icon}`} />
                    </div>
                    {habit.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Progress */}
                  <div className="text-center">
                    <div className="text-3xl font-bold">{progress}/{habit.targetCount}</div>
                    <div className="text-sm text-muted-foreground">{habit.unit} today</div>
                    <div className="mt-3 h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${getColorClass(habit.color)}`}
                      />
                    </div>
                  </div>

                  {/* Weekly Chart */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">This Week</h4>
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyData}>
                          <defs>
                            <linearGradient id={`detail-gradient-${habit.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="day" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={strokeColor}
                            strokeWidth={2}
                            fill={`url(#detail-gradient-${habit.id})`}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        logHabit(habit.id);
                      }}
                      className="flex-1"
                      disabled={isComplete}
                    >
                      {isComplete ? 'Completed!' : 'Log Progress'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => {
                        deleteHabit(habit.id);
                        setSelectedHabitId(null);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DashboardCard>
  );
}
