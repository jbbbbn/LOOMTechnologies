import { z } from "zod";

const searchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  snippet: z.string(),
  publishedDate: z.string().optional(),
});

export type SearchResult = z.infer<typeof searchResultSchema>;

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
}

// Mock search service that simulates real web search
// In production, this would integrate with a real search API like Google Custom Search, Bing, etc.
export async function performWebSearch(query: string): Promise<SearchResponse> {
  const startTime = Date.now();
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
  
  // Generate realistic search results based on query
  const results = generateSearchResults(query);
  
  const searchTime = Date.now() - startTime;
  
  return {
    results,
    totalResults: results.length * 10 + Math.floor(Math.random() * 1000),
    searchTime,
  };
}

function generateSearchResults(query: string): SearchResult[] {
  const baseResults = [
    {
      title: `${query} - Wikipedia`,
      url: `https://en.wikipedia.org/wiki/${query.replace(/\s+/g, '_')}`,
      snippet: `${query} is a topic of significant interest. Learn about its history, applications, and current developments in this comprehensive article.`,
      publishedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      title: `Understanding ${query}: A Complete Guide`,
      url: `https://example.com/guide/${query.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: `Discover everything you need to know about ${query}. This comprehensive guide covers fundamental concepts, practical applications, and expert insights.`,
      publishedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      title: `${query} News and Updates`,
      url: `https://news.example.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: `Stay updated with the latest news and developments about ${query}. Recent articles, analysis, and expert opinions.`,
      publishedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      title: `${query} - Research Papers and Studies`,
      url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
      snippet: `Academic research and scientific studies related to ${query}. Peer-reviewed papers and scholarly articles.`,
      publishedDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      title: `${query} Tools and Resources`,
      url: `https://tools.example.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
      snippet: `Explore useful tools, resources, and applications for ${query}. Free and premium options available.`,
      publishedDate: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  ];

  // Add query-specific results
  const querySpecificResults = generateQuerySpecificResults(query);
  
  return [...baseResults, ...querySpecificResults];
}

function generateQuerySpecificResults(query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('ai') || lowerQuery.includes('artificial intelligence')) {
    return [
      {
        title: 'OpenAI - Artificial Intelligence Research',
        url: 'https://openai.com',
        snippet: 'OpenAI is an AI research and deployment company. Our mission is to ensure that artificial general intelligence benefits all of humanity.',
        publishedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        title: 'Machine Learning Fundamentals',
        url: 'https://ml.example.com/fundamentals',
        snippet: 'Learn the basics of machine learning, neural networks, and AI development. Comprehensive tutorials and examples.',
        publishedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ];
  }
  
  if (lowerQuery.includes('programming') || lowerQuery.includes('code')) {
    return [
      {
        title: 'GitHub - Code Repository',
        url: 'https://github.com',
        snippet: 'GitHub is where people build software. Millions of developers collaborate on projects here.',
        publishedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        title: 'Stack Overflow - Programming Q&A',
        url: 'https://stackoverflow.com',
        snippet: 'Stack Overflow is the largest online community for programmers to learn, share knowledge, and build careers.',
        publishedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ];
  }
  
  return [];
}