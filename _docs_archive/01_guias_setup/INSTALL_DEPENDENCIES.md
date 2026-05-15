# Dependencies to Install

## Required for Company Management System

The following dependencies need to be installed for the admin interface to work optimally:

```bash
npm install react-hook-form @hookform/resolvers @tanstack/react-query react-colorful
```

### Package Details

1. **react-hook-form** (v7.x)
   - Form state management
   - Used in CompanyForm component
   - Provides validation and error handling

2. **@hookform/resolvers** (v3.x)
   - Zod integration for react-hook-form
   - Enables schema-based validation

3. **@tanstack/react-query** (v5.x)
   - Data fetching and caching
   - Will be used for custom hooks (useCompanies, useCompanyTests)
   - Provides automatic refetching and cache management

4. **react-colorful** (v5.x)
   - Color picker component
   - Used for branding customization
   - Lightweight and accessible

## Current Status

The forms are currently implemented with **vanilla React state management** and will work without these dependencies. However, installing them will provide:

- Better form validation
- Improved user experience
- Automatic data caching
- Enhanced color picker UI

## Installation Instructions

1. Open your terminal in the project root
2. Run the installation command:
   ```bash
   npm install react-hook-form @hookform/resolvers @tanstack/react-query react-colorful
   ```
3. Restart your development server if running

## Optional: React Query Setup

After installing @tanstack/react-query, wrap your app with QueryClientProvider:

```typescript
// app/layout.tsx or app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

## Note

The current implementation works without these dependencies. They are recommended for production use but not required for testing the basic functionality.
