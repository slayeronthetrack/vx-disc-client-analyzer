export function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-vx-dark">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-vx-orange border-t-transparent mb-4"></div>
        <p className="text-vx-gray">Carregando diagnóstico...</p>
      </div>
    </div>
  );
}
