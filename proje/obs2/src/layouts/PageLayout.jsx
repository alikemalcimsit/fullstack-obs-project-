import React from 'react';
import Sidebar from '../components/Sidebar';

export default function PageLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50">
      <div className="w-72 shadow-xl z-10">
        <Sidebar />
      </div>
      <div className="flex-1 bg-[#F6FAFB] min-h-screen border-l border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
