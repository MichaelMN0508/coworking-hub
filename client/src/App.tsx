import { Route, Routes } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import MapPage from "./pages/MapPage";
import SessionsPage from "./pages/SessionsPage";
import SessionDetailPage from "./pages/SessionDetailPage";
import CreateSessionPage from "./pages/CreateSessionPage";
import PlaceDetailPage from "./pages/PlaceDetailPage";
import MyPage from "./pages/MyPage";

export default function App() {
  return (
    <div className="min-h-screen bg-canvas">
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/places/:id" element={<PlaceDetailPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/sessions/new" element={<CreateSessionPage />} />
        <Route path="/sessions/:id" element={<SessionDetailPage />} />
        <Route path="/mine" element={<MyPage />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
