import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, ExternalLink, Clock, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import GoogleCustomSearch from "@/components/GoogleCustomSearch";
import type { Search } from "@shared/schema";

export default function Search() {
  const [query, setQuery] = useState("");
  const [currentSearch, setCurrentSearch] = useState<Search | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: searches = [], isLoading: searchesLoading } = useQuery<Search[]>({
    queryKey: ["/api/searches"],
  });

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await apiRequest("POST", "/api/search", { query: searchQuery });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/searches"] });
      setCurrentSearch(data);
      toast({ title: "Search completed!" });
    },
    onError: () => {
      toast({ title: "Search failed", variant: "destructive" });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    searchMutation.mutate(query.trim());
  };

  const getRecentSearches = () => {
    return searches
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  };

  const getPopularSearches = () => {
    const searchCounts = searches.reduce((acc, search) => {
      acc[search.query] = (acc[search.query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(searchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([query, count]) => ({ query, count }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[var(--loom-orange)] rounded-lg flex items-center justify-center">
            <SearchIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold">LOOM Search</h1>
          <Badge variant="outline" className="text-[var(--loom-orange)] border-[var(--loom-orange)]">
            AI Personalization Active
          </Badge>
        </div>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search for anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 text-lg h-12"
              />
            </div>
            <Button 
              type="submit" 
              size="lg"
              className="bg-[var(--loom-orange)] hover:bg-[var(--loom-light)]"
              disabled={searchMutation.isPending}
            >
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Google Custom Search */}
          <GoogleCustomSearch />
          {searchMutation.isPending ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--loom-orange)] mx-auto"></div>
                  <p className="text-gray-600 mt-2">Searching...</p>
                </div>
              </CardContent>
            </Card>
          ) : currentSearch ? (
            <Card>
              <CardHeader>
                <CardTitle>Search Results for "{currentSearch.query}"</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(currentSearch.results) && currentSearch.results.length > 0 ? (
                    currentSearch.results.map((result: any, idx: number) => (
                      <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg text-blue-600 hover:text-blue-800">
                              <a href={result.url} target="_blank" rel="noopener noreferrer">
                                {result.title}
                              </a>
                            </h3>
                            <p className="text-green-600 text-sm mb-2">{result.url}</p>
                            <p className="text-gray-600">{result.snippet}</p>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={result.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <SearchIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No results found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start your search</h3>
                <p className="text-gray-600">
                  Enter a search query to find personalized results powered by AI
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Recent Searches</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchesLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : getRecentSearches().length === 0 ? (
                <p className="text-gray-600 text-sm">No recent searches</p>
              ) : (
                <div className="space-y-2">
                  {getRecentSearches().map((search) => (
                    <div 
                      key={search.id} 
                      className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                      onClick={() => setQuery(search.query)}
                    >
                      {search.query}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Popular Searches</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getPopularSearches().length === 0 ? (
                <p className="text-gray-600 text-sm">No popular searches yet</p>
              ) : (
                <div className="space-y-2">
                  {getPopularSearches().map(({ query, count }) => (
                    <div 
                      key={query} 
                      className="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50 p-2 rounded"
                      onClick={() => setQuery(query)}
                    >
                      <span className="text-blue-600">{query}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Search Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">Top Interest</div>
                  <div className="text-xs text-blue-700">Technology & AI</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-green-900">Search Pattern</div>
                  <div className="text-xs text-green-700">Most active: 2-4 PM</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-orange-900">Suggestion</div>
                  <div className="text-xs text-orange-700">Try more specific queries</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
