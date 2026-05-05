// Mock authentication para MVP
// Futuro: integrar com Supabase

export function checkAuth(): boolean {
  // MVP: sempre retorna true (mock)
  // Futuro: verificar token Supabase
  const mockAuth = true;
  return mockAuth;
}

// Futuro com Supabase:
// export async function checkAuth(): Promise<boolean> {
//   const { data: { session } } = await supabase.auth.getSession();
//   return !!session;
// }
