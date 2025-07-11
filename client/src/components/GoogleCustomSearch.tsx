import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface GoogleCustomSearchProps {
  className?: string;
}

export default function GoogleCustomSearch({ className }: GoogleCustomSearchProps) {
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Custom Search script
    const script = document.createElement('script');
    script.src = 'https://cse.google.com/cse.js?cx=500a10ce1ddf24ab2';
    script.async = true;
    
    script.onload = () => {
      // Script loaded, the search box should now be functional
      console.log('Google Custom Search loaded');
      
      // Track search usage in LOOM
      setTimeout(() => {
        const searchBox = document.querySelector('.gsc-search-box input');
        if (searchBox) {
          searchBox.addEventListener('change', (e) => {
            // Save search to LOOM recent searches
            const query = (e.target as HTMLInputElement).value;
            if (query.trim()) {
              fetch('/api/search', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ query })
              }).catch(err => console.log('Search tracking failed:', err));
            }
          });
        }
      }, 1000);
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script when component unmounts
      const existingScript = document.querySelector('script[src*="cse.google.com"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className={className}>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-orange-600" />
            Google Custom Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Search the web with your custom Google search engine
            </div>
            
            {/* Google Custom Search Element */}
            <div ref={searchRef} className="gcse-search"></div>
            
            <div className="text-xs text-gray-500 mt-4">
              <p>Powered by Google Custom Search Engine</p>
              <p>Engine ID: 500a10ce1ddf24ab2</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}