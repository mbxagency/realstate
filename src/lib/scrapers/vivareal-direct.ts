import puppeteer from 'puppeteer';
import { Property, SearchFilters } from '@/types/property';

export class VivaRealDirectScraper {
  private name = 'VivaReal (Direct)';
  private baseUrl = 'https://www.vivareal.com.br';

  async search(query: string, filters: Partial<SearchFilters>): Promise<Property[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    try {
      const page = await browser.newPage();
      
      // Configurar viewport e user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      console.log('Navegando para o VivaReal...');
      
      // Usar a URL específica fornecida pelo usuário
      const searchUrl = 'https://www.vivareal.com.br/venda/parana/curitiba/?onde=%2CParan%C3%A1%2CCuritiba%2C%2C%2C%2C%2Ccity%2CBR%3EParana%3ENULL%3ECuritiba%2C-25.437238%2C-49.269973%2C&transacao=venda';
      
      await page.goto(searchUrl, { 
        waitUntil: 'domcontentloaded', 
        timeout: 30000 
      });
      
      // Aguardar a página carregar
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Verificar se estamos na página correta
      const currentUrl = page.url();
      console.log('URL atual:', currentUrl);
      
      // Extrair o HTML da página
      const html = await page.content();
      
      // Extrair os dados dos imóveis usando cheerio
      const properties = await this.parseHTML(html);
      
      console.log(`Encontrados ${properties.length} imóveis no VivaReal`);
      
      return properties;
      
    } catch (error) {
      console.error('Erro no scraper direto do VivaReal:', error);
      return [];
    } finally {
      await browser.close();
    }
  }
  
  private async parseHTML(html: string): Promise<Property[]> {
    const properties: Property[] = [];
    
    // Importar cheerio dinamicamente
    const cheerio = await import('cheerio');
    const $ = cheerio.load(html);
    
    // Seletores baseados no projeto de referência
    const cardSelectors = [
      '[data-type="property"]',
      '.property-card',
      '.card-container',
      '.result-card',
      '.property-item',
      '[class*="property"]',
      '[class*="card"]',
      'article',
      '.item'
    ];
    
    let propertyElements: cheerio.Cheerio[] = [];
    
    for (const selector of cardSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`Encontrados ${elements.length} cards com seletor: ${selector}`);
        propertyElements = elements.toArray().map(el => $(el));
        break;
      }
    }
    
    if (propertyElements.length === 0) {
      console.log('Nenhum card de imóvel encontrado');
      return properties;
    }
    
    // Limitar a 10 imóveis para teste
    const elementsToProcess = propertyElements.slice(0, 10);
    
    for (const $card of elementsToProcess) {
      try {
        // Extrair dados do card
        const title = this.extractText($card, [
          '[data-type="card-title"]',
          '.property-card__title',
          'h2',
          'h3',
          '.title',
          '[class*="title"]'
        ]);
        
        const priceText = this.extractText($card, [
          '[data-type="price"]',
          '.property-card__price',
          '.price',
          '[class*="price"]',
          '[class*="value"]'
        ]);
        
        const price = this.extractPrice(priceText);
        
        const imageUrl = $card.find('img').attr('src') || 
                        $card.find('img').attr('data-src') ||
                        $card.find('img').attr('data-lazy-src');
        
        const link = $card.find('a').attr('href');
        const fullLink = link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : '';
        
        const location = this.extractText($card, [
          '[data-type="address"]',
          '.property-card__address',
          '.address',
          '[class*="address"]'
        ]);
        
        const areaText = this.extractText($card, [
          '[data-type="area"]',
          '.property-card__area',
          '.area',
          '[class*="area"]'
        ]);
        
        const area = this.extractArea(areaText);
        
        const bedroomsText = this.extractText($card, [
          '[data-type="bedrooms"]',
          '.property-card__bedrooms',
          '.bedrooms',
          '[class*="bedroom"]'
        ]);
        
        const bedrooms = parseInt(bedroomsText.match(/\d+/)?.[0] || '0');
        
        const bathroomsText = this.extractText($card, [
          '[data-type="bathrooms"]',
          '.property-card__bathrooms',
          '.bathrooms',
          '[class*="bathroom"]'
        ]);
        
        const bathrooms = parseInt(bathroomsText.match(/\d+/)?.[0] || '0');
        
        // Determinar tipo de imóvel
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
        console.error('Erro ao processar card:', error);
      }
    }
    
    return properties;
  }
  
  private extractText($element: cheerio.Cheerio, selectors: string[]): string {
    for (const selector of selectors) {
      const text = $element.find(selector).text().trim();
      if (text) return text;
    }
    return '';
  }
  
  private extractPrice(priceText: string): number {
    if (!priceText) return 0;
    const match = priceText.match(/R?\$?\s*([\d.,]+)/);
    if (match) {
      return parseInt(match[1].replace(/[.,]/g, ''));
    }
    return 0;
  }
  
  private extractArea(areaText: string): number | undefined {
    if (!areaText) return undefined;
    const match = areaText.match(/(\d+)\s*m²/);
    if (match) {
      return parseInt(match[1]);
    }
    return undefined;
  }
} 