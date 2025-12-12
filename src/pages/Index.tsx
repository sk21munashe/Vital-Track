import Dashboard from './Dashboard';
import { UserProfile as CloudUserProfile } from '@/hooks/useAuth';

interface IndexProps {
  displayName?: string;
  onSignOut?: () => void;
  cloudProfile?: CloudUserProfile | null;
  onUpdatePreferredName?: (name: string) => Promise<{ error: Error | null }>;
  onUpdateAvatar?: (type: string, value: string) => Promise<{ error: Error | null }>;
}

const Index = ({ displayName, onSignOut, cloudProfile, onUpdatePreferredName, onUpdateAvatar }: IndexProps) => {
  return (
    <Dashboard 
      displayName={displayName}
      onSignOut={onSignOut}
      cloudProfile={cloudProfile}
      onUpdatePreferredName={onUpdatePreferredName}
      onUpdateAvatar={onUpdateAvatar}
    />
  );
};

export default Index;
