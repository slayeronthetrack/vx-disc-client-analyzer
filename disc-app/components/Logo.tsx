export default function Logo({ className = "w-32" }: { className?: string }) {
  return (
    <div className={`${className} flex items-center gap-1`}>
      <span className="text-vx-orange font-bold text-4xl tracking-tight">VX</span>
      <span className="text-white font-light text-sm">CONSULTORIA</span>
    </div>
  );
}
