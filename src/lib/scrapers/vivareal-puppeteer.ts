import * as cheerio from 'cheerio';
import { PuppeteerScraper } from './puppeteer-base';
import { Property, SearchFilters } from '@/types/property';

export class VivaRealPuppeteerScraper extends PuppeteerScraper {
  protected baseUrl = 'https://www.vivareal.com.br';
  protected name = 'VivaReal (Puppeteer)';

  protected buildSearchUrl(query: string, filters: Partial<SearchFilters>): string {
    // URL base do VivaReal para Curitiba
    let url = 'https://www.vivareal.com.br/venda/parana/curitiba/?onde=%2CParan%C3%A1%2CCuritiba%2C%2C%2C%2C%2Ccity%2CBR%3EParana%3ENULL%3ECuritiba%2C-25.437238%2C-49.269973%2C&transacao=venda';
    
    // Adicionar filtros se especificados
    const params = new URLSearchParams();
    
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
    
    // Quartos
    if (filters.bedrooms) {
      params.append('quartos', filters.bedrooms.toString());
    }
    
    // Se há parâmetros, adicionar à URL
    if (params.toString()) {
      url += `&${params.toString()}`;
    }
    
    return url;
  }

  protected parseProperties(html: string): Property[] {
    const properties: Property[] = [];
    const $ = cheerio.load(html);
    
    // Seletor para cards de imóveis no VivaReal
    const propertyCards = $('[data-type="property"]');
    
    if (propertyCards.length === 0) {
      // Tentar outros seletores comuns do VivaReal
      const alternativeSelectors = [
        '.property-card',
        '.card-container',
        '.result-card',
        '.property-item',
        '[class*="property"]',
        '[class*="card"]'
      ];
      
      for (const selector of alternativeSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} properties using selector: ${selector}`);
          elements.each((_, element) => this.parsePropertyCard($(element), properties));
          break;
        }
      }
      
      if (properties.length === 0) {
        console.log(`No property elements found for ${this.name}`);
      }
    } else {
      console.log(`Found ${propertyCards.length} properties on VivaReal`);
      propertyCards.each((_, element) => this.parsePropertyCard($(element), properties));
    }
    
    return properties;
  }
  
  private parsePropertyCard($card: cheerio.Cheerio, properties: Property[]): void {
    try {
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
          location: location || 'Curitiba, PR',
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
  }
} 