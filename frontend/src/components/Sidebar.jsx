import { Home, User, Upload, LogOut, PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { logout, isAuthenticated } = useUser();

  const dashboardUrl = isAuthenticated ? '/dashboard' : '/trial/dashboard';
  const uploadUrl = isAuthenticated ? '/upload' : '/trial/upload';
  
  const handleLogout = () => {
    sessionStorage.clear();
    logout();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 text-gray-500 hover:text-gray-800"
        >
          <PanelLeftOpen size={24} />
        </button>
      )}
      
      {/* Sticky Sidebar */}
      <aside className={`flex flex-col text-gray-800 py-7 px-2 fixed md:sticky top-0 h-screen overflow-y-auto transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition duration-200 ease-in-out border-r border-gray-200 bg-amber-50 md:bg-transparent`}>
        {/* Main Content Container */}
        <div className="flex flex-col h-full min-h-0">
          {/* Top Section */}
          <div className="px-4">
            <div className="flex flex-col items-center justify-between mb-6 gap-4">
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-800">
                <PanelRightOpen size={24} />
              </button>
              <span className="text-4xl font-bold text-gray-800">💸</span>
            </div>
            
            {/* Main Navigation */}
            <nav>
              <ul className="space-y-6">
                <SidebarItem icon={Home} link={dashboardUrl} />
                <SidebarItem icon={Upload} link={uploadUrl} />
                {isAuthenticated && <SidebarItem icon={User} link="/profile" />}
              </ul>
            </nav>
          </div>

          {/* Logout Button (Bottom) */}
          <div className="mt-auto px-4 pb-4">
            <ul>
              <div onClick={handleLogout} className="cursor-pointer">
                <SidebarItem icon={LogOut} />
              </div>
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
};

// Modified SidebarItem to handle logout case differently
const SidebarItem = ({ icon: Icon, link = "#" }) => {
  const content = (
    <div className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200">
      <Icon size={24} />
    </div>
  );

  return (
    <li>
      {link === "#" ? content : <Link to={link}>{content}</Link>}
    </li>
  );
};

export default Sidebar;