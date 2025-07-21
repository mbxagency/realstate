import axios from 'axios';
import * as cheerio from 'cheerio';
import { Property, SearchFilters } from '@/types/property';

export abstract class BaseScraper {
  protected abstract baseUrl: string;
  protected abstract name: string;

  protected async fetchPage(url: string): Promise<cheerio.Root> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0'
        },
        timeout: 5000, // 5 segundos de timeout
        maxRedirects: 3
      });
      
      return cheerio.load(response.data);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  protected abstract buildSearchUrl(query: string, filters: Partial<SearchFilters>): string;
  protected abstract parseProperties($: cheerio.Root): Property[];

  async search(query: string, filters: Partial<SearchFilters> = {}): Promise<Property[]> {
    try {
      const url = this.buildSearchUrl(query, filters);
      console.log(`Searching ${this.name} at: ${url}`);
      
      const $ = await this.fetchPage(url);
      const properties = this.parseProperties($);
      
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