
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherProfile from "./pages/TeacherProfile";
import TeacherCompletedLessons from "./pages/TeacherCompletedLessons";
import WeeklyClassSubjectDetail from "./pages/WeeklyClassSubjectDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/teacher-dashboard" 
              element={
                <ProtectedRoute requiredRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher-profile/:teacherId" 
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <TeacherProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher-completed-lessons/:teacherId" 
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <TeacherCompletedLessons />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/weekly-detail/:class/:subject/:teacher/:weekStart/:weekEnd" 
              element={
                <ProtectedRoute requiredRoles={['admin', 'teacher']}>
                  <WeeklyClassSubjectDetail />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
