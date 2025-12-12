import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Heart, Droplets, Flame, Dumbbell, Mail, Lock, User, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters").optional();

interface AuthProps {
  onSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  onSignUp: (email: string, password: string, preferredName?: string) => Promise<{ error: Error | null }>;
}

const Auth = ({ onSignIn, onSignUp }: AuthProps) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    
    const emailResult = emailSchema.safeParse(email.trim());
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (mode === 'signup' && preferredName.trim()) {
      const nameResult = nameSchema.safeParse(preferredName.trim());
      if (!nameResult.success) {
        newErrors.name = nameResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      if (mode === 'signin') {
        const { error } = await onSignIn(email.trim(), password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
        }
      } else {
        const { error } = await onSignUp(email.trim(), password, preferredName.trim() || undefined);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast.error('An account with this email already exists. Please sign in instead.');
            setMode('signin');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created! Welcome to VitalTrack!');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg"
            >
              <Heart className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              VitalTrack
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {mode === 'signin' ? 'Welcome back!' : 'Create your account'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-4">
              {[
                { icon: Droplets, color: "text-blue-500", delay: 0.3 },
                { icon: Flame, color: "text-green-500", delay: 0.4 },
                { icon: Dumbbell, color: "text-orange-500", delay: 0.5 },
              ].map(({ icon: Icon, color, delay }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay }}
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </motion.div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Preferred Name (optional)
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="What should we call you?"
                    value={preferredName}
                    onChange={(e) => {
                      setPreferredName(e.target.value);
                      setErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    className="h-12"
                    maxLength={50}
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm">{errors.name}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  className="h-12"
                />
                {errors.email && (
                  <p className="text-destructive text-sm">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  className="h-12"
                />
                {errors.password && (
                  <p className="text-destructive text-sm">{errors.password}</p>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : mode === 'signin' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setErrors({});
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {mode === 'signin' ? (
                  <>Don't have an account? <span className="text-primary font-medium">Sign up</span></>
                ) : (
                  <>Already have an account? <span className="text-primary font-medium">Sign in</span></>
                )}
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Track water, calories, and fitness to achieve your wellness goals
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
