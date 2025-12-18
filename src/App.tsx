import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import AudioTestButton from "@/components/AudioTestButton";

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const TherapistDashboard = lazy(() => import("./pages/TherapistDashboard"));
const CreateActivitySelect = lazy(() => import("./pages/CreateActivitySelect"));
const ActivityAuthoring = lazy(() => import("./pages/ActivityAuthoring"));
const PreviewActivity = lazy(() => import("./pages/PreviewActivity"));
const ChildHome = lazy(() => import("./pages/ChildHome"));
const ChildActivityView = lazy(() => import("./pages/ChildActivityView"));
const ReviewSubmission = lazy(() => import("./pages/ReviewSubmission"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppTopBar() {
  return (
    <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-end gap-2 px-4 py-3">
        <AudioTestButton />
        <LanguageSwitcher />
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppTopBar />
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
              Loading…
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/therapist/dashboard" element={<TherapistDashboard />} />
            <Route path="/therapist/create" element={<CreateActivitySelect />} />
            <Route path="/therapist/create/:activityType" element={<ActivityAuthoring />} />
            <Route path="/therapist/review/:activityId/:childId" element={<ReviewSubmission />} />
            <Route path="/preview/:activityId" element={<PreviewActivity />} />
            <Route path="/child/home" element={<ChildHome />} />
            <Route path="/child/activity/:activityId" element={<ChildActivityView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
