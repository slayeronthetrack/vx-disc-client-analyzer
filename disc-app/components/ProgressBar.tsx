interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;
  
  return (
    <div className="w-full bg-vx-dark-secondary rounded-full h-3 overflow-hidden border border-vx-orange/20">
      <div 
        className="h-full bg-gradient-to-r from-vx-orange to-orange-600 transition-all duration-500 ease-out rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
