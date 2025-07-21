'use client';

import { SearchLog } from '@/types/property';

interface SearchLogsProps {
  logs: SearchLog[];
  onLogClick: (log: SearchLog) => void;
}

export default function SearchLogs({ logs, onLogClick }: SearchLogsProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">📋</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Histórico de Buscas
          </h3>
        </div>
        
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-gray-400">🔍</span>
          </div>
          <p className="text-sm text-gray-500">
            Nenhuma busca realizada ainda
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold">📋</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          Histórico de Buscas
        </h3>
      </div>
      
      <div className="space-y-3">
        {logs.slice(0, 5).map((log) => (
          <button
            key={log.id}
            onClick={() => onLogClick(log)}
            className="w-full text-left p-4 bg-white/50 rounded-xl border border-white/30 hover:bg-white/80 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {log.query}
              </h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {log.resultsCount} resultado{log.resultsCount !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                {log.filters.type && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    {log.filters.type}
                  </span>
                )}
                {log.filters.bedrooms && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700">
                    {log.filters.bedrooms} quarto{log.filters.bedrooms !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <span>
                {new Date(log.timestamp).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </button>
        ))}
      </div>
      
      {logs.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Mostrando 5 de {logs.length} buscas recentes
          </p>
        </div>
      )}
    </div>
  );
} 