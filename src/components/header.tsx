'use client';

import { PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserNav } from '@/components/user-nav';

interface HeaderProps {
  navContent: React.ReactNode;
  title: string;
}

export function Header({ navContent, title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="md:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 sm:max-w-xs">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            A list of navigation links for the site.
          </SheetDescription>
          {navContent}
        </SheetContent>
      </Sheet>
      <div className="relative ml-auto flex flex-1 items-center justify-end gap-2 md:grow-0">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
