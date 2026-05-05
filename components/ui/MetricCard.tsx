import { Card } from './Card';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon?: string;
}

export function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <Card hoverable={false}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-vx-gray text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        {icon && (
          <span className="text-3xl opacity-50">{icon}</span>
        )}
      </div>
    </Card>
  );
}
