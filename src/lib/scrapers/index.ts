import { VivaRealEnhancedScraper } from './vivareal-enhanced';
import { Property, SearchFilters, SearchResult } from '@/types/property';

// Interface comum para todos os scrapers
interface ScraperInterface {
  search(query: string, filters?: Partial<SearchFilters>): Promise<Property[]>;
}

export class ScraperManager {
  // Sempre usar scrapers reais
  private useRealScrapers = true;

  private get scrapers(): Array<{ scraper: ScraperInterface; name: string }> {
    return [
      { scraper: new VivaRealEnhancedScraper(), name: 'VivaReal (Enhanced)' }
    ];
  }

  // Método para alternar entre scrapers reais e mock (agora sem efeito)
  setUseRealScrapers(_useReal: boolean) {
    this.useRealScrapers = true;
    console.log('Sempre usando scrapers reais');
  }

  async searchAll(query: string, filters: SearchFilters): Promise<SearchResult> {
    const startTime = Date.now();
    console.log(`Starting search for: "${query}" with filters:`, filters);
    console.log('Usando apenas scrapers reais');

    // Executar todos os scrapers disponíveis
    const mainScrapers = this.scrapers;
    
    const results = await Promise.allSettled(
      mainScrapers.map(async ({ scraper, name }) => {
        try {
          const properties = await scraper.search(query, filters);
          return {
            name,
            properties,
            success: true
          };
        } catch (error) {
          console.error(`Error searching ${name}:`, error);
          return {
            name,
            properties: [],
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    // Processar resultados
    const allProperties: Property[] = [];
    const errors: string[] = [];
    const successfulSources: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { name, properties, success, error } = result.value;
        
        if (success && properties.length > 0) {
          allProperties.push(...properties);
          successfulSources.push(name);
          console.log(`✅ ${name}: ${properties.length} properties found`);
        } else {
          if (error) {
            errors.push(`${name}: ${error}`);
          }
          console.log(`❌ ${name}: No properties found`);
        }
      } else {
        const scraperName = mainScrapers[index]?.name || 'Unknown';
        errors.push(`${scraperName}: ${result.reason}`);
        console.log(`❌ ${scraperName}: Failed with error`);
      }
    });

    // Ordenar por preço (menor primeiro)
    allProperties.sort((a, b) => a.price - b.price);

    const endTime = Date.now();
    const searchTime = endTime - startTime;

    console.log(`Search completed in ${searchTime}ms. Found ${allProperties.length} properties from ${successfulSources.length} sources.`);

    return {
      properties: allProperties,
      total: allProperties.length,
      searchTime,
      sources: successfulSources,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  // Método para buscar apenas um scraper específico (útil para testes)
  async searchSingle(scraperName: string, query: string, filters: SearchFilters): Promise<Property[]> {
    const scraper = this.scrapers.find(s => s.name === scraperName);
    if (!scraper) {
      throw new Error(`Scraper not found: ${scraperName}`);
    }
    
    return await scraper.scraper.search(query, filters);
  }
} 