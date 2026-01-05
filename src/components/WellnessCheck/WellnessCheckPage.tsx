import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BodyAvatar } from './BodyAvatar';
import { MetricsCards } from './MetricsCards';
import { WeightHistoryPanel } from './WeightHistoryPanel';
import { AIInsightsPanel } from './AIInsightsPanel';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WellnessCheckPageProps {
  onClose: () => void;
}

interface BodyZone {
  id: string;
  name: string;
  path: string;
  metrics: {
    bodyFat?: number;
    muscleMass?: number;
  };
}

export function WellnessCheckPage({ onClose }: WellnessCheckPageProps) {
  const [selectedZone, setSelectedZone] = useState<BodyZone | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [userHeight, setUserHeight] = useState<number | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch health data on mount
  useEffect(() => {
    const fetchHealthData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: healthPlanData } = await supabase
          .from('user_health_plans')
          .select('health_profile')
          .eq('user_id', user.id)
          .single();
        
        if (healthPlanData) {
          const healthProfile = healthPlanData.health_profile as any;
          if (healthProfile?.currentWeight) {
            setCurrentWeight(healthProfile.currentWeight);
          }
          if (healthProfile?.height) {
            setUserHeight(healthProfile.height);
          }
        }
      }
      setIsLoading(false);
    };
    fetchHealthData();
  }, []);

  const handleLogWeight = async () => {
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }
    
    setCurrentWeight(weight);
    setWeightInput('');
    
    // Update the health plan in database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: healthPlanData } = await supabase
        .from('user_health_plans')
        .select('health_profile')
        .eq('user_id', user.id)
        .single();
      
      if (healthPlanData) {
        const updatedProfile = {
          ...(healthPlanData.health_profile as any),
          currentWeight: weight
        };
        
        await supabase
          .from('user_health_plans')
          .update({ health_profile: updatedProfile })
          .eq('user_id', user.id);
        
        toast.success('Weight logged!', {
          description: `Your weight has been updated to ${weight} kg`,
        });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-background overflow-hidden flex flex-col"
    >
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-3 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-9 px-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-health flex items-center justify-center shadow-health">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold">Wellness Check</h1>
          </div>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading your wellness data...</div>
          </div>
        ) : (
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Section - Avatar & Metrics (Mobile: stacked, Desktop: side by side) */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col lg:flex-row gap-0 border-b lg:border-b-0 lg:border-r border-border/50">
              {/* Avatar */}
              <div className="flex-1 lg:flex-[2] p-4 flex flex-col items-center justify-center bg-gradient-to-br from-health/5 to-transparent min-h-[280px] lg:min-h-0">
                <BodyAvatar 
                  onZoneSelect={setSelectedZone}
                  selectedZone={selectedZone}
                />
              </div>
              
              {/* Metrics Cards */}
              <div className="lg:flex-1 p-4 border-t lg:border-t-0 lg:border-l border-border/50 flex items-center">
                <div className="w-full">
                  <h3 className="text-sm font-semibold mb-3 text-center lg:text-left">Key Metrics</h3>
                  <MetricsCards />
                </div>
              </div>
            </div>

            {/* Right Section - History Panel */}
            <div className="lg:col-span-3 xl:col-span-3 border-b lg:border-b-0 lg:border-r border-border/50 bg-card/30">
              <WeightHistoryPanel
                currentWeight={currentWeight}
                userHeight={userHeight}
                weightInput={weightInput}
                onWeightInputChange={setWeightInput}
                onLogWeight={handleLogWeight}
              />
            </div>

            {/* Bottom Section - AI Insights */}
            <div className="lg:col-span-4 xl:col-span-5 bg-card/20">
              <AIInsightsPanel
                currentWeight={currentWeight}
                userHeight={userHeight}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
