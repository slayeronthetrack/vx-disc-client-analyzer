interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;
  
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-vx-gray">
          Pergunta {current} de {total}
        </span>
        <span className="text-sm text-vx-orange font-semibold">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full h-2 bg-vx-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-vx-orange transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
