import { Navigation } from "./Navigation";
import { AIAssistant } from "./AIAssistant";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <AIAssistant />
    </div>
  );
}
