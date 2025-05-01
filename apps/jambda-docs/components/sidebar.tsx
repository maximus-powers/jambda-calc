'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Navigation items - these should match your markdown files
const navigation = [
  { name: 'Home', href: '/' },
  { name: '🧑‍🍳 - Cookbook', href: '/cookbook' },
  { name: '📋 - Input JS Checklist', href: '/js-specs' },
  // { name: '🛝 - Playground', href: '/playground' },
  // { name: '🧑‍🏫 - λ Calc Resources', href: '/learn-lambda-calc' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close sidebar when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile menu button - always visible on mobile */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          type="button"
          className="p-2 rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 shadow-md"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile sidebar with backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`fixed inset-y-0 left-0 w-64 bg-gray-50 dark:bg-gray-700 shadow-lg p-4 overflow-y-auto transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">jambda-calc</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar with toggle button */}
      <div className="hidden md:block md:fixed md:inset-y-0 md:flex md:flex-col">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 w-64">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center justify-between flex-shrink-0 px-4 mb-5">
              <h2 className="text-xl font-bold">λjambda.calc</h2>
            </div>
            <nav className="mt-1 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
