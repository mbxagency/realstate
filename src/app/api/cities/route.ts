import { NextResponse } from 'next/server';

// Lista de cidades disponíveis
const CITIES = [
  'Curitiba',
  'Pinhais',
  'Piraquara', 
  'Colombo',
  'Matinhos',
  'Pontal do Paraná',
  'Piçarras',
  'Penha'
];

export async function GET() {
  try {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 200));

    return NextResponse.json({
      cities: CITIES,
      total: CITIES.length
    });
  } catch (error) {
    console.error('Cities API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 