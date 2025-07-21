'use client';

import { SearchResult } from '@/types/property';
import PropertyCard from './PropertyCard';

interface SearchResultsProps {
  result: SearchResult | null;
  isLoading: boolean;
}

export default function SearchResults({ result, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-6">
            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Buscando imóveis...
          </h3>
          <p className="text-gray-600">
            Consultando todos os portais imobiliários
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full mb-6">
            <span className="text-2xl">🏠</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Faça sua primeira busca
          </h3>
          <p className="text-gray-600">
            Digite o que você procura e encontre seu imóvel ideal
          </p>
        </div>
      </div>
    );
  }

  if (result.properties.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Nenhum imóvel encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            Tente ajustar os filtros ou usar termos diferentes
          </p>
          {result.errors && result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-md mx-auto">
              <p className="text-sm text-red-600">
                Alguns portais não responderam. Tente novamente em alguns instantes.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
      {/* Estatísticas da busca */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {result.total} imóveis encontrados
            </h2>
            <p className="text-gray-600">
              Busca realizada em {result.sources.length} portal{result.sources.length !== 1 ? 'is' : ''} em {(result.searchTime / 1000).toFixed(1)}s
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-medium">
              {result.sources.length} portal{result.sources.length !== 1 ? 'is' : ''} ativo{result.sources.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Portais utilizados */}
        {result.sources.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {result.sources.map((source) => (
              <span
                key={source}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {source}
              </span>
            ))}
          </div>
        )}

        {/* Erros se houver */}
        {result.errors && result.errors.length > 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-sm font-medium text-yellow-800">
                Alguns portais não responderam
              </span>
            </div>
            <p className="text-sm text-yellow-700">
              {result.errors.length} portal{result.errors.length !== 1 ? 'is' : ''} apresentou erro. Os resultados podem estar incompletos.
            </p>
          </div>
        )}
      </div>

      {/* Lista de imóveis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {result.properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Paginação (placeholder) */}
      {result.total > result.properties.length && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página 1 de {Math.ceil(result.total / result.properties.length)}
            </span>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 