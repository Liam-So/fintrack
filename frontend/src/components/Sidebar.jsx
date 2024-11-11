import React from 'react'
import { Menu, Home, Settings, HelpCircle, User, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useUser();

  return (
    <>
      {/* Sidebar */}
      <aside className={`bg-white text-gray-800 w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out border-r border-gray-200`}>
        <nav className="space-y-3 px-4">
          <div className="flex items-center justify-between mb-6">
            <span className="text-2xl font-bold text-gray-800">FinDash</span>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-800">
              <Menu size={24} />
            </button>
          </div>
          <ul>
            <SidebarItem icon={Home} text="Dashboard" />
            <SidebarItem icon={Upload} text="Upload" link={`/upload/${user?.id}`} />
            <SidebarItem icon={Settings} text="Settings" />
            <SidebarItem icon={User} text="Profile" link={"/profile"} />
          </ul>
        </nav>
      </aside>
    </>
  )
}

const SidebarItem = ({ icon: Icon, text, link = "#" }) => (
  <li className="mb-6">
    <Link to={link} className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200">
      <Icon className="mr-4" size={24} />
      <span className="text-lg">{text}</span>
    </Link>
  </li>
);

export default Sidebar