import { BaseScraper } from './base';
import { Property, SearchFilters } from '@/types/property';

export class MockScraper extends BaseScraper {
  protected baseUrl = 'https://mock.example.com';
  protected name = 'Mock Data';

  protected buildSearchUrl(query: string, filters: Partial<SearchFilters>): string {
    return `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;
  }

  protected parseProperties($: cheerio.Root): Property[] {
    // Simular delay para parecer real
    return this.generateMockProperties();
  }

  private generateMockProperties(): Property[] {
    const mockProperties: Property[] = [
      {
        id: 'mock_1',
        title: 'Casa em Curitiba - Atuba',
        description: 'Linda casa com 3 quartos, 2 banheiros, garagem para 2 carros. Localizada em bairro tranquilo com fácil acesso ao centro.',
        price: 850000,
        priceFormatted: 'R$ 850.000',
        location: 'Atuba, Curitiba - PR',
        imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
        originalUrl: 'https://example.com/property1',
        source: 'Mock Data',
        type: 'casa',
        bedrooms: 3,
        bathrooms: 2,
        area: 180,
        createdAt: new Date()
      },
      {
        id: 'mock_2',
        title: 'Apartamento no Bacacheri',
        description: 'Apartamento moderno com 2 quartos, sala ampla, cozinha americana. Prédio com portaria 24h e academia.',
        price: 420000,
        priceFormatted: 'R$ 420.000',
        location: 'Bacacheri, Curitiba - PR',
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
        originalUrl: 'https://example.com/property2',
        source: 'Mock Data',
        type: 'apartamento',
        bedrooms: 2,
        bathrooms: 1,
        area: 75,
        createdAt: new Date()
      },
      {
        id: 'mock_3',
        title: 'Casa em Boa Vista',
        description: 'Casa espaçosa com 4 quartos, 3 banheiros, quintal grande. Ideal para família. Localização privilegiada.',
        price: 1200000,
        priceFormatted: 'R$ 1.200.000',
        location: 'Boa Vista, Curitiba - PR',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
        originalUrl: 'https://example.com/property3',
        source: 'Mock Data',
        type: 'casa',
        bedrooms: 4,
        bathrooms: 3,
        area: 250,
        createdAt: new Date()
      },
      {
        id: 'mock_4',
        title: 'Apartamento no Jardim Social',
        description: 'Apartamento de luxo com 3 quartos, 2 banheiros, varanda gourmet. Vista para o parque.',
        price: 680000,
        priceFormatted: 'R$ 680.000',
        location: 'Jardim Social, Curitiba - PR',
        imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
        originalUrl: 'https://example.com/property4',
        source: 'Mock Data',
        type: 'apartamento',
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        createdAt: new Date()
      },
      {
        id: 'mock_5',
        title: 'Casa em Juvevê',
        description: 'Casa charmosa com 3 quartos, 2 banheiros, jardim. Bairro tradicional de Curitiba.',
        price: 750000,
        priceFormatted: 'R$ 750.000',
        location: 'Juvevê, Curitiba - PR',
        imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop',
        originalUrl: 'https://example.com/property5',
        source: 'Mock Data',
        type: 'casa',
        bedrooms: 3,
        bathrooms: 2,
        area: 160,
        createdAt: new Date()
      }
    ];

    // Filtrar baseado nos filtros aplicados
    return mockProperties.filter(property => {
      // Filtrar por tipo se especificado
      if (this.currentFilters?.type && property.type !== this.currentFilters.type) {
        return false;
      }
      
      // Filtrar por preço
      if (this.currentFilters?.minPrice && property.price < this.currentFilters.minPrice) {
        return false;
      }
      if (this.currentFilters?.maxPrice && property.price > this.currentFilters.maxPrice) {
        return false;
      }
      
      // Filtrar por quartos
      if (this.currentFilters?.bedrooms && property.bedrooms && property.bedrooms < this.currentFilters.bedrooms) {
        return false;
      }
      
      // Filtrar por área mínima
      if (this.currentFilters?.minArea && property.area && property.area < this.currentFilters.minArea) {
        return false;
      }
      
      return true;
    });
  }

  private currentFilters: Partial<SearchFilters> | null = null;

  async search(query: string, filters: Partial<SearchFilters> = {}): Promise<Property[]> {
    this.currentFilters = filters;
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return this.generateMockProperties();
  }
} 