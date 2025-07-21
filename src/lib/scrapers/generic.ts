import * as cheerio from 'cheerio';
import { BaseScraper } from './base';
import { Property, SearchFilters } from '@/types/property';

export class GenericScraper extends BaseScraper {
  protected baseUrl: string;
  protected name: string;

  constructor(baseUrl: string, name: string) {
    super();
    this.baseUrl = baseUrl;
    this.name = name;
  }

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
    
    // Tentar diferentes seletores comuns para cards de imóveis
    const selectors = [
      '.property-card',
      '.card',
      '.item',
      '.listing',
      '.property',
      '[data-type="property"]',
      '.result-item',
      '.search-result',
      '.ad-item',
      '.product-card'
    ];
    
    let propertyElements: cheerio.Cheerio | null = null;
    
    // Tentar cada seletor até encontrar elementos
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        propertyElements = elements;
        console.log(`Found ${elements.length} properties using selector: ${selector}`);
        break;
      }
    }
    
    // Se não encontrou com seletores específicos, tentar seletores mais genéricos
    if (!propertyElements || propertyElements.length === 0) {
      const genericSelectors = [
        'article',
        '.card',
        '.item',
        'div[class*="card"]',
        'div[class*="item"]',
        'div[class*="property"]',
        'div[class*="listing"]'
      ];
      
      for (const selector of genericSelectors) {
        const elements = $(selector);
        if (elements.length > 5) { // Pelo menos 5 elementos para considerar válido
          propertyElements = elements;
          console.log(`Found ${elements.length} potential properties using generic selector: ${selector}`);
          break;
        }
      }
    }
    
    if (!propertyElements || propertyElements.length === 0) {
      console.log(`No property elements found for ${this.name}`);
      return properties;
    }
    
    propertyElements.each((_, element) => {
      try {
        const $el = $(element);
        
        // Tentar diferentes seletores para título
        const title = this.extractText($el, [
          '.title', '.name', '.card-title', 'h2', 'h3', 'h4',
          '[class*="title"]', '[class*="name"]'
        ]);
        
        // Tentar diferentes seletores para preço
        const priceText = this.extractText($el, [
          '.price', '.value', '.cost', '[class*="price"]',
          '[class*="value"]', '[class*="cost"]'
        ]);
        const price = this.extractPrice(priceText);
        
        // Tentar diferentes seletores para imagem
        const imageUrl = this.extractImage($el);
        
        // Tentar diferentes seletores para link
        const link = $el.find('a').attr('href');
        const fullLink = link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : '';
        
        // Tentar diferentes seletores para localização
        const location = this.extractText($el, [
          '.location', '.address', '.neighborhood', '[class*="location"]',
          '[class*="address"]', '[class*="neighborhood"]'
        ]);
        
        // Tentar diferentes seletores para área
        const areaText = this.extractText($el, [
          '.area', '.size', '[class*="area"]', '[class*="size"]'
        ]);
        const area = this.extractArea(areaText);
        
        // Tentar diferentes seletores para quartos
        const bedroomsText = this.extractText($el, [
          '.bedrooms', '.rooms', '[class*="bedroom"]', '[class*="room"]'
        ]);
        const bedrooms = parseInt(bedroomsText.match(/\d+/)?.[0] || '0');
        
        // Tentar diferentes seletores para banheiros
        const bathroomsText = this.extractText($el, [
          '.bathrooms', '.baths', '[class*="bathroom"]', '[class*="bath"]'
        ]);
        const bathrooms = parseInt(bathroomsText.match(/\d+/)?.[0] || '0');
        
        // Detectar tipo de imóvel
        let type: Property['type'] = 'outro';
        const typeText = (title + ' ' + location).toLowerCase();
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
            id: `${this.name.toLowerCase()}_${Buffer.from(fullLink).toString('base64').slice(0, 12)}`,
            title,
            description: title,
            price,
            priceFormatted: priceText || `R$ ${price.toLocaleString('pt-BR')}`,
            location: location || 'Localização não informada',
            imageUrl: imageUrl || '/placeholder-property.jpg',
            originalUrl: fullLink,
            source: this.name,
            type,
            bedrooms: bedrooms || undefined,
            bathrooms: bathrooms || undefined,
            area: area || undefined,
            createdAt: new Date()
          });
        }
      } catch (error) {
        console.error(`Error parsing ${this.name} property card:`, error);
      }
    });
    
    return properties;
  }
  
  private extractText($el: cheerio.Cheerio, selectors: string[]): string {
    for (const selector of selectors) {
      const text = $el.find(selector).text().trim();
      if (text) return text;
    }
    return '';
  }
  
  private extractImage($el: cheerio.Cheerio): string {
    const imgSelectors = [
      'img[src]',
      'img[data-src]',
      'img[data-lazy]',
      '[class*="image"] img',
      '[class*="photo"] img'
    ];
    
    for (const selector of imgSelectors) {
      const img = $el.find(selector);
      const src = img.attr('src') || img.attr('data-src') || img.attr('data-lazy');
      if (src) return src;
    }
    
    return '';
  }
} 