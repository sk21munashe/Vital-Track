import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Droplets, Plus, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { WaterBottle } from '@/components/WaterBottle';
import { DashboardCard } from '@/components/DashboardCard';
import { useWellnessData } from '@/hooks/useWellnessData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function WaterTracker() {
  const navigate = useNavigate();
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const {
    profile,
    getTodayWater,
    getWeekWater,
    addWater,
    updateGoals,
    waterLogs,
  } = useWellnessData();

  const todayWater = getTodayWater();
  const weekWater = getWeekWater();

  const handleAddWater = (amount: number) => {
    addWater(amount);
    toast.success(`Added ${amount}ml of water! 💧`, {
      description: `+10 points earned`,
    });
  };

  const handleCustomAmount = () => {
    const amount = parseInt(customAmount);
    if (amount > 0 && amount <= 5000) {
      handleAddWater(amount);
      setCustomAmount('');
      setShowCustomAmount(false);
    }
  };

  const handleUpdateGoal = () => {
    const goal = parseInt(customGoal);
    if (goal >= 500 && goal <= 10000) {
      updateGoals({ waterGoal: goal });
      setShowGoalDialog(false);
      toast.success('Water goal updated!');
    }
  };

  // Calculate week data for chart
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = waterLogs.filter(log => log.date === dateStr);
    const total = dayLogs.reduce((sum, log) => sum + log.amount, 0);
    return {
      day: format(date, 'EEE'),
      amount: total,
      isToday: i === 6,
    };
  });

  const maxAmount = Math.max(...weekData.map(d => d.amount), profile.goals.waterGoal);

  return (
    <div className="h-full flex flex-col bg-background pb-4 overflow-y-auto">
      {/* Header */}
      <header className="pt-6 pb-4 px-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gradient-water">Water Tracker</h1>
            <p className="text-sm text-muted-foreground">Stay hydrated, stay healthy</p>
          </div>
          <button
            onClick={() => setShowGoalDialog(true)}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Target className="w-5 h-5 text-water" />
          </button>
        </div>
      </header>

      {/* Water Bottle Visualization */}
      <div className="px-5 mb-6">
        <DashboardCard className="glass-water">
          <div className="h-64">
            <WaterBottle current={todayWater} goal={profile.goals.waterGoal} />
          </div>
        </DashboardCard>
      </div>

      {/* Quick Add Buttons */}
      <div className="px-5 mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Droplets className="w-5 h-5 text-water" />
          Add Water
        </h2>
        <div className="grid grid-cols-4 gap-2 relative z-10">
          {[250, 500, 750, 1000].map((amount) => (
            <Button
              key={amount}
              variant="outline"
              onClick={() => handleAddWater(amount)}
              className="p-4 h-auto rounded-2xl bg-water/10 border-water/30 hover:bg-water/20 transition-colors text-center flex flex-col"
            >
              <span className="block text-lg font-bold text-water">
                {amount >= 1000 ? `${amount / 1000}L` : `${amount}ml`}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(amount / 250)} glass{amount > 250 ? 'es' : ''}
              </span>
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() => setShowCustomAmount(true)}
          className="w-full mt-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          Custom Amount
        </Button>
      </div>

      {/* Week Chart */}
      <DashboardCard className="mx-5" delay={0.2}>
        <h2 className="text-lg font-semibold mb-4">Last 7 Days</h2>
        <div className="flex items-end justify-between h-32 gap-1">
          {weekData.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end h-24">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.amount / maxAmount) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className={`w-full rounded-t-lg ${
                    day.isToday ? 'bg-gradient-water' : 'bg-water/40'
                  }`}
                  style={{ minHeight: day.amount > 0 ? '8px' : '0' }}
                />
              </div>
              <span className={`text-xs ${day.isToday ? 'font-bold text-water' : 'text-muted-foreground'}`}>
                {day.day}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
          <span>Goal: {profile.goals.waterGoal / 1000}L/day</span>
          <span>
            Avg: {Math.round(weekData.reduce((s, d) => s + d.amount, 0) / 7 / 100) / 10}L
          </span>
        </div>
      </DashboardCard>

      {/* Today's Log */}
      <DashboardCard className="mx-5 mt-6" delay={0.3}>
        <h2 className="text-lg font-semibold mb-3">Today's Log</h2>
        {waterLogs
          .filter(log => log.date === format(new Date(), 'yyyy-MM-dd'))
          .slice(-5)
          .reverse()
          .map((log) => (
            <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-water-light flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-water" />
                </div>
                <span className="font-medium">{log.amount}ml</span>
              </div>
              <span className="text-sm text-muted-foreground">{log.time}</span>
            </div>
          ))}
        {waterLogs.filter(log => log.date === format(new Date(), 'yyyy-MM-dd')).length === 0 && (
          <p className="text-center text-muted-foreground py-4">No water logged today yet</p>
        )}
      </DashboardCard>

      {/* Custom Amount Dialog */}
      <Dialog open={showCustomAmount} onOpenChange={setShowCustomAmount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Amount</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Amount in ml"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                max={5000}
              />
              <Button onClick={handleCustomAmount} className="bg-water hover:bg-water-dark">
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Daily Water Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Current goal: {profile.goals.waterGoal}ml ({profile.goals.waterGoal / 1000}L)
              </p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Goal in ml (e.g., 2000)"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                />
                <Button onClick={handleUpdateGoal}>Save</Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1500, 2000, 2500, 3000, 3500, 4000].map((goal) => (
                <Button
                  key={goal}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateGoals({ waterGoal: goal });
                    setShowGoalDialog(false);
                    toast.success('Water goal updated!');
                  }}
                >
                  {goal / 1000}L
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
