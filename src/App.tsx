import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Login from "./pages/Login";
import TherapistDashboard from "./pages/TherapistDashboard";
import ChildHome from "./pages/ChildHome";
import ChildActivityView from "./pages/ChildActivityView";
import PreviewActivity from "./pages/PreviewActivity";

import ColorMatchingPage from "./pages/ColorMatchingPage";
import BoardGamePage from "./pages/BoardGamePage";

import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Entry */}
        <Route path="/" element={<Index />} />

        {/* Auth / dashboards */}
        <Route path="/login" element={<Login />} />
        <Route path="/therapist/dashboard" element={<TherapistDashboard />} />

        {/* ✅ IMPORTANT: these preview routes are being used in your app */}
        <Route path="/preview/:activityId" element={<PreviewActivity />} />
        <Route path="/child/activity/:activityId" element={<ChildActivityView />} />
        <Route path="/therapist/dashboard" element={<TherapistDashboard />} />
<Route path="/child/home" element={<ChildHome />} />
<Route path="/board-game" element={<BoardGamePage />} />


        {/* Games */}
        <Route path="/color-matching" element={<ColorMatchingPage />} />
        <Route path="/board-game" element={<BoardGamePage />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
