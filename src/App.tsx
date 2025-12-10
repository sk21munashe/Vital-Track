import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import WaterTracker from "./pages/WaterTracker";
import CalorieTracker from "./pages/CalorieTracker";
import FitnessTracker from "./pages/FitnessTracker";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { BottomNav } from "./components/BottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" richColors />
      <HashRouter>
        <div className="h-full w-full flex flex-col bg-background overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/water" element={<WaterTracker />} />
              <Route path="/calories" element={<CalorieTracker />} />
              <Route path="/fitness" element={<FitnessTracker />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
