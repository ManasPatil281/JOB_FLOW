import React from 'react';
import { Briefcase } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-black/30 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center mb-8">
          <Briefcase className="w-8 h-8 text-purple-400" />
          <span className="ml-2 text-xl font-bold text-white">JobFlow AI for Talent Corner H.R. Services Pvt. Ltd.</span>
        </div>
        <p className="text-center text-gray-400">Made by Manas Patil .</p>
      </div>
    </footer>
  );
}

export default Footer;