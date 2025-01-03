import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutSidebar,
} from '@/components/ui/layout';
import {
  Home,
  Heart,
  History,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: Home },
  { label: 'My Donations', href: '/dashboard/donations', icon: Heart },
  { label: 'History', href: '/dashboard/history', icon: History },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <Layout>
      <LayoutHeader className="border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-rose-600" />
            <span className="font-semibold">HopeCare</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/projects"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Projects
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Contact
            </Link>
          </nav>
        </div>
      </LayoutHeader>

      <div className="flex">
        <LayoutSidebar className="w-64 border-r bg-gray-50">
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-2 py-4">
              {navItems.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg mb-1
                      ${
                        isActive
                          ? 'bg-rose-50 text-rose-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t">
              <button
                onClick={() => {
                  // Add logout logic here
                }}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </LayoutSidebar>

        <LayoutContent>
          <div className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </div>
        </LayoutContent>
      </div>
    </Layout>
  );
}
