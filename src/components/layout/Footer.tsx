import { Facebook, Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <Link href="/terms" className="text-white hover:text-primary-200 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-white hover:text-primary-200 transition-colors">
              Privacy Policy
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-4">
              <a href="#" className="text-white hover:text-primary-200 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-white hover:text-primary-200 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white hover:text-primary-200 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-primary-200">
              Travody 2025. All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

