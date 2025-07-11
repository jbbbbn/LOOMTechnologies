"""
Tavily Web Search Tool
"""

import os
from typing import Dict, List, Any
import requests
import json

class WebSearchTool:
    def __init__(self):
        self.api_key = os.getenv("TAVILY_API_KEY")
        self.base_url = "https://api.tavily.com"
        self.is_available = self.api_key is not None
    
    def search(self, query: str) -> str:
        """Search the web using Tavily API"""
        try:
            if not self.is_available:
                return f"Web search not available. Query was: {query}"
            
            response = requests.post(
                f"{self.base_url}/search",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                },
                json={
                    "api_key": self.api_key,
                    "query": query,
                    "search_depth": "basic",
                    "include_answer": True,
                    "include_domains": [],
                    "exclude_domains": [],
                    "max_results": 3
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                
                if results:
                    formatted_results = []
                    for result in results:
                        formatted_results.append(
                            f"**{result.get('title', 'No title')}**\n"
                            f"{result.get('content', 'No content')}\n"
                            f"Source: {result.get('url', 'No URL')}"
                        )
                    
                    return f"Web search results for '{query}':\n\n" + "\n\n".join(formatted_results)
                else:
                    return f"No results found for '{query}'"
            else:
                return f"Web search failed with status {response.status_code}"
                
        except Exception as e:
            return f"Web search error: {str(e)}"
    
    def check_status(self) -> bool:
        """Check if web search is available"""
        return self.is_available
    
    def get_news(self, topic: str = "technology") -> str:
        """Get latest news on a topic"""
        return self.search(f"latest news {topic}")
    
    def get_weather(self, location: str) -> str:
        """Get weather information"""
        return self.search(f"weather {location}")
    
    def search_academic(self, query: str) -> str:
        """Search for academic/research information"""
        return self.search(f"academic research {query}")
    
    def search_local(self, query: str, location: str) -> str:
        """Search for local information"""
        return self.search(f"{query} near {location}")
    
    def get_stock_info(self, symbol: str) -> str:
        """Get stock information"""
        return self.search(f"stock price {symbol}")
    
    def search_recipes(self, ingredients: str) -> str:
        """Search for recipes"""
        return self.search(f"recipes with {ingredients}")
    
    def search_travel(self, destination: str) -> str:
        """Search for travel information"""
        return self.search(f"travel guide {destination}")
    
    def search_health(self, condition: str) -> str:
        """Search for health information"""
        return self.search(f"health information {condition}")
    
    def search_technology(self, topic: str) -> str:
        """Search for technology information"""
        return self.search(f"technology {topic}")
    
    def search_entertainment(self, query: str) -> str:
        """Search for entertainment information"""
        return self.search(f"entertainment {query}")
    
    def search_sports(self, query: str) -> str:
        """Search for sports information"""
        return self.search(f"sports {query}")
    
    def search_finance(self, query: str) -> str:
        """Search for financial information"""
        return self.search(f"finance {query}")
    
    def search_education(self, query: str) -> str:
        """Search for educational information"""
        return self.search(f"education {query}")
    
    def search_science(self, query: str) -> str:
        """Search for science information"""
        return self.search(f"science {query}")
    
    def search_history(self, query: str) -> str:
        """Search for historical information"""
        return self.search(f"history {query}")
    
    def search_culture(self, query: str) -> str:
        """Search for cultural information"""
        return self.search(f"culture {query}")
    
    def search_art(self, query: str) -> str:
        """Search for art information"""
        return self.search(f"art {query}")
    
    def search_music(self, query: str) -> str:
        """Search for music information"""
        return self.search(f"music {query}")
    
    def search_books(self, query: str) -> str:
        """Search for book information"""
        return self.search(f"books {query}")
    
    def search_movies(self, query: str) -> str:
        """Search for movie information"""
        return self.search(f"movies {query}")
    
    def search_games(self, query: str) -> str:
        """Search for gaming information"""
        return self.search(f"games {query}")
    
    def search_food(self, query: str) -> str:
        """Search for food information"""
        return self.search(f"food {query}")
    
    def search_shopping(self, query: str) -> str:
        """Search for shopping information"""
        return self.search(f"shopping {query}")
    
    def search_real_estate(self, query: str) -> str:
        """Search for real estate information"""
        return self.search(f"real estate {query}")
    
    def search_jobs(self, query: str) -> str:
        """Search for job information"""
        return self.search(f"jobs {query}")
    
    def search_cars(self, query: str) -> str:
        """Search for automotive information"""
        return self.search(f"cars {query}")
    
    def search_pets(self, query: str) -> str:
        """Search for pet information"""
        return self.search(f"pets {query}")
    
    def search_gardening(self, query: str) -> str:
        """Search for gardening information"""
        return self.search(f"gardening {query}")
    
    def search_diy(self, query: str) -> str:
        """Search for DIY information"""
        return self.search(f"DIY {query}")
    
    def search_fitness(self, query: str) -> str:
        """Search for fitness information"""
        return self.search(f"fitness {query}")
    
    def search_nutrition(self, query: str) -> str:
        """Search for nutrition information"""
        return self.search(f"nutrition {query}")
    
    def search_mental_health(self, query: str) -> str:
        """Search for mental health information"""
        return self.search(f"mental health {query}")
    
    def search_parenting(self, query: str) -> str:
        """Search for parenting information"""
        return self.search(f"parenting {query}")
    
    def search_relationships(self, query: str) -> str:
        """Search for relationship information"""
        return self.search(f"relationships {query}")
    
    def search_career(self, query: str) -> str:
        """Search for career information"""
        return self.search(f"career {query}")