import { createBrowserClient } from '@supabase/ssr';

// Define a function to create the Supabase client for browser-side operations
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Note: For server-side operations (e.g., in Route Handlers or Server Actions in Next.js 13+ App Router),
// you would typically use `createServerClient` from `@supabase/ssr` with cookies.
// This client is specifically for client-side component usage.

// Initialize a single instance for client-side usage if preferred,
// or call createSupabaseBrowserClient() directly in components/hooks.
// const supabase = createSupabaseBrowserClient();
// export default supabase;

// For now, exporting the factory function is more flexible for direct use in components
// or for potential context/provider patterns.
