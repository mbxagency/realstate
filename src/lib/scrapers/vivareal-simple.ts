import puppeteer from 'puppeteer';
import { Property, SearchFilters } from '@/types/property';

export class VivaRealSimpleScraper {
  private name = 'VivaReal (Simple)';
  private baseUrl = 'https://www.vivareal.com.br';

  async search(query: string, filters: Partial<SearchFilters>): Promise<Property[]> {
    const browser = await puppeteer.launch({
      headless: true, // Executar em background
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    try {
      const page = await browser.newPage();
      
      // Configurar viewport e user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Configurar headers extras
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      });

      console.log('Navegando para a URL do VivaReal...');
      
      // Usar a URL exata fornecida pelo usuário
      const searchUrl = 'https://www.vivareal.com.br/venda/parana/curitiba/?onde=%2CParan%C3%A1%2CCuritiba%2C%2C%2C%2C%2Ccity%2CBR%3EParana%3ENULL%3ECuritiba%2C-25.437238%2C-49.269973%2C&transacao=venda';
      
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      // Aguardar a página carregar completamente
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Verificar se a página carregou corretamente
      const currentUrl = page.url();
      console.log('URL atual:', currentUrl);
      
      // Extrair os dados dos imóveis
      const properties = await this.extractProperties(page);
      
      console.log(`Encontrados ${properties.length} imóveis no VivaReal`);
      
      return properties;
      
    } catch (error) {
      console.error('Erro no scraper simples do VivaReal:', error);
      return [];
    } finally {
      await browser.close();
    }
  }
  
  private async extractProperties(page: puppeteer.Page): Promise<Property[]> {
    const properties: Property[] = [];
    
    // Aguardar os cards de imóveis aparecerem
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Tentar diferentes seletores para os cards de imóveis
    const cardSelectors = [
      '[data-type="property"]',
      '.property-card',
      '.card-container',
      '.result-card',
      '.property-item',
      '[class*="property"]',
      '[class*="card"]',
      'article',
      '.item',
      '.js-card-selector'
    ];
    
    let propertyCards: puppeteer.ElementHandle[] = [];
    
    for (const selector of cardSelectors) {
      try {
        propertyCards = await page.$$(selector);
        if (propertyCards.length > 0) {
          console.log(`Encontrados ${propertyCards.length} cards com seletor: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (propertyCards.length === 0) {
      console.log('Nenhum card de imóvel encontrado, tentando seletores mais genéricos...');
      
      // Tentar seletores mais genéricos
      const genericSelectors = [
        'div[class*="card"]',
        'div[class*="item"]',
        'div[class*="property"]',
        'div[class*="result"]',
        'div[class*="listing"]'
      ];
      
      for (const selector of genericSelectors) {
        try {
          propertyCards = await page.$$(selector);
          if (propertyCards.length > 0) {
            console.log(`Encontrados ${propertyCards.length} cards com seletor genérico: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    if (propertyCards.length === 0) {
      console.log('Nenhum card de imóvel encontrado');
      return properties;
    }
    
    // Limitar a 10 imóveis para teste
    const cardsToProcess = propertyCards.slice(0, 10);
    
    for (let i = 0; i < cardsToProcess.length; i++) {
      try {
        const card = cardsToProcess[i];
        
        // Extrair dados do card
        const title = await this.extractText(card, [
          '[data-type="card-title"]',
          '.property-card__title',
          'h2',
          'h3',
          '.title',
          '[class*="title"]',
          '[class*="name"]'
        ]);
        
        const priceText = await this.extractText(card, [
          '[data-type="price"]',
          '.property-card__price',
          '.price',
          '[class*="price"]',
          '[class*="value"]'
        ]);
        
        const price = this.extractPrice(priceText);
        
        const imageUrl = await this.extractAttribute(card, 'img', 'src') ||
                        await this.extractAttribute(card, 'img', 'data-src') ||
                        await this.extractAttribute(card, 'img', 'data-lazy-src');
        
        const link = await this.extractAttribute(card, 'a', 'href');
        const fullLink = link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : '';
        
        const location = await this.extractText(card, [
          '[data-type="address"]',
          '.property-card__address',
          '.address',
          '[class*="address"]',
          '[class*="location"]'
        ]);
        
        const areaText = await this.extractText(card, [
          '[data-type="area"]',
          '.property-card__area',
          '.area',
          '[class*="area"]'
        ]);
        
        const area = this.extractArea(areaText);
        
        const bedroomsText = await this.extractText(card, [
          '[data-type="bedrooms"]',
          '.property-card__bedrooms',
          '.bedrooms',
          '[class*="bedroom"]',
          '[class*="room"]'
        ]);
        
        const bedrooms = parseInt(bedroomsText.match(/\d+/)?.[0] || '0');
        
        const bathroomsText = await this.extractText(card, [
          '[data-type="bathrooms"]',
          '.property-card__bathrooms',
          '.bathrooms',
          '[class*="bathroom"]',
          '[class*="bath"]'
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
        console.error(`Erro ao processar card ${i}:`, error);
      }
    }
    
    return properties;
  }
  
  private async extractText(element: puppeteer.ElementHandle, selectors: string[]): Promise<string> {
    for (const selector of selectors) {
      try {
        const text = await element.$eval(selector, el => el.textContent?.trim() || '');
        if (text) return text;
      } catch (e) {
        continue;
      }
    }
    return '';
  }
  
  private async extractAttribute(element: puppeteer.ElementHandle, selector: string, attribute: string): Promise<string> {
    try {
      return await element.$eval(selector, (el, attr) => el.getAttribute(attr) || '', attribute);
    } catch (e) {
      return '';
    }
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