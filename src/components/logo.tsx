import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className, href = "/" }: { className?: string, href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 text-foreground transition-transform hover:scale-105", className)}>
      <GraduationCap className="h-6 w-6 text-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
      <span className="font-headline text-xl font-bold">HireJacks</span>
    </Link>
  );
}
