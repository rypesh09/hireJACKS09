'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BellRing,
  Briefcase,
  FileText,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  Newspaper,
  UserCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { SmartAssistant } from '@/components/smart-assistant';

const studentNavItems = [
  { href: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/student/profile', icon: UserCircle, label: 'My Profile' },
  { href: '/student/jobs', icon: Briefcase, label: 'All Jobs' },
  { href: '/student/job-recommendations', icon: Lightbulb, label: 'Job Recommendations' },
  { href: '/student/resume-builder', icon: FileText, label: 'Resume Builder' },
  { href: '/student/job-alerts', icon: BellRing, label: 'Job Alerts' },
  { href: '/student/news', icon: Newspaper, label: 'Notifications & News' },
];

function NavLink({ href, icon: Icon, label }: { href:string; icon: React.ElementType; label: string; }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href) && (href !== '/student/dashboard' || pathname === href);

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
        isActive && 'bg-muted text-primary'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function NavContent() {
  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Logo href="/student/dashboard" />
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {studentNavItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
      </div>
    </div>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Don't do anything until the auth state is fully loaded
    if (loading) {
      return;
    }

    // Once loaded, check for authorization
    if (user && role === 'student') {
      setIsAuthorized(true);
    } else {
      // If not authorized, redirect to login
      router.push('/login');
    }
  }, [user, role, loading, router]);

  // While checking authorization, show a loader
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <NavContent />
      </div>
      <div className="flex flex-col">
        <Header navContent={<NavContent />} title="Student Portal" />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
      <SmartAssistant />
    </div>
  );
}
