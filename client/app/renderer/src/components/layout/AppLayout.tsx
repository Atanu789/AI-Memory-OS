import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import StatusBar from './StatusBar';

export default function AppLayout() {
  return (
    <div className="flex h-screen w-screen bg-bg-primary text-text-primary overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <TopBar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        
        {/* Status Bar */}
        <StatusBar />
      </div>
    </div>
  );
}
