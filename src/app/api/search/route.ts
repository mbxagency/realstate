import { NextRequest, NextResponse } from 'next/server';
import { ScraperManager } from '@/lib/scrapers';
import { SearchFilters } from '@/types/property';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') as 'casa' | 'apartamento' | 'terreno' | 'comercial' | 'outro' | undefined;
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;
    const bedrooms = searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined;
    const location = searchParams.get('location') || '';
    const minArea = searchParams.get('minArea') ? parseInt(searchParams.get('minArea')!) : undefined;

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const filters: SearchFilters = {
      query,
      type,
      minPrice,
      maxPrice,
      bedrooms,
      location,
      minArea
    };

    const scraperManager = new ScraperManager();
    const result = await scraperManager.searchAll(query, filters);

    // Filtrar por preço se especificado
    if (minPrice || maxPrice) {
      result.properties = result.properties.filter(property => {
        if (minPrice && property.price < minPrice) return false;
        if (maxPrice && property.price > maxPrice) return false;
        return true;
      });
      result.total = result.properties.length;
    }

    // Filtrar por tipo se especificado
    if (type) {
      result.properties = result.properties.filter(property => property.type === type);
      result.total = result.properties.length;
    }

    // Filtrar por quartos se especificado
    if (bedrooms) {
      result.properties = result.properties.filter(property => 
        property.bedrooms && property.bedrooms >= bedrooms
      );
      result.total = result.properties.length;
    }

    // Filtrar por metragem mínima se especificado
    if (minArea) {
      result.properties = result.properties.filter(property => 
        property.area && property.area >= minArea
      );
      result.total = result.properties.length;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 