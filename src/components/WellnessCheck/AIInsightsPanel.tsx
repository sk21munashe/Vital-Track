import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, Trophy, Download, Share2, Heart, TrendingUp, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AIInsight {
  type: 'tip' | 'achievement' | 'insight';
  icon: React.ReactNode;
  title: string;
  message: string;
  color: string;
}

interface WeightLog {
  id: string;
  weight: number;
  logged_at: string;
  notes: string | null;
}

interface AIInsightsPanelProps {
  currentWeight: number | null;
  userHeight: number | null;
  weightLogs?: WeightLog[];
}

export function AIInsightsPanel({ currentWeight, userHeight, weightLogs = [] }: AIInsightsPanelProps) {
  const [celebrating, setCelebrating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Calculate BMI if we have both
  const bmi = currentWeight && userHeight 
    ? (currentWeight / Math.pow(userHeight / 100, 2)).toFixed(1)
    : null;

  const getBmiCategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue < 25) return 'Normal';
    if (bmiValue < 30) return 'Overweight';
    return 'Obese';
  };

  const insights: AIInsight[] = [
    {
      type: 'achievement',
      icon: <Trophy className="w-4 h-4" />,
      title: 'Great Progress! 🎉',
      message: "You've logged your weight 7 days in a row! Consistency is the key to success.",
      color: 'nutrition'
    },
    {
      type: 'tip',
      icon: <Lightbulb className="w-4 h-4" />,
      title: 'Pro Tip',
      message: 'Weigh yourself at the same time each morning for the most accurate tracking.',
      color: 'fitness'
    },
    {
      type: 'insight',
      icon: <TrendingUp className="w-4 h-4" />,
      title: 'Weekly Analysis',
      message: "Your weight trend shows steady progress. Keep up the great work—you're on track for your next milestone!",
      color: 'health'
    },
    {
      type: 'tip',
      icon: <Zap className="w-4 h-4" />,
      title: 'Energy Boost',
      message: 'Try adding a 10-minute walk after meals to support your metabolism.',
      color: 'water'
    },
  ];

  const generateCSVContent = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const bmiCategory = bmi ? getBmiCategory(parseFloat(bmi)) : 'N/A';
    
    let csv = 'Vital Track Wellness Report\n';
    csv += `Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}\n\n`;
    
    // Current Stats
    csv += 'Current Stats\n';
    csv += 'Metric,Value\n';
    csv += `Current Weight,${currentWeight ? `${currentWeight} kg` : 'Not logged'}\n`;
    csv += `Height,${userHeight ? `${userHeight} cm` : 'Not logged'}\n`;
    csv += `BMI,${bmi || 'N/A'}\n`;
    csv += `BMI Category,${bmiCategory}\n\n`;
    
    // Weight History
    if (weightLogs.length > 0) {
      csv += 'Weight History\n';
      csv += 'Date,Weight (kg),Notes\n';
      weightLogs.forEach(log => {
        const date = format(new Date(log.logged_at), 'yyyy-MM-dd');
        const notes = log.notes ? `"${log.notes.replace(/"/g, '""')}"` : '';
        csv += `${date},${log.weight},${notes}\n`;
      });
    }
    
    return csv;
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvContent = generateCSVContent();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `wellness-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Wellness report exported successfully.', {
        description: `Saved as ${filename}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Could not export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const today = format(new Date(), 'MMMM d, yyyy');
      const bmiCategory = bmi ? getBmiCategory(parseFloat(bmi)) : null;
      
      let summary = `My Wellness Check [${today}]: `;
      if (currentWeight) {
        summary += `Weight: ${currentWeight} kg`;
      }
      if (bmi) {
        summary += ` | BMI: ${bmi} (${bmiCategory})`;
      }
      summary += `. Tracked with Vital Track.`;
      
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: 'My Wellness Check',
          text: summary,
        });
        toast.success('Shared successfully!');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(summary);
        toast.success('Copied to clipboard!', {
          description: 'Share link copied. Paste it anywhere to share.',
        });
      }
    } catch (error: any) {
      // User cancelled sharing is not an error
      if (error?.name === 'AbortError') {
        return;
      }
      console.error('Share failed:', error);
      toast.error('Sharing not available. Check device permissions.');
    } finally {
      setIsSharing(false);
    }
  };

  const triggerCelebration = () => {
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-health" />
          AI Wellness Insights
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="h-8 text-xs"
          >
            {isExporting ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Download className="w-3 h-3 mr-1" />
            )}
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={isSharing}
            className="h-8 text-xs"
          >
            {isSharing ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Share2 className="w-3 h-3 mr-1" />
            )}
            Share
          </Button>
        </div>
      </div>

      {/* BMI Card */}
      {bmi && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 p-4 rounded-xl bg-gradient-to-br from-health/20 to-health/5 border border-health/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-health flex items-center justify-center shadow-health">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Body Mass Index</p>
                <p className="text-2xl font-bold text-health">{bmi}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className={`text-sm font-semibold ${
                parseFloat(bmi) < 18.5 ? 'text-water' :
                parseFloat(bmi) < 25 ? 'text-nutrition' :
                parseFloat(bmi) < 30 ? 'text-fitness' : 'text-destructive'
              }`}>
                {parseFloat(bmi) < 18.5 ? 'Underweight' :
                 parseFloat(bmi) < 25 ? 'Normal' :
                 parseFloat(bmi) < 30 ? 'Overweight' : 'Obese'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Insights Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={insight.type === 'achievement' ? triggerCelebration : undefined}
              className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                insight.type === 'achievement' 
                  ? 'bg-gradient-to-br from-nutrition/20 to-nutrition/5 border-nutrition/30' 
                  : 'bg-card/50 border-border/50 hover:border-health/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  insight.color === 'nutrition' ? 'bg-nutrition/20 text-nutrition' :
                  insight.color === 'fitness' ? 'bg-fitness/20 text-fitness' :
                  insight.color === 'water' ? 'bg-water/20 text-water' :
                  'bg-health/20 text-health'
                }`}>
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold mb-1">{insight.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center"
        >
          <p className="text-sm italic text-foreground/80">
            "Small steps every day lead to big results. You're doing amazing!"
          </p>
          <p className="text-xs text-muted-foreground mt-2">— Your Wellness Coach 💜</p>
        </motion.div>
      </div>

      {/* Celebration Animation */}
      {celebrating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            className="text-6xl"
          >
            🎉
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
