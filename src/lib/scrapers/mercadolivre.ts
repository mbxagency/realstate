import * as cheerio from 'cheerio';
import { BaseScraper } from './base';
import { Property, SearchFilters } from '@/types/property';

export class MercadoLivreScraper extends BaseScraper {
  protected baseUrl = 'https://imoveis.mercadolivre.com.br';
  protected name = 'Mercado Livre Imóveis';

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
    
    return `${this.baseUrl}/busca/?${params.toString()}`;
  }

  protected parseProperties($: cheerio.Root): Property[] {
    const properties: Property[] = [];
    
    // Seletor específico do Mercado Livre
    const propertyCards = $('.ui-search-result__content');
    
    if (propertyCards.length === 0) {
      console.log(`No property elements found for ${this.name}`);
      return properties;
    }
    
    console.log(`Found ${propertyCards.length} properties on Mercado Livre`);
    
    propertyCards.each((_, element) => {
      try {
        const $card = $(element);
        
        // Título
        const title = $card.find('.ui-search-item__title').text().trim() ||
                     $card.find('h2').text().trim();
        
        // Preço
        const priceText = $card.find('.andes-money-amount__fraction').text().trim() ||
                         $card.find('.price-tag-fraction').text().trim();
        const price = this.extractPrice(priceText);
        
        // Imagem
        const imageUrl = $card.find('img').attr('src') || 
                        $card.find('img').attr('data-src');
        
        // Link
        const link = $card.find('a').attr('href');
        const fullLink = link || '';
        
        // Localização
        const location = $card.find('.ui-search-item__location').text().trim() ||
                        $card.find('.ui-search-item__group__element').text().trim();
        
        // Área
        const areaText = $card.find('.ui-search-item__group__element').text().trim();
        const area = this.extractArea(areaText);
        
        // Quartos
        const bedroomsText = $card.find('.ui-search-item__group__element').text().trim();
        const bedrooms = parseInt(bedroomsText.match(/(\d+)\s*quarto/)?.[1] || '0');
        
        // Banheiros
        const bathroomsText = $card.find('.ui-search-item__group__element').text().trim();
        const bathrooms = parseInt(bathroomsText.match(/(\d+)\s*banheiro/)?.[1] || '0');
        
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
            id: `mercadolivre_${Buffer.from(fullLink).toString('base64').slice(0, 12)}`,
            title,
            description: title,
            price,
            priceFormatted: priceText ? `R$ ${priceText}` : `R$ ${price.toLocaleString('pt-BR')}`,
            location: location || 'Localização não informada',
            imageUrl: imageUrl || '/placeholder-property.jpg',
            originalUrl: fullLink,
            source: 'Mercado Livre Imóveis',
            type,
            bedrooms: bedrooms || undefined,
            bathrooms: bathrooms || undefined,
            area: area || undefined,
            createdAt: new Date()
          });
        }
      } catch (error) {
        console.error('Error parsing Mercado Livre property card:', error);
      }
    });
    
    return properties;
  }
} 