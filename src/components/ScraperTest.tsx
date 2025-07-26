'use client';

import { useState } from 'react';
import { ScraperManager } from '@/lib/scrapers';
import { Property, SearchFilters } from '@/types/property';
import PropertyCard from './PropertyCard';

export default function ScraperTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('São Paulo, SP');
  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    type: 'apartamento',
    minPrice: 200000,
    maxPrice: 800000,
    bedrooms: 2
  });

  const scraperManager = new ScraperManager();

  const handleSearch = async () => {
    setIsLoading(true);
    setError('');
    setProperties([]);

    try {
      const result = await scraperManager.searchAll(searchQuery, {
        query: searchQuery,
        ...filters
      });

      setProperties(result.properties);
      
      if (result.errors && result.errors.length > 0) {
        setError(`Erros encontrados: ${result.errors.join(', ')}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Teste do Scraper Real - VivaReal</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Configurações */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: São Paulo, SP"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Imóvel
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as Property['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="terreno">Terreno</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço Mín
                </label>
                <input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="200000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço Máx
                </label>
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="800000"
                />
              </div>
            </div>
          </div>

          {/* Botão de busca */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Buscando...' : 'Buscar Imóveis Reais'}
            </button>
          </div>
        </div>

        {/* Status */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Buscando imóveis reais no VivaReal...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {properties.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <p className="text-green-800">
              ✅ Encontrados {properties.length} imóveis reais do VivaReal
            </p>
          </div>
        )}
      </div>

      {/* Resultados */}
      {properties.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Imóveis Reais Encontrados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      )}

      {/* Informações sobre o scraper */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Sobre o Scraper Real</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>✅ <strong>Dados reais:</strong> Extraindo informações diretamente do VivaReal</p>
          <p>✅ <strong>Múltiplos seletores:</strong> Tenta diferentes seletores CSS para maior compatibilidade</p>
          <p>✅ <strong>Extração robusta:</strong> Extrai título, preço, localização, área, quartos, banheiros, vagas</p>
          <p>✅ <strong>Informações adicionais:</strong> Bairro, anunciante, tipo de imóvel</p>
          <p>✅ <strong>Tratamento de erros:</strong> Continua funcionando mesmo se alguns elementos não forem encontrados</p>
          <p>✅ <strong>Headers realistas:</strong> Simula navegador real para evitar bloqueios</p>
        </div>
      </div>
    </div>
  );
} 