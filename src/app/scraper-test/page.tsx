import ScraperTest from '@/components/ScraperTest';

export default function ScraperTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">🔧</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Scraper Test
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  Teste do scraper melhorado baseado no VivaRealWebScraping
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Scraper Ativo</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <ScraperTest />
      </main>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Scraper Melhorado - VivaReal
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Baseado no projeto <a 
                href="https://github.com/luiseduardobr1/VivaRealWebScraping" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                VivaRealWebScraping
              </a> do GitHub
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              <span>✅ Múltiplos seletores</span>
              <span>✅ Extração robusta</span>
              <span>✅ Tratamento de erros</span>
              <span>✅ Headers realistas</span>
              <span>✅ Busca múltiplas páginas</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 