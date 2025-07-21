export interface Property {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  description: string;
  imageUrl: string;
  originalUrl: string;
  source: string;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  type: 'casa' | 'apartamento' | 'terreno' | 'comercial' | 'outro';
  createdAt: Date;
}

export interface SearchFilters {
  query: string;
  type?: 'casa' | 'apartamento' | 'terreno' | 'comercial' | 'outro';
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  location?: string;
  minArea?: number;
}

export interface SearchResult {
  properties: Property[];
  total: number;
  sources: string[];
  searchTime: number;
  errors?: string[];
}

export interface SearchLog {
  id: string;
  query: string;
  filters: SearchFilters;
  resultsCount: number;
  timestamp: Date;
} 