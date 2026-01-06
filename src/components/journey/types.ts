export type ArchitectureStyle = 'space' | 'nature' | 'city' | 'ocean' | 'mountain';

export interface JourneyData {
  water: {
    current: number;
    goal: number;
    progress: number;
    history: { date: string; value: number }[];
  };
  calories: {
    current: number;
    goal: number;
    progress: number;
    history: { date: string; value: number }[];
  };
}

export interface ArchitectureProps {
  data: JourneyData;
  onWaterClick: () => void;
  onCaloriesClick: () => void;
}
