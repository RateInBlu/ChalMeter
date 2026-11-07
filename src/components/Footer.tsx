import React from 'react';
import { Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#15243A] bg-[#0B1424] py-6 px-4 pb-24 text-center mt-6">
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center gap-1.5">
        <div className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-300">
          <Mail className="w-4 h-4 text-[#A5ED45] shrink-0" />
          <span className="font-semibold text-white">Contact:</span>
          <a
            href="mailto:email2varunsharma@gmail.com"
            className="text-[#A5ED45] hover:text-[#bef264] font-medium transition underline underline-offset-2 break-all focus:outline-none focus:ring-1 focus:ring-[#A5ED45] rounded"
          >
            email2varunsharma@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
};
