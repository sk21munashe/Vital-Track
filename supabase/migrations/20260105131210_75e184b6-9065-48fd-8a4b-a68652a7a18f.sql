-- Create table for storing user health profiles and plans
CREATE TABLE public.user_health_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  health_profile JSONB NOT NULL,
  health_plan JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_plan UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_health_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own health plan" 
ON public.user_health_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health plan" 
ON public.user_health_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health plan" 
ON public.user_health_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health plan" 
ON public.user_health_plans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_health_plans_updated_at
BEFORE UPDATE ON public.user_health_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();