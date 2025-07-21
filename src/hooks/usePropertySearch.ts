'use client';

import { useState, useCallback } from 'react';
import { SearchFilters, SearchResult, SearchLog } from '@/types/property';

export function usePropertySearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);

  const search = useCallback(async (filters: SearchFilters) => {
    setIsLoading(true);
    setResult(null);

    try {
      // Construir URL de busca
      const params = new URLSearchParams();
      params.append('q', filters.query);
      
      if (filters.type) params.append('type', filters.type);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.bedrooms) params.append('bedrooms', filters.bedrooms.toString());
      if (filters.location) params.append('location', filters.location);

      const response = await fetch(`/api/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro na busca');
      }

      const searchResult: SearchResult = await response.json();
      setResult(searchResult);

      // Adicionar à lista de logs
      const newLog: SearchLog = {
        id: Date.now().toString(),
        query: filters.query,
        filters,
        resultsCount: searchResult.total,
        timestamp: new Date(),
      };

      setSearchLogs(prev => {
        const filtered = prev.filter(log => log.query !== filters.query);
        return [newLog, ...filtered].slice(0, 10); // Manter apenas os 10 mais recentes
      });

    } catch (error) {
      console.error('Search error:', error);
      setResult({
        properties: [],
        total: 0,
        sources: [],
        searchTime: 0,
        errors: ['Erro ao realizar a busca. Tente novamente.']
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResult(null);
  }, []);

  const loadSearchFromLog = useCallback((log: SearchLog) => {
    search(log.filters);
  }, [search]);

  return {
    isLoading,
    result,
    searchLogs,
    search,
    clearResults,
    loadSearchFromLog,
  };
} 