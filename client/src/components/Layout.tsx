import { Navigation } from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 smooth-transition">
      <Navigation />
      <main className="flex-1 fade-in">
        {children}
      </main>
    </div>
  );
}
