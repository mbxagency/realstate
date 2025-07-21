# 🏠 MBX Imobiliária

O **Google dos Imóveis** - Uma plataforma de metabusca que consulta simultaneamente os principais portais imobiliários do Brasil para encontrar o imóvel ideal.

## ✨ Funcionalidades

- **Busca Unificada**: Consulta simultânea em 8+ portais imobiliários
- **Filtros Avançados**: Tipo de imóvel, preço, quartos, localização
- **Geolocalização**: Busca por localização atual do usuário
- **Interface Responsiva**: Design moderno e adaptável
- **Logs de Busca**: Histórico das buscas recentes
- **Loading States**: Feedback visual durante as buscas
- **Resultados Ordenados**: Por preço e relevância

## 🏢 Portais Suportados

- **VivaReal** - Portal especializado em imóveis
- **Zap Imóveis** - Plataforma líder do mercado
- **Imovelweb** - Portal tradicional de imóveis
- **OLX Imóveis** - Classificados populares
- **Chaves na Mão** - Portal regional
- **WebCasas** - Portal especializado
- **Mercado Livre Imóveis** - Marketplace geral
- **JBA Imóveis** - Portal regional

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Framework CSS utilitário
- **Axios** - Cliente HTTP
- **Cheerio** - Web scraping no servidor
- **SWR** - Gerenciamento de estado e cache

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/metabusca-imobiliaria.git
cd metabusca-imobiliaria
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto**
```bash
npm run dev
```

4. **Acesse a aplicação**
```
http://localhost:3000
```

## 🛠️ Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── api/               # API Routes
│   │   └── search/        # Endpoint de busca
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── PropertyCard.tsx   # Card de propriedade
│   ├── SearchForm.tsx     # Formulário de busca
│   ├── SearchResults.tsx  # Resultados da busca
│   └── SearchLogs.tsx     # Logs de busca
├── hooks/                 # Hooks personalizados
│   └── usePropertySearch.ts
├── lib/                   # Utilitários e bibliotecas
│   └── scrapers/          # Scrapers dos portais
│       ├── base.ts        # Classe base
│       ├── vivareal.ts    # Scraper VivaReal
│       ├── zap.ts         # Scraper Zap Imóveis
│       ├── generic.ts     # Scraper genérico
│       └── index.ts       # Gerenciador de scrapers
└── types/                 # Tipos TypeScript
    └── property.ts        # Interfaces de propriedades
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Configurações do servidor
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Configurações de cache (opcional)
REDIS_URL=redis://localhost:6379

# Configurações de rate limiting (opcional)
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

### Configuração de Scrapers

Os scrapers estão configurados para funcionar com os seletores CSS mais comuns dos portais. Para personalizar:

1. Edite os arquivos em `src/lib/scrapers/`
2. Ajuste os seletores CSS conforme necessário
3. Teste com diferentes portais

## 📱 Como Usar

### 1. Busca Básica
- Digite termos como "apartamento em São Paulo" ou "casa em Copacabana"
- Clique em "Buscar Imóveis"

### 2. Filtros Avançados
- **Tipo**: Casa, apartamento, terreno, comercial
- **Preço**: Mínimo e máximo
- **Quartos**: Número mínimo de quartos
- **Localização**: Cidade ou bairro específico

### 3. Geolocalização
- Clique em "📍 Localização atual"
- Permita o acesso à localização no navegador

### 4. Histórico
- Visualize buscas recentes na sidebar
- Clique em uma busca para repeti-la

## 🔍 API Endpoints

### GET /api/search

Busca imóveis em todos os portais.

**Parâmetros:**
- `q` (string, obrigatório): Termo de busca
- `type` (string, opcional): Tipo de imóvel
- `minPrice` (number, opcional): Preço mínimo
- `maxPrice` (number, opcional): Preço máximo
- `bedrooms` (number, opcional): Número de quartos
- `location` (string, opcional): Localização

**Exemplo:**
```
GET /api/search?q=apartamento%20são%20paulo&type=apartamento&minPrice=200000&maxPrice=500000&bedrooms=2
```

**Resposta:**
```json
{
  "properties": [...],
  "total": 45,
  "sources": ["VivaReal", "Zap Imóveis"],
  "searchTime": 2500,
  "errors": []
}
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔒 Considerações Legais

⚠️ **Importante**: Este projeto é para fins educacionais. O web scraping pode violar os termos de uso de alguns sites. Sempre:

- Respeite os robots.txt dos sites
- Implemente delays entre requisições
- Verifique os termos de uso dos portais
- Considere usar APIs oficiais quando disponíveis

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Issues**: Reporte bugs e solicite features no GitHub
- **Discussions**: Participe das discussões da comunidade
- **Email**: contato@mbx-imobiliaria.com

## 🎯 Roadmap

- [ ] Cache com Redis
- [ ] Paginação avançada
- [ ] Filtros por área
- [ ] Comparação de imóveis
- [ ] Alertas de preço
- [ ] API pública
- [ ] App mobile
- [ ] Integração com mais portais

---

**Desenvolvido com ❤️ pela MBX Imobiliária para facilitar a busca de imóveis no Brasil**
