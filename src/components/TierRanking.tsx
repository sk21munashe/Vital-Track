import { motion } from 'framer-motion';
import { Crown, Medal, Award, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tier {
  name: string;
  minPoints: number;
  maxPoints: number;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
}

const tiers: Tier[] = [
  { 
    name: 'Bronze', 
    minPoints: 0, 
    maxPoints: 499, 
    icon: <Medal className="w-5 h-5" />,
    color: 'text-amber-700',
    bgGradient: 'from-amber-700/20 to-amber-600/10'
  },
  { 
    name: 'Silver', 
    minPoints: 500, 
    maxPoints: 1499, 
    icon: <Medal className="w-5 h-5" />,
    color: 'text-slate-400',
    bgGradient: 'from-slate-400/20 to-slate-300/10'
  },
  { 
    name: 'Gold', 
    minPoints: 1500, 
    maxPoints: 3999, 
    icon: <Award className="w-5 h-5" />,
    color: 'text-yellow-500',
    bgGradient: 'from-yellow-500/20 to-yellow-400/10'
  },
  { 
    name: 'Platinum', 
    minPoints: 4000, 
    maxPoints: 7999, 
    icon: <Star className="w-5 h-5" />,
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-400/20 to-cyan-300/10'
  },
  { 
    name: 'Diamond', 
    minPoints: 8000, 
    maxPoints: 14999, 
    icon: <Crown className="w-5 h-5" />,
    color: 'text-blue-400',
    bgGradient: 'from-blue-400/20 to-purple-400/10'
  },
  { 
    name: 'Legend', 
    minPoints: 15000, 
    maxPoints: Infinity, 
    icon: <Crown className="w-5 h-5" />,
    color: 'text-purple-500',
    bgGradient: 'from-purple-500/20 to-pink-500/10'
  },
];

// Simulated leaderboard data (local comparison)
const generateSimulatedRanking = (userPoints: number) => {
  const rankings = [
    { name: 'Champion Mike', points: 18500 },
    { name: 'Fitness Queen', points: 12300 },
    { name: 'Health Master', points: 8900 },
    { name: 'Wellness Pro', points: 5600 },
    { name: 'Active Andy', points: 3200 },
    { name: 'Starter Sam', points: 800 },
    { name: 'Beginner Ben', points: 200 },
  ];
  
  // Insert user into rankings
  const userRanking = { name: 'You', points: userPoints, isUser: true };
  const allRankings = [...rankings, userRanking].sort((a, b) => b.points - a.points);
  const userPosition = allRankings.findIndex(r => 'isUser' in r && r.isUser) + 1;
  
  return { rankings: allRankings.slice(0, 7), userPosition, totalUsers: allRankings.length };
};

interface TierRankingProps {
  totalPoints: number;
}

export function TierRanking({ totalPoints }: TierRankingProps) {
  const currentTier = tiers.find(t => totalPoints >= t.minPoints && totalPoints <= t.maxPoints) || tiers[0];
  const currentTierIndex = tiers.indexOf(currentTier);
  const nextTier = tiers[currentTierIndex + 1];
  
  const progressToNextTier = nextTier 
    ? ((totalPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;
  
  const pointsToNextTier = nextTier ? nextTier.minPoints - totalPoints : 0;
  
  const { rankings, userPosition, totalUsers } = generateSimulatedRanking(totalPoints);

  return (
    <div className="space-y-4">
      {/* Current Tier Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'p-4 sm:p-5 rounded-2xl bg-gradient-to-br border',
          currentTier.bgGradient,
          'border-border/50'
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center bg-background/50',
              currentTier.color
            )}>
              {currentTier.icon}
            </div>
            <div>
              <h3 className={cn('font-bold text-lg', currentTier.color)}>{currentTier.name}</h3>
              <p className="text-xs text-muted-foreground">Current Tier</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{totalPoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Points</p>
          </div>
        </div>
        
        {nextTier && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress to {nextTier.name}</span>
              <span className="font-medium">{pointsToNextTier} pts to go</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextTier}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Tier Progress Ladder */}
      <div className="flex justify-between gap-1 px-2">
        {tiers.slice(0, 5).map((tier, index) => {
          const isActive = index <= currentTierIndex;
          return (
            <div key={tier.name} className="flex-1 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'mx-auto w-8 h-8 rounded-full flex items-center justify-center mb-1',
                  isActive ? tier.bgGradient : 'bg-muted',
                  isActive ? tier.color : 'text-muted-foreground'
                )}
              >
                {tier.icon}
              </motion.div>
              <p className={cn(
                'text-[10px] font-medium',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}>{tier.name}</p>
            </div>
          );
        })}
      </div>

      {/* Leaderboard Preview */}
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Leaderboard
          </h4>
          <span className="text-xs text-muted-foreground">
            Your rank: #{userPosition} of {totalUsers}
          </span>
        </div>
        
        <div className="space-y-2">
          {rankings.slice(0, 5).map((ranking, index) => {
            const isUser = 'isUser' in ranking && ranking.isUser;
            const rankTier = tiers.find(t => ranking.points >= t.minPoints && ranking.points <= t.maxPoints) || tiers[0];
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg',
                  isUser ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30'
                )}
              >
                <span className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                  index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                  index === 1 ? 'bg-slate-400/20 text-slate-400' :
                  index === 2 ? 'bg-amber-700/20 text-amber-700' :
                  'bg-muted text-muted-foreground'
                )}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium truncate',
                    isUser && 'text-primary'
                  )}>{ranking.name}</p>
                </div>
                <div className={cn('flex items-center gap-1', rankTier.color)}>
                  {rankTier.icon}
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {ranking.points.toLocaleString()}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
