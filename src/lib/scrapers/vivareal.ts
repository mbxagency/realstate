import * as cheerio from 'cheerio';
import { BaseScraper } from './base';
import { Property, SearchFilters } from '@/types/property';

export class VivaRealScraper extends BaseScraper {
  protected baseUrl = 'https://www.vivareal.com.br';
  protected name = 'VivaReal';

  protected buildSearchUrl(query: string, filters: Partial<SearchFilters>): string {
    const params = new URLSearchParams();
    
    // Query principal
    params.append('q', query);
    
    // Tipo de imóvel
    if (filters.type) {
      params.append('tipo', filters.type);
    }
    
    // Preço
    if (filters.minPrice) {
      params.append('precoMin', filters.minPrice.toString());
    }
    if (filters.maxPrice) {
      params.append('precoMax', filters.maxPrice.toString());
    }
    
    // Localização
    if (filters.location) {
      params.append('localizacao', filters.location);
    }
    
    return `${this.baseUrl}/venda/?${params.toString()}`;
  }

  protected parseProperties($: cheerio.Root): Property[] {
    const properties: Property[] = [];
    
    // Seletor para cards de imóveis no VivaReal
    const propertyCards = $('[data-type="property"]');
    
    propertyCards.each((_, element) => {
      try {
        const $card = $(element);
        
        // Título/descrição
        const title = $card.find('[data-type="card-title"]').text().trim() || 
                     $card.find('.property-card__title').text().trim() ||
                     $card.find('h2, h3').first().text().trim();
        
        // Preço
        const priceText = $card.find('[data-type="price"]').text().trim() ||
                         $card.find('.property-card__price').text().trim() ||
                         $card.find('.price').text().trim();
        const price = this.extractPrice(priceText);
        
        // Imagem
        const imageUrl = $card.find('img').attr('src') || 
                        $card.find('img').attr('data-src') ||
                        $card.find('[data-type="image"] img').attr('src');
        
        // Link
        const link = $card.find('a').attr('href');
        const fullLink = link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : '';
        
        // Localização
        const location = $card.find('[data-type="address"]').text().trim() ||
                        $card.find('.property-card__address').text().trim() ||
                        $card.find('.address').text().trim();
        
        // Área
        const areaText = $card.find('[data-type="area"]').text().trim() ||
                        $card.find('.property-card__area').text().trim();
        const area = this.extractArea(areaText);
        
        // Quartos
        const bedroomsText = $card.find('[data-type="bedrooms"]').text().trim() ||
                            $card.find('.property-card__bedrooms').text().trim();
        const bedrooms = parseInt(bedroomsText.match(/\d+/)?.[0] || '0');
        
        // Banheiros
        const bathroomsText = $card.find('[data-type="bathrooms"]').text().trim() ||
                             $card.find('.property-card__bathrooms').text().trim();
        const bathrooms = parseInt(bathroomsText.match(/\d+/)?.[0] || '0');
        
        // Tipo de imóvel
        let type: Property['type'] = 'outro';
        const typeText = title.toLowerCase();
        if (typeText.includes('casa') || typeText.includes('house')) {
          type = 'casa';
        } else if (typeText.includes('apartamento') || typeText.includes('apto') || typeText.includes('apartment')) {
          type = 'apartamento';
        } else if (typeText.includes('terreno') || typeText.includes('lote')) {
          type = 'terreno';
        } else if (typeText.includes('comercial') || typeText.includes('loja') || typeText.includes('sala')) {
          type = 'comercial';
        }
        
        if (title && price > 0) {
          properties.push({
            id: `vivareal_${Buffer.from(fullLink).toString('base64').slice(0, 12)}`,
            title,
            description: title,
            price,
            priceFormatted: priceText || `R$ ${price.toLocaleString('pt-BR')}`,
            location: location || 'Localização não informada',
            imageUrl: imageUrl || '/placeholder-property.jpg',
            originalUrl: fullLink,
            source: 'VivaReal',
            type,
            bedrooms: bedrooms || undefined,
            bathrooms: bathrooms || undefined,
            area: area || undefined,
            createdAt: new Date()
          });
        }
      } catch (error) {
        console.error('Error parsing VivaReal property card:', error);
      }
    });
    
    return properties;
  }
} 