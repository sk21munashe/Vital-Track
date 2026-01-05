import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WeightLog {
  id: string;
  user_id: string;
  weight: number;
  notes: string | null;
  logged_at: string;
  created_at: string;
  updated_at: string;
}

export function useWeightLogs() {
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch weight logs
  const fetchWeightLogs = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setWeightLogs([]);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false });

    if (error) {
      console.error('Error fetching weight logs:', error);
      toast.error('Failed to load weight logs');
    } else {
      setWeightLogs(data || []);
    }
    setIsLoading(false);
  }, []);

  // Add new weight log
  const addWeightLog = useCallback(async (weight: number, notes?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to log weight');
      return null;
    }

    const { data, error } = await supabase
      .from('weight_logs')
      .insert({
        user_id: user.id,
        weight,
        notes: notes || null,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding weight log:', error);
      toast.error('Failed to log weight');
      return null;
    }

    setWeightLogs(prev => [data, ...prev]);
    toast.success('Weight logged!', {
      description: `Your weight has been recorded as ${weight} kg`,
    });
    return data;
  }, []);

  // Update weight log
  const updateWeightLog = useCallback(async (id: string, weight: number, notes?: string) => {
    const { data, error } = await supabase
      .from('weight_logs')
      .update({
        weight,
        notes: notes || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating weight log:', error);
      toast.error('Failed to update weight entry');
      return null;
    }

    setWeightLogs(prev => prev.map(log => log.id === id ? data : log));
    toast.success('Weight entry updated!');
    return data;
  }, []);

  // Delete weight log
  const deleteWeightLog = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('weight_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting weight log:', error);
      toast.error('Failed to delete weight entry');
      return false;
    }

    setWeightLogs(prev => prev.filter(log => log.id !== id));
    toast.success('Weight entry deleted!');
    return true;
  }, []);

  // Get latest weight
  const getLatestWeight = useCallback(() => {
    if (weightLogs.length === 0) return null;
    return weightLogs[0].weight;
  }, [weightLogs]);

  // Get weight logs for chart (last 7 days)
  const getChartData = useCallback(() => {
    const last7Days = weightLogs.slice(0, 7).reverse();
    return last7Days.map(log => ({
      date: new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: Number(log.weight),
      id: log.id,
    }));
  }, [weightLogs]);

  // Calculate weekly stats
  const getWeeklyStats = useCallback(() => {
    const last7Logs = weightLogs.slice(0, 7);
    if (last7Logs.length === 0) {
      return { avgWeight: 0, lowestWeight: 0, highestWeight: 0, weeklyChange: 0, isLosing: false };
    }

    const weights = last7Logs.map(log => Number(log.weight));
    const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
    const lowestWeight = Math.min(...weights);
    const highestWeight = Math.max(...weights);
    
    const weeklyChange = last7Logs.length >= 2 
      ? Number(last7Logs[0].weight) - Number(last7Logs[last7Logs.length - 1].weight)
      : 0;
    const isLosing = weeklyChange < 0;

    return { 
      avgWeight: Number(avgWeight.toFixed(1)), 
      lowestWeight: Number(lowestWeight.toFixed(1)), 
      highestWeight: Number(highestWeight.toFixed(1)), 
      weeklyChange: Number(weeklyChange.toFixed(1)),
      isLosing 
    };
  }, [weightLogs]);

  // Set up realtime subscription
  useEffect(() => {
    fetchWeightLogs();

    const channel = supabase
      .channel('weight_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weight_logs',
        },
        () => {
          fetchWeightLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWeightLogs]);

  return {
    weightLogs,
    isLoading,
    addWeightLog,
    updateWeightLog,
    deleteWeightLog,
    getLatestWeight,
    getChartData,
    getWeeklyStats,
    refetch: fetchWeightLogs,
  };
}
