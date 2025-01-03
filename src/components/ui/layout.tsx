import React from 'react';
import { cn } from '@/lib/utils';

export function Layout({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('min-h-screen bg-white', className)} {...props}>
      {children}
    </div>
  );
}

export function LayoutHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <header className={cn('sticky top-0 z-50 bg-white', className)} {...props}>
      {children}
    </header>
  );
}

export function LayoutSidebar({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <aside
      className={cn('sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto', className)}
      {...props}
    >
      {children}
    </aside>
  );
}

export function LayoutContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <main className={cn('flex-1', className)} {...props}>
      {children}
    </main>
  );
}
