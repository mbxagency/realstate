'use client';

import { useState, useEffect } from 'react';
import { SearchFilters } from '@/types/property';

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading: boolean;
}

const PROPERTY_TYPES = [
  { value: '', label: 'Todos os tipos' },
  { value: 'casa', label: '🏠 Casa' },
  { value: 'apartamento', label: '🏢 Apartamento' },
  { value: 'terreno', label: '🌱 Terreno' },
  { value: 'comercial', label: '🏪 Comercial' }
];

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    bedrooms: undefined,
    location: '',
    minArea: undefined
  });

  const [cities, setCities] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);

  // Carregar cidades
  useEffect(() => {
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const response = await fetch('/api/cities');
        const data = await response.json();
        setCities(data.cities || []);
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
  }, []);

  // Carregar bairros quando cidade mudar
  useEffect(() => {
    const loadNeighborhoods = async () => {
      if (!filters.location) {
        setNeighborhoods([]);
        return;
      }
      
      setLoadingNeighborhoods(true);
      try {
        const response = await fetch(`/api/neighborhoods?city=${encodeURIComponent(filters.location)}`);
        const data = await response.json();
        setNeighborhoods(data.neighborhoods || []);
      } catch (error) {
        console.error('Erro ao carregar bairros:', error);
      } finally {
        setLoadingNeighborhoods(false);
      }
    };
    loadNeighborhoods();
  }, [filters.location]);

  const handleInputChange = (field: keyof SearchFilters, value: string | number | undefined | string[]) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectAllNeighborhoods = () => {
    // Se não há bairros selecionados, selecionar todos
    if (!filters.neighborhoods || filters.neighborhoods.length === 0) {
      handleInputChange('neighborhoods', neighborhoods);
    } else {
      // Se todos estão selecionados, desmarcar todos
      handleInputChange('neighborhoods', []);
    }
  };

  const handleSubmit = (_e: React.FormEvent) => {
    _e.preventDefault();
    
    // Se não há cidade selecionada, usar a query como busca geral
    if (!filters.location) {
      onSearch({
        ...filters,
        query: filters.query || 'imóveis'
      });
    } else {
      // Se há cidade, buscar por bairros específicos ou todos os bairros da cidade
      const searchQuery = filters.neighborhoods && filters.neighborhoods.length > 0
        ? `imóveis (${filters.neighborhoods.join(' OR ')})`
        : `imóveis (${filters.location})`;
      
      onSearch({
        ...filters,
        query: searchQuery
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
          Encontre seu Imóvel Ideal
        </h2>
        <p className="text-gray-600 text-lg">
          Busque em todos os principais portais imobiliários do Brasil
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Filtros em grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tipo de imóvel */}
          <div>
            <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-3">
              🏘️ Tipo
            </label>
            <select
              id="type"
              value={filters.type || ''}
              onChange={(e) => handleInputChange('type', e.target.value || undefined)}
              className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white cursor-pointer"
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cidade */}
          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-3">
              🏙️ Cidade
            </label>
            <select
              id="city"
              value={filters.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value || '')}
              disabled={loadingCities}
              className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white cursor-pointer disabled:opacity-50"
            >
              <option value="">Selecione uma cidade</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {loadingCities && (
              <div className="mt-2 text-sm text-gray-500">Carregando cidades...</div>
            )}
          </div>

          {/* Quartos */}
          <div>
            <label htmlFor="bedrooms" className="block text-sm font-semibold text-gray-700 mb-3">
              🛏️ Quartos
            </label>
            <select
              id="bedrooms"
              value={filters.bedrooms || ''}
              onChange={(e) => handleInputChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white cursor-pointer"
            >
              <option value="">Qualquer</option>
              <option value="1">1+ quarto</option>
              <option value="2">2+ quartos</option>
              <option value="3">3+ quartos</option>
              <option value="4">4+ quartos</option>
              <option value="5">5+ quartos</option>
            </select>
          </div>

          {/* Metragem Mínima */}
          <div>
            <label htmlFor="minArea" className="block text-sm font-semibold text-gray-700 mb-3">
              📐 Área Mínima
            </label>
            <input
              type="number"
              id="minArea"
              placeholder="m²"
              value={filters.minArea || ''}
              onChange={(e) => handleInputChange('minArea', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
            />
          </div>
        </div>

        {/* Preços */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="minPrice" className="block text-sm font-semibold text-gray-700 mb-3">
              💰 Preço Mínimo
            </label>
            <input
              type="number"
              id="minPrice"
              placeholder="R$ 0"
              value={filters.minPrice || ''}
              onChange={(e) => handleInputChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
            />
          </div>
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-semibold text-gray-700 mb-3">
              💰 Preço Máximo
            </label>
            <input
              type="number"
              id="maxPrice"
              placeholder="R$ 1.000.000"
              value={filters.maxPrice || ''}
              onChange={(e) => handleInputChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-4 py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
            />
          </div>
        </div>

        {/* Bairros */}
        {filters.location && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                🏘️ Bairros
              </label>
              <button
                type="button"
                onClick={handleSelectAllNeighborhoods}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {(!filters.neighborhoods || filters.neighborhoods.length === 0) ? 'Selecionar todos' : 'Desmarcar todos'}
              </button>
            </div>
            
            {loadingNeighborhoods ? (
              <div className="text-sm text-gray-500">Carregando bairros...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {neighborhoods.map((neighborhood) => (
                  <label key={neighborhood} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.neighborhoods?.includes(neighborhood) || false}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const current = filters.neighborhoods || [];
                        if (e.target.checked) {
                          handleInputChange('neighborhoods', [...current, neighborhood]);
                        } else {
                          handleInputChange('neighborhoods', current.filter(n => n !== neighborhood));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{neighborhood}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Botão de busca */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Buscando...
              </>
            ) : (
              <>
                🔍 Buscar Imóveis
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 