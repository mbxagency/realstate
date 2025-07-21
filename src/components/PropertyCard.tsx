'use client';

import { Property } from '@/types/property';
import Image from 'next/image';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'casa': return '🏠';
      case 'apartamento': return '🏢';
      case 'terreno': return '🌱';
      case 'comercial': return '🏪';
      default: return '🏗️';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'casa': return 'Casa';
      case 'apartamento': return 'Apartamento';
      case 'terreno': return 'Terreno';
      case 'comercial': return 'Comercial';
      default: return 'Outro';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden transform hover:-translate-y-2">
      {/* Imagem */}
      <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {property.imageUrl ? (
          <Image
            src={property.imageUrl}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl text-gray-400">🏠</span>
          </div>
        )}
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold bg-blue-600/90 backdrop-blur-sm text-white shadow-lg">
            {getTypeIcon(property.type)} {getTypeLabel(property.type)}
          </span>
          <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold bg-gray-800/90 backdrop-blur-sm text-white shadow-lg">
            {property.source}
          </span>
        </div>

        {/* Preço */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl">
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(property.price)}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {/* Título */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {property.title}
        </h3>

        {/* Localização */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-gray-400">📍</span>
          <span className="text-sm text-gray-600 font-medium">{property.location}</span>
        </div>

        {/* Características */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            {property.bedrooms && (
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🛏️</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Quartos</div>
                  <div className="font-semibold text-gray-900">{property.bedrooms}</div>
                </div>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-lg">🚿</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Banheiros</div>
                  <div className="font-semibold text-gray-900">{property.bathrooms}</div>
                </div>
              </div>
            )}
            {property.area && (
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <span className="text-purple-600 text-lg">📐</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Área</div>
                  <div className="font-semibold text-gray-900">{property.area}m²</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Descrição */}
        <p className="text-sm text-gray-600 mb-6 line-clamp-2">
          {property.description}
        </p>

        {/* Botão */}
        <a
          href={property.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base font-semibold py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 text-center block group-hover:shadow-lg transform group-hover:scale-105"
        >
          Ver no {property.source}
        </a>
      </div>
    </div>
  );
} 