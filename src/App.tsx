import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import WaterTracker from "./pages/WaterTracker";
import CalorieTracker from "./pages/CalorieTracker";
import FitnessTracker from "./pages/FitnessTracker";
import SleepTracker from "./pages/SleepTracker";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { BottomNav } from "./components/BottomNav";
import { SplashScreen } from "./components/SplashScreen";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

const AuthenticatedApp = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const { signOut, displayName, profile, updatePreferredName, updateAvatar } = useAuth();
  
  // Lazy load SettingsPanel
  const SettingsPanel = require('./components/SettingsPanel').SettingsPanel;

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <HashRouter>
        <div className="h-full w-full flex flex-col bg-background overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <Routes>
              <Route 
                path="/" 
                element={
                  <Index 
                    displayName={displayName}
                  />
                } 
              />
              <Route path="/water" element={<WaterTracker />} />
              <Route path="/calories" element={<CalorieTracker />} />
              <Route path="/fitness" element={<FitnessTracker />} />
              <Route path="/sleep" element={<SleepTracker />} />
              <Route 
                path="/profile" 
                element={
                  <Profile 
                    displayName={displayName}
                    onSignOut={signOut}
                    cloudProfile={profile}
                    onUpdatePreferredName={updatePreferredName}
                    onUpdateAvatar={updateAvatar}
                    onOpenSettings={() => setShowSettings(true)}
                  />
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
        
        {/* Settings Panel - rendered at app level */}
        <SettingsPanel 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSignOut={signOut}
          displayName={displayName}
          cloudProfile={profile}
          onUpdatePreferredName={updatePreferredName}
          onUpdateAvatar={updateAvatar}
        />
      </HashRouter>
    </>
  );
};

const AppContent = () => {
  const { user, loading, signIn, signUp } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Auth onSignIn={signIn} onSignUp={signUp} />;
  }

  return <AuthenticatedApp />;
};

const App = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" richColors />
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
