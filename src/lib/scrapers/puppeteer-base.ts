import * as puppeteer from 'puppeteer';
import { Property, SearchFilters } from '@/types/property';

export abstract class PuppeteerScraper {
  protected abstract baseUrl: string;
  protected abstract name: string;

  protected async fetchPage(url: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
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
      
      // Configurar user agent realista
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Configurar viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Configurar headers extras
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      });

      console.log(`Navigating to: ${url}`);
      
      // Navegar para a página com timeout
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Aguardar um pouco para carregar conteúdo dinâmico
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Obter o HTML da página
      const html = await page.content();
      
      return html;
    } finally {
      await browser.close();
    }
  }

  protected abstract buildSearchUrl(query: string, filters: Partial<SearchFilters>): string;
  protected abstract parseProperties(html: string): Property[];

  async search(query: string, filters: Partial<SearchFilters> = {}): Promise<Property[]> {
    try {
      const url = this.buildSearchUrl(query, filters);
      console.log(`Searching ${this.name} at: ${url}`);
      
      const html = await this.fetchPage(url);
      const properties = this.parseProperties(html);
      
      console.log(`Found ${properties.length} properties from ${this.name}`);
      return properties;
    } catch (error) {
      console.error(`Error searching ${this.name}:`, error);
      return [];
    }
  }

  protected extractPrice(priceText: string): number {
    if (!priceText) return 0;
    
    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleanPrice = priceText.replace(/[^\d,.]/g, '');
    
    // Converte para número
    const price = parseFloat(cleanPrice.replace(',', '.'));
    return isNaN(price) ? 0 : price;
  }

  protected extractArea(areaText: string): number {
    if (!areaText) return 0;
    
    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleanArea = areaText.replace(/[^\d,.]/g, '');
    
    // Converte para número
    const area = parseFloat(cleanArea.replace(',', '.'));
    return isNaN(area) ? 0 : area;
  }
} 