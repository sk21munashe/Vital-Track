import { motion } from 'framer-motion';
import { Percent, Apple, Droplets, Flame } from 'lucide-react';

interface MetricsCardsProps {
  bodyFat?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export function MetricsCards({ bodyFat = 18, protein = 25, carbs = 50, fat = 25 }: MetricsCardsProps) {
  const metrics = [
    { 
      label: 'Body Fat', 
      value: `${bodyFat}%`, 
      icon: Percent,
      color: 'health',
      bgClass: 'from-health/20 to-health/5',
      iconBg: 'bg-health/20',
      textColor: 'text-health'
    },
    { 
      label: 'Protein', 
      value: `${protein}%`, 
      icon: Flame,
      color: 'nutrition',
      bgClass: 'from-nutrition/20 to-nutrition/5',
      iconBg: 'bg-nutrition/20',
      textColor: 'text-nutrition'
    },
    { 
      label: 'Carbs', 
      value: `${carbs}%`, 
      icon: Apple,
      color: 'fitness',
      bgClass: 'from-fitness/20 to-fitness/5',
      iconBg: 'bg-fitness/20',
      textColor: 'text-fitness'
    },
    { 
      label: 'Fat', 
      value: `${fat}%`, 
      icon: Droplets,
      color: 'water',
      bgClass: 'from-water/20 to-water/5',
      iconBg: 'bg-water/20',
      textColor: 'text-water'
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`rounded-xl p-3 bg-gradient-to-br ${metric.bgClass} border border-border/50`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-6 h-6 rounded-lg ${metric.iconBg} flex items-center justify-center`}>
              <metric.icon className={`w-3.5 h-3.5 ${metric.textColor}`} />
            </div>
            <span className="text-[10px] text-muted-foreground">{metric.label}</span>
          </div>
          <p className={`text-lg font-bold ${metric.textColor}`}>{metric.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
