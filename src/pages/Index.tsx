import Dashboard from './Dashboard';

interface IndexProps {
  displayName?: string;
}

const Index = ({ displayName }: IndexProps) => {
  return (
    <Dashboard 
      displayName={displayName}
    />
  );
};

export default Index;
