import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import MindMap from './pages/MindMap';
import Timeline from './pages/Timeline';
import GitHubIntelligence from './pages/GitHubIntelligence';
import Insights from './pages/Insights';
import AskBrain from './pages/AskBrain';
import Settings from './pages/Settings';

function App() {
  return (
    <div className="dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="mindmap" element={<MindMap />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="github" element={<GitHubIntelligence />} />
            <Route path="insights" element={<Insights />} />
            <Route path="ask" element={<AskBrain />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
