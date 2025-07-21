import { NextRequest, NextResponse } from 'next/server';

// Dados das cidades e seus bairros (simulando uma API)
const CITIES_DATA = {
  'Curitiba': [
    'Atuba', 'Bacacheri', 'Boa Vista', 'Hugo Lange', 'Jardim Social',
    'Juvevê', 'Pilarzinho', 'Santa Cândida', 'Tingui', 'Tarumã',
    'Centro', 'Água Verde', 'Batel', 'Bigorrilho', 'Cristo Rei',
    'Mercês', 'São Francisco', 'Vila Izabel', 'Cabral', 'Alto da Glória',
    'Portão', 'Fazendinha', 'Vila Hauer', 'Vila Nossa Senhora da Luz',
    'Cidade Industrial', 'São Braz', 'Abranches', 'Cachoeira', 'Alto Boqueirão'
  ],
  'Pinhais': [
    'Centro', 'Maria Antonieta', 'Atuba', 'Weissópolis', 'Emiliano Perneta',
    'Jardim Cláudia', 'Jardim Amélia', 'Jardim Karla', 'Vargem Grande',
    'Alto Tarumã', 'Jardim Weissópolis', 'Jardim Boa Vista', 'Jardim Rondônia'
  ],
  'Piraquara': [
    'Centro', 'São Cristóvão', 'São João', 'Santa Rosa', 'Vila Nova',
    'Jardim Panorâmico', 'Jardim Primavera', 'Jardim Santo Antônio',
    'Jardim das Águas', 'Jardim Piraquara', 'Jardim Morumbi'
  ],
  'Colombo': [
    'Centro', 'Roça Grande', 'Maracanã', 'Guaraituba', 'Rio Verde',
    'São Gabriel', 'São Pedro', 'São José', 'Santa Fé', 'Jardim Itália',
    'Jardim América', 'Jardim Progresso', 'Jardim Boa Vista'
  ],
  'Matinhos': [
    'Centro', 'Balneário Flamingo', 'Balneário Riviera', 'Balneário Mar Azul',
    'Balneário Santa Terezinha', 'Balneário Santa Fé', 'Balneário São Luiz',
    'Balneário Caiobá', 'Balneário Praia Mansa', 'Balneário Praia Brava'
  ],
  'Pontal do Paraná': [
    'Centro', 'Pontal do Sul', 'Ipanema', 'Santa Helena', 'Ponta da Pita',
    'Ponta Grossa', 'Ponta do Poço', 'Ponta do Ubá', 'Ponta do Félix',
    'Ponta da Praia', 'Ponta do Caju', 'Ponta do Morretes'
  ],
  'Piçarras': [
    'Centro', 'Nova Brasília', 'Santa Terezinha', 'São João', 'São Pedro',
    'Vila Nova', 'Jardim das Palmeiras', 'Jardim Europa', 'Jardim América',
    'Balneário Piçarras', 'Balneário Morro dos Conventos'
  ],
  'Penha': [
    'Centro', 'Armação do Itapocorói', 'Balneário Camboriú', 'Balneário Piçarras',
    'Balneário Barra do Sul', 'Balneário Rincão', 'Balneário Gaivota',
    'Balneário Arroio do Silva', 'Balneário Arroio Teixeira'
  ]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300));

    const neighborhoods = CITIES_DATA[city as keyof typeof CITIES_DATA] || [];

    return NextResponse.json({
      city,
      neighborhoods,
      total: neighborhoods.length
    });
  } catch (error) {
    console.error('Neighborhoods API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 