interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'Carregando...' }: LoadingProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-12 h-12 rounded-full border-2 border-gray-800" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-orange-500 animate-spin" />
        </div>
        <p className="text-sm text-gray-500 font-medium">{message}</p>
      </div>
    </div>
  );
}
