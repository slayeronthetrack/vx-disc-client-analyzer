import Link from 'next/link';

export function Logo() {
  return (
    <Link 
      href="/"
      className="transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(247,151,30,0.25)]"
    >
      <div className="text-2xl font-bold text-vx-orange">
        VX
      </div>
    </Link>
  );
}
