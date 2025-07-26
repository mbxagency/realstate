import * as cheerio from 'cheerio';
import { BaseScraper } from './base';
import { Property, SearchFilters } from '@/types/property';

export class VivaRealEnhancedScraper extends BaseScraper {
  protected baseUrl = 'https://www.vivareal.com.br';
  protected name = 'VivaReal Enhanced';

  protected buildSearchUrl(query: string, filters: Partial<SearchFilters>): string {
    // Baseado no código Python, vamos usar a estrutura de URL correta
    let url = `${this.baseUrl}/venda/`;
    
    // Adicionar localização se fornecida
    if (filters.location) {
      url += filters.location.toLowerCase().replace(/\s+/g, '-') + '/';
    } else if (query) {
      // Extrair cidade da query (ex: "São Paulo, SP" -> "sao-paulo")
      const city = query.split(',')[0].trim().toLowerCase().replace(/\s+/g, '-');
      url += city + '/';
    }
    
    // Adicionar parâmetros
    const params = new URLSearchParams();
    
    // Tipo de imóvel
    if (filters.type) {
      const typeMapping: Record<string, string> = {
        'casa': 'casa_residencial',
        'apartamento': 'apartamento_residencial',
        'terreno': 'terreno_residencial',
        'comercial': 'comercial'
      };
      params.append('tipos', typeMapping[filters.type] || 'apartamento_residencial');
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
    
    // Área mínima
    if (filters.minArea) {
      params.append('areaMin', filters.minArea.toString());
    }
    
    // Bairros específicos
    if (filters.neighborhoods && filters.neighborhoods.length > 0) {
      params.append('bairros', filters.neighborhoods.join(','));
    }
    
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  protected parseProperties($: cheerio.Root): Property[] {
    const properties: Property[] = [];
    
    // Usar o seletor correto baseado no código Python
    const propertyCards = $('.property-card__main-content');
    
    console.log(`Found ${propertyCards.length} property cards`);
    
    if (propertyCards.length === 0) {
      console.warn('No property cards found. Trying alternative selectors...');
      // Tentar seletores alternativos
      const altCards = $('[data-type="property"], .property-card, .js-property-card');
      if (altCards.length > 0) {
        console.log(`Found ${altCards.length} properties with alternative selectors`);
        return this.parsePropertiesAlternative($, altCards);
      }
      return properties;
    }
    
    propertyCards.each((index, element) => {
      try {
        const $card = $(element);
        const property = this.extractPropertyData($card, index);
        
        if (property && property.title && property.price > 0) {
          properties.push(property);
        }
      } catch (error) {
        console.error(`Error parsing property card ${index}:`, error);
      }
    });
    
    return properties;
  }

  private parsePropertiesAlternative($: cheerio.Root, cards: cheerio.Cheerio): Property[] {
    const properties: Property[] = [];
    
    cards.each((index, element) => {
      try {
        const $card = $(element);
        const property = this.extractPropertyDataAlternative($card, index);
        
        if (property && property.title && property.price > 0) {
          properties.push(property);
        }
      } catch (error) {
        console.error(`Error parsing alternative property card ${index}:`, error);
      }
    });
    
    return properties;
  }

  private extractPropertyData($card: cheerio.Cheerio, index: number): Property | null {
    // Baseado nos seletores do código Python
    
    // Endereço completo
    const addressElement = $card.find('.property-card__address.js-property-card-address.js-see-on-map');
    const fullAddress = addressElement.text().trim();
    
    // Extrair bairro do endereço
    const neighborhood = this.extractNeighborhood(fullAddress);
    
    // Área
    const areaElement = $card.find('.property-card__detail-value.js-property-card-value.property-card__detail-area.js-property-card-detail-area');
    const areaText = areaElement.text().trim();
    const area = this.extractArea(areaText);
    
    // Quartos
    const roomElement = $card.find('.property-card__detail-item.property-card__detail-room.js-property-detail-rooms');
    const roomText = roomElement.text().trim();
    const bedrooms = this.extractNumber(roomText);
    
    // Banheiros
    const bathElement = $card.find('.property-card__detail-item.property-card__detail-bathroom.js-property-detail-bathroom');
    const bathText = bathElement.text().trim();
    const bathrooms = this.extractNumber(bathText);
    
    // Vagas
    const parkElement = $card.find('.property-card__detail-item.property-card__detail-garage.js-property-detail-garages');
    const parkText = parkElement.text().trim();
    const parking = this.extractNumber(parkText);
    
    // Preço
    const priceElement = $card.find('.property-card__price.js-property-card-prices.js-property-card__price-small');
    const priceText = priceElement.text().trim();
    const price = this.extractPrice(priceText);
    
    // Título (usar endereço como título se não houver outro)
    const title = fullAddress || `Imóvel ${index + 1}`;
    
    // Link
    const linkElement = $card.find('a').first();
    const link = linkElement.attr('href');
    const fullLink = link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : '';
    
    // Imagem
    const imageElement = $card.find('img').first();
    const imageUrl = imageElement.attr('src') || imageElement.attr('data-src') || '/placeholder-property.jpg';
    
    // Tipo de imóvel (inferir do título)
    const type = this.inferPropertyType(title);
    
    return {
      id: `vivareal_${Buffer.from(fullLink || title).toString('base64').slice(0, 12)}`,
      title,
      description: title,
      price,
      priceFormatted: priceText || `R$ ${price.toLocaleString('pt-BR')}`,
      location: fullAddress || 'Localização não informada',
      imageUrl,
      originalUrl: fullLink,
      source: 'VivaReal',
      type,
      bedrooms: bedrooms || undefined,
      bathrooms: bathrooms || undefined,
      area: area || undefined,
      createdAt: new Date(),
      neighborhood: neighborhood || undefined,
      parking: parking || undefined
    };
  }

  private extractPropertyDataAlternative($card: cheerio.Cheerio, index: number): Property | null {
    // Método alternativo para quando os seletores principais não funcionam
    
    // Título
    const title = $card.find('h2, h3, .title, [data-type="title"]').first().text().trim() || `Imóvel ${index + 1}`;
    
    // Preço
    const priceText = $card.find('.price, [data-type="price"], .property-card__price').first().text().trim();
    const price = this.extractPrice(priceText);
    
    // Localização
    const location = $card.find('.address, [data-type="address"], .property-card__address').first().text().trim();
    
    // Link
    const link = $card.find('a').first().attr('href');
    const fullLink = link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : '';
    
    // Imagem
    const imageUrl = $card.find('img').first().attr('src') || $card.find('img').first().attr('data-src') || '/placeholder-property.jpg';
    
    // Outros campos
    const areaText = $card.find('.area, [data-type="area"]').first().text().trim();
    const area = this.extractArea(areaText);
    
    const bedroomsText = $card.find('.bedrooms, [data-type="bedrooms"]').first().text().trim();
    const bedrooms = this.extractNumber(bedroomsText);
    
    const bathroomsText = $card.find('.bathrooms, [data-type="bathrooms"]').first().text().trim();
    const bathrooms = this.extractNumber(bathroomsText);
    
    const type = this.inferPropertyType(title);
    const neighborhood = this.extractNeighborhood(location);
    
    return {
      id: `vivareal_${Buffer.from(fullLink || title).toString('base64').slice(0, 12)}`,
      title,
      description: title,
      price,
      priceFormatted: priceText || `R$ ${price.toLocaleString('pt-BR')}`,
      location: location || 'Localização não informada',
      imageUrl,
      originalUrl: fullLink,
      source: 'VivaReal',
      type,
      bedrooms: bedrooms || undefined,
      bathrooms: bathrooms || undefined,
      area: area || undefined,
      createdAt: new Date(),
      neighborhood: neighborhood || undefined
    };
  }

  protected extractPrice(priceText: string): number {
    if (!priceText) return 0;
    
    // Baseado no código Python: remover espaços, quebras de linha, R$, pontos, etc.
    const cleanPrice = priceText
      .replace(/\s+/g, '')
      .replace(/\n/g, '')
      .replace('R$', '')
      .replace(/\./g, '')
      .replace('Apartirde', '')
      .replace('SobConsulta', '0');
    
    // Converter para número
    const price = parseFloat(cleanPrice.replace(',', '.'));
    return isNaN(price) ? 0 : price;
  }

  protected extractArea(areaText: string): number {
    if (!areaText) return 0;
    
    // Remover caracteres não numéricos exceto vírgula e ponto
    const cleanArea = areaText.replace(/[^\d,.]/g, '');
    const area = parseFloat(cleanArea.replace(',', '.'));
    return isNaN(area) ? 0 : area;
  }

  private extractNumber(text: string): number {
    if (!text) return 0;
    
    // Remover espaços, quebras de linha e texto
    const cleanText = text
      .replace(/\s+/g, '')
      .replace(/\n/g, '')
      .replace(/Quartos?/g, '')
      .replace(/Banheiros?/g, '')
      .replace(/Vagas?/g, '');
    
    const match = cleanText.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  private inferPropertyType(title: string): Property['type'] {
    if (!title) return 'outro';
    
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('casa') || lowerTitle.includes('house')) {
      return 'casa';
    } else if (lowerTitle.includes('apartamento') || lowerTitle.includes('apto') || lowerTitle.includes('apartment')) {
      return 'apartamento';
    } else if (lowerTitle.includes('terreno') || lowerTitle.includes('lote') || lowerTitle.includes('lot')) {
      return 'terreno';
    } else if (lowerTitle.includes('comercial') || lowerTitle.includes('loja') || lowerTitle.includes('sala') || lowerTitle.includes('commercial')) {
      return 'comercial';
    }
    
    return 'outro';
  }

  private extractNeighborhood(location: string): string {
    if (!location) return '';
    
    // Baseado no código Python: extrair bairro do endereço
    if (location.startsWith('Rua') || location.startsWith('Avenida') || location.startsWith('Travessa') || location.startsWith('Alameda')) {
      const neighborFirst = location.indexOf('-');
      const neighborSecond = location.indexOf(',', neighborFirst);
      
      if (neighborSecond !== -1) {
        return location.substring(neighborFirst + 2, neighborSecond).trim();
      } else {
        return '-';
      }
    } else {
      const getComma = location.indexOf(',');
      if (getComma !== -1) {
        return location.substring(0, getComma).trim();
      } else {
        const getHif = location.indexOf('-');
        return getHif !== -1 ? location.substring(0, getHif).trim() : '';
      }
    }
  }

  // Método para buscar múltiplas páginas
  async searchMultiplePages(query: string, filters: Partial<SearchFilters> = {}, maxPages: number = 3): Promise<Property[]> {
    const allProperties: Property[] = [];
    
    for (let page = 1; page <= maxPages; page++) {
      try {
        console.log(`Searching page ${page} of ${maxPages}`);
        
        // Adicionar número da página à URL
        const baseUrl = this.buildSearchUrl(query, filters);
        const pageUrl = baseUrl.includes('?') ? `${baseUrl}&pagina=${page}` : `${baseUrl}?pagina=${page}`;
        
        const $ = await this.fetchPage(pageUrl);
        const properties = this.parseProperties($);
        
        if (properties.length === 0) {
          console.log(`No properties found on page ${page}, stopping search`);
          break;
        }
        
        allProperties.push(...properties);
        
        // Aguarda um pouco entre as requisições para não sobrecarregar o servidor
        if (page < maxPages) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`Error searching page ${page}:`, error);
        break;
      }
    }
    
    console.log(`Total properties found: ${allProperties.length}`);
    return allProperties;
  }
} 