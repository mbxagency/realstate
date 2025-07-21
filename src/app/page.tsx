'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import SearchResults from '@/components/SearchResults';
import SearchLogs from '@/components/SearchLogs';
import { SearchFilters, SearchResult, SearchLog } from '@/types/property';

export default function Home() {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);

  const search = async (filters: SearchFilters) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.query) params.append('q', filters.query);
      if (filters.type) params.append('type', filters.type);
      if (filters.bedrooms) params.append('bedrooms', filters.bedrooms.toString());
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.minArea) params.append('minArea', filters.minArea.toString());

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();
      setResult(data);

      // Adicionar ao histórico
      const newLog: SearchLog = {
        id: Date.now().toString(),
        query: filters.query,
        filters,
        timestamp: new Date(),
        resultsCount: data.properties?.length || 0
      };
      setSearchLogs(prev => [newLog, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Erro na busca:', error);
      setResult({ properties: [], total: 0, sources: [], searchTime: 0, errors: ['Erro na busca'] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">MBX</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  MBX Imobiliária
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  O Google dos imóveis - Foco em Curitiba
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">8 portais ativos</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Encontre seu <span className="text-yellow-300">Imóvel Ideal</span>
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Busque em todos os principais portais imobiliários do Brasil com uma única pesquisa. 
              Resultados em tempo real de VivaReal, Zap Imóveis, Imovelweb e muito mais.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-200">
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>VivaReal</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Zap Imóveis</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Imovelweb</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>+5 portais</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Status dos Portais */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">🔗</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Portais Conectados
                </h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { name: 'Zap Imóveis', status: 'online', color: 'green' },
                  { name: 'VivaReal', status: 'online', color: 'green' },
                  { name: 'Imovelweb', status: 'online', color: 'green' },
                  { name: 'OLX Imóveis', status: 'online', color: 'green' },
                  { name: 'Chaves na Mão', status: 'online', color: 'green' },
                  { name: 'WebCasas', status: 'online', color: 'green' },
                  { name: 'Mercado Livre', status: 'online', color: 'green' },
                  { name: 'JBA Imóveis', status: 'online', color: 'green' }
                ].map((portal) => (
                  <div key={portal.name} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/30 hover:bg-white/80 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 bg-${portal.color}-500 rounded-full animate-pulse`}></div>
                      <span className="font-medium text-gray-800">{portal.name}</span>
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      Ativo
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">📊</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Estatísticas
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">8</div>
                  <div className="text-sm text-gray-600">Portais Ativos</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">∞</div>
                  <div className="text-sm text-gray-600">Imóveis Disponíveis</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">&lt;5s</div>
                  <div className="text-sm text-gray-600">Tempo de Busca</div>
                </div>
              </div>
            </div>

            {/* Buscas Recentes */}
            <SearchLogs logs={searchLogs} onLogClick={(log) => search(log.filters)} />
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3">
            {/* Search Form */}
            <SearchForm onSearch={search} isLoading={isLoading} />
            
            {/* Search Results */}
            <SearchResults result={result} isLoading={isLoading} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">🏠</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">MBX Imobiliária</h3>
              </div>
              <p className="text-gray-600">
                O Google dos imóveis - Encontre seu imóvel ideal em todos os principais portais do Brasil com uma única busca.
              </p>
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-4">Portais Suportados</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>VivaReal • Zap Imóveis</div>
                <div>Imovelweb • OLX Imóveis</div>
                <div>Chaves na Mão • WebCasas</div>
                <div>Mercado Livre • JBA Imóveis</div>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <h4 className="font-semibold text-gray-900 mb-4">Tecnologias</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Next.js 14 • TypeScript</div>
                <div>TailwindCSS • Puppeteer</div>
                <div>Web Scraping • API Routes</div>
                <div>Real-time Search</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              © 2024 MBX Imobiliária. Desenvolvido com ❤️ para facilitar sua busca por imóveis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
