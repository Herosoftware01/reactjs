import React, { useState } from 'react';
import { Menu, X, Home, BarChart2, Settings, User } from 'lucide-react'; // Optional icons
import { useNavigate } from 'react-router-dom';

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 1. TOP NAVBAR (Sticky) */}
      <nav className="fixed top-0 z-50 w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="text-xl font-bold text-indigo-600">AdminPanel</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-md ">Bala</span>
          <span className="text-md ">Kishore</span>            
          <span className="text-md ">Fapric</span>
          <span className="text-md ">Printing</span>            
          <span className="text-md ">Report</span>
          <span className="text-md ">Report 1</span>            
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-sm text-gray-600 font-medium">John Doe</div>
          <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">JD</div>
        </div>
      </nav>

      <div className="flex pt-16"> {/* pt-16 accounts for navbar height */}
        
        {/* 2. LEFT SIDEBAR (Sticky) */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform mt-16
          md:translate-x-0 md:static md:inset-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-[calc(100vh-64px)] overflow-y-auto p-4 space-y-4">
            <SidebarItem icon={<Home size={20}/>} label="Dashboard" active />
            <SidebarItem onClick={()=> navigate('/start')} icon={<User size={20}/>} label="Bala" />
            <SidebarItem onClick={()=> navigate('/final')} icon={<User size={20}/>} label="Kishore" />
            <SidebarItem icon={<User size={20}/>} label="Printing" />
          </div>
        </aside>

        {/* 3. MAIN CONTENT (Scrollable) */}
        <main className="flex-1 p-6">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-[1200px] p-4 text-gray-400">
            Main Content Area (Scroll down to see navbar/sidebar stay put)
          </div>
        </main>
      </div>
    </div>
  );
};

// Helper Component for Sidebar Items
const SidebarItem = ({ icon, label, active = false, onClick }) => (
  <a href="#" onClick={onClick} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}>
    {icon}
    <span className="font-medium">{label}</span>
  </a>
);

export default DashboardLayout;