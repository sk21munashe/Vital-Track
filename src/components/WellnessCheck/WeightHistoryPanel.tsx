import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { Scale, TrendingUp, TrendingDown, Target, Calendar, Edit2, Trash2, ChevronDown, ChevronUp, Ruler, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  notes?: string;
}

interface AIMilestone {
  targetWeight: number;
  estimatedDate: string;
  message: string;
  achieved: boolean;
}

interface WeightHistoryPanelProps {
  currentWeight: number | null;
  userHeight: number | null;
  weightInput: string;
  onWeightInputChange: (value: string) => void;
  onLogWeight: () => void;
}

export function WeightHistoryPanel({
  currentWeight,
  userHeight,
  weightInput,
  onWeightInputChange,
  onLogWeight,
}: WeightHistoryPanelProps) {
  const [showExtras, setShowExtras] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Sample weight history data (in production, this would come from the database)
  const weightHistory: WeightEntry[] = [
    { id: '1', date: format(subDays(new Date(), 6), 'yyyy-MM-dd'), weight: currentWeight ? currentWeight + 1.5 : 72 },
    { id: '2', date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), weight: currentWeight ? currentWeight + 1.2 : 71.7 },
    { id: '3', date: format(subDays(new Date(), 4), 'yyyy-MM-dd'), weight: currentWeight ? currentWeight + 0.8 : 71.3 },
    { id: '4', date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), weight: currentWeight ? currentWeight + 0.5 : 71 },
    { id: '5', date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), weight: currentWeight ? currentWeight + 0.3 : 70.8 },
    { id: '6', date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), weight: currentWeight ? currentWeight + 0.1 : 70.6 },
    { id: '7', date: format(new Date(), 'yyyy-MM-dd'), weight: currentWeight || 70.5 },
  ];

  // Sample AI milestones
  const aiMilestones: AIMilestone[] = [
    { 
      targetWeight: currentWeight ? currentWeight - 2 : 68.5, 
      estimatedDate: format(subDays(new Date(), -14), 'MMM d'),
      message: 'First milestone! 🎯',
      achieved: false
    },
    { 
      targetWeight: currentWeight ? currentWeight - 5 : 65.5, 
      estimatedDate: format(subDays(new Date(), -42), 'MMM d'),
      message: 'Halfway there! 🌟',
      achieved: false
    },
  ];

  const chartData = weightHistory.map(entry => ({
    date: format(new Date(entry.date), 'MMM d'),
    weight: entry.weight,
  }));

  // Calculate weekly trend
  const weeklyChange = weightHistory.length >= 2 
    ? (weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight).toFixed(1)
    : '0';
  const isLosing = parseFloat(weeklyChange) < 0;

  // Weekly snapshot
  const avgWeight = (weightHistory.reduce((sum, e) => sum + e.weight, 0) / weightHistory.length).toFixed(1);
  const lowestWeight = Math.min(...weightHistory.map(e => e.weight)).toFixed(1);
  const highestWeight = Math.max(...weightHistory.map(e => e.weight)).toFixed(1);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Quick Weight Input */}
      <div className="p-3 border-b border-border/50">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="number"
              value={weightInput}
              onChange={(e) => onWeightInputChange(e.target.value)}
              placeholder={currentWeight ? `${currentWeight} kg` : 'Enter weight'}
              className="w-full h-10 pl-9 pr-12 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-health/50"
              step="0.1"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kg</span>
          </div>
          <Button
            onClick={onLogWeight}
            disabled={!weightInput}
            size="sm"
            className="bg-gradient-health hover:opacity-90 text-white px-4"
          >
            Log
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Weight Trend Chart */}
        <div className="bg-card/50 rounded-xl p-3 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-health" />
              7-Day Trend
            </h4>
            <div className={`flex items-center gap-1 text-xs font-medium ${isLosing ? 'text-nutrition' : 'text-fitness'}`}>
              {isLosing ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {weeklyChange} kg
            </div>
          </div>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--health))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--health))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--health))"
                  strokeWidth={2}
                  fill="url(#weightGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Milestones */}
        <div className="bg-card/50 rounded-xl p-3 border border-border/50">
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-health" />
            AI Milestones
          </h4>
          <div className="space-y-2">
            {aiMilestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  milestone.achieved 
                    ? 'bg-nutrition/10 border border-nutrition/30' 
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Target className={`w-4 h-4 ${milestone.achieved ? 'text-nutrition' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="text-xs font-medium">{milestone.targetWeight} kg</p>
                    <p className="text-[10px] text-muted-foreground">{milestone.message}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{milestone.estimatedDate}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Weekly Snapshot */}
        <div className="bg-card/50 rounded-xl p-3 border border-border/50">
          <h4 className="text-sm font-semibold mb-3">Weekly Snapshot</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <p className="text-[10px] text-muted-foreground">Average</p>
              <p className="text-sm font-bold">{avgWeight} kg</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-nutrition/10">
              <p className="text-[10px] text-muted-foreground">Lowest</p>
              <p className="text-sm font-bold text-nutrition">{lowestWeight} kg</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-fitness/10">
              <p className="text-[10px] text-muted-foreground">Highest</p>
              <p className="text-sm font-bold text-fitness">{highestWeight} kg</p>
            </div>
          </div>
        </div>

        {/* Weight History List */}
        <div className="bg-card/50 rounded-xl p-3 border border-border/50">
          <h4 className="text-sm font-semibold mb-3">Recent Entries</h4>
          <div className="space-y-2 max-h-[150px] overflow-y-auto">
            {weightHistory.slice().reverse().map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="text-xs font-medium">{entry.weight} kg</p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(entry.date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <Edit2 className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3 h-3 text-destructive/70" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Height/Notes Toggle */}
        <button
          onClick={() => setShowExtras(!showExtras)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <span className="text-sm font-medium flex items-center gap-2">
            <Ruler className="w-4 h-4 text-health" />
            Height & Notes
          </span>
          {showExtras ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {showExtras && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 rounded-xl bg-card/50 border border-border/50 space-y-3">
                {userHeight && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-health/10 flex items-center justify-center">
                      <Ruler className="w-5 h-5 text-health" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Height</p>
                      <p className="font-semibold">{userHeight} cm</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <textarea
                      placeholder="Add notes about your progress..."
                      className="w-full h-16 p-2 text-xs rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-health/50"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
