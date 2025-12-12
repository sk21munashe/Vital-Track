import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Check, Target, Zap, Heart, Moon, Book, Smile } from 'lucide-react';
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
import { Habit } from '@/types/wellness';

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
  addHabit: (name: string, icon: string, color: Habit['color'], targetCount: number, unit: string) => void;
  deleteHabit: (habitId: string) => void;
  logHabit: (habitId: string, count?: number) => void;
  getTodayHabitProgress: (habitId: string) => number;
}

export function HabitsSection({
  habits,
  addHabit,
  deleteHabit,
  logHabit,
  getTodayHabitProgress,
}: HabitsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('target');
  const [selectedColor, setSelectedColor] = useState<Habit['color']>('custom');
  const [targetCount, setTargetCount] = useState('1');
  const [unit, setUnit] = useState('times');

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

      {habits.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No habits yet. Tap + to create one!
        </p>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const IconComp = getIconComponent(habit.icon);
            const progress = getTodayHabitProgress(habit.id);
            const isComplete = progress >= habit.targetCount;
            const progressPercent = Math.min((progress / habit.targetCount) * 100, 100);

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <button
                  onClick={() => logHabit(habit.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isComplete
                      ? `${getColorClass(habit.color)} text-white`
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <IconComp className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium truncate ${isComplete ? 'line-through text-muted-foreground' : ''}`}>
                      {habit.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {progress}/{habit.targetCount} {habit.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full rounded-full ${getColorClass(habit.color)}`}
                    />
                  </div>
                </div>

                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}
