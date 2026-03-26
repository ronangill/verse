import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppBreadcrumbs } from '@/components/layout/AppBreadcrumbs';
import { BreadcrumbProvider } from '@/components/layout/BreadcrumbContext';
import { HeaderActionsProvider } from '@/components/layout/HeaderActionsContext';
import { useRef } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeProvider } from '@/components/theme-provider';
import { NowPlaying } from '@/components/player/NowPlaying';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { SearchTrigger } from '@/components/search/SearchTrigger';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useKodiWebSocket } from '@/api/hooks/useKodiWebSocket';

const ReactQueryDevtools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({
        default: m.ReactQueryDevtools,
      }))
    );

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import('@tanstack/router-devtools').then((m) => ({
        default: m.TanStackRouterDevtools,
      }))
    );

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppShell() {
  useKeyboardShortcuts();
  useKodiWebSocket();
  const headerSlotRef = useRef<HTMLDivElement>(null);

  return (
    <BreadcrumbProvider>
      <HeaderActionsProvider slotRef={headerSlotRef}>
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <AppBreadcrumbs />
              <div className="ml-auto flex items-center gap-2">
                <div ref={headerSlotRef} className="flex items-center gap-2" />
                <SearchTrigger />
              </div>
            </header>
            <div className="flex-1 overflow-auto">
              <Outlet />
            </div>
            <NowPlaying />
          </SidebarInset>
        </SidebarProvider>
        <GlobalSearch />
      </HeaderActionsProvider>
    </BreadcrumbProvider>
  );
}

function RootComponent() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AppShell />
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
        <TanStackRouterDevtools position="bottom-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
