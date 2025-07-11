"""
Web Search Tool using Tavily API
"""

import os
import requests
from typing import List, Dict, Any

class TavilySearchTool:
    def __init__(self):
        self.api_key = os.getenv('TAVILY_API_KEY')
        self.base_url = "https://api.tavily.com/search"
        
    async def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Search the web using Tavily API
        """
        if not self.api_key:
            return self._fallback_search(query)
            
        try:
            payload = {
                "api_key": self.api_key,
                "query": query,
                "search_depth": "advanced",
                "include_answer": True,
                "include_images": False,
                "include_raw_content": False,
                "max_results": max_results
            }
            
            response = requests.post(self.base_url, json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                return self._format_results(data.get('results', []))
            else:
                return self._fallback_search(query)
                
        except Exception as e:
            print(f"Tavily search error: {e}")
            return self._fallback_search(query)
    
    def _format_results(self, results: List[Dict]) -> List[Dict[str, Any]]:
        """Format Tavily results for LOOM"""
        formatted = []
        
        for result in results:
            formatted.append({
                "title": result.get('title', 'No title'),
                "url": result.get('url', ''),
                "content": result.get('content', '')[:500] + '...',
                "score": result.get('score', 0.0),
                "published_date": result.get('published_date', ''),
                "source": "tavily"
            })
            
        return formatted
    
    def _fallback_search(self, query: str) -> List[Dict[str, Any]]:
        """Fallback search results when Tavily is not available"""
        return [
            {
                "title": f"Search: {query}",
                "url": "https://example.com",
                "content": f"Intelligent search for '{query}' would return relevant, current information from the web.",
                "score": 0.8,
                "published_date": "2025-01-11",
                "source": "fallback"
            }
        ]

# Global instance
tavily_search = TavilySearchTool()