# Backend API - Primordial Ducks Catalog System

Backend API desenvolvido com Node.js, Express.js e Sequelize para o sistema de catalogação de Patos Primordiais.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para banco de dados
- **SQLite** - Banco de dados SQL

## 📦 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente (opcional):
Crie um arquivo `.env` na raiz do backend:
```env
PORT=3000
NODE_ENV=development
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

## 🏃 Como Executar

### Desenvolvimento (com auto-reload):
```bash
npm run dev
```

### Produção:
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📡 Endpoints

### GET `/api/ducks` - Listar todos os patos
Retorna todos os patos catalogados.

### GET `/api/ducks/:id` - Obter um pato específico
Retorna os dados de um pato pelo ID.

### POST `/api/ducks` - Criar novo pato
Cria um novo pato primordial. Body exemplo:
```json
{
  "drone": {
    "serial": "DR-001",
    "brand": "DJI",
    "manufacturer": "DJI Technology",
    "country": "China"
  },
  "height": 150,
  "weight": 5000,
  "location": {
    "city": "São Paulo",
    "country": "Brasil",
    "gps": {
      "lat": -23.5505,
      "lon": -46.6333
    },
    "precision": 10
  },
  "status": "awake",
  "mutations": 5,
  "superpower": {
    "name": "Bola de Fogo",
    "description": "Pode lançar bolas de fogo",
    "classification": {
      "type": "bélico",
      "rarity": "rare",
      "risk": 70
    }
  }
}
```

### PUT `/api/ducks/:id` - Atualizar pato
Atualiza os dados de um pato existente.

### DELETE `/api/ducks/:id` - Deletar pato
Remove um pato do catálogo.

### GET `/health` - Health check
Verifica se a API está funcionando.

## 📊 Banco de Dados

O sistema utiliza SQLite por padrão. O arquivo de banco de dados será criado automaticamente na raiz do projeto como `database.sqlite`.

### Estrutura do Model Duck

- `id` - ID único
- `droneSerial` - Número de série do drone
- `droneBrand` - Marca do drone
- `droneManufacturer` - Fabricante do drone
- `droneCountry` - País de origem do drone
- `height` - Altura (cm)
- `weight` - Peso (gramas)
- `locationCity` - Cidade da localização
- `locationCountry` - País da localização
- `gpsLat` - Latitude GPS
- `gpsLon` - Longitude GPS
- `precision` - Precisão GPS (cm)
- `referencePoint` - Ponto de referência
- `status` - Status de hibernação (awake, trance, deep-hibernation)
- `heartRate` - Batimentos cardíacos (bpm)
- `mutations` - Quantidade de mutações
- `superpowerName` - Nome do superpoder
- `superpowerDescription` - Descrição do superpoder
- `superpowerType` - Tipo do superpoder
- `superpowerRarity` - Raridade (common, uncommon, rare, epic, legendary)
- `superpowerRisk` - Nível de risco (0-100)
- `registeredAt` - Data de registro
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

## 🔄 Sincronização com Frontend

O frontend está configurado para se conectar ao backend através de proxy no Vite. Todas as requisições para `/api` serão redirecionadas para o backend.

## 🛠️ Scripts Disponíveis

- `npm start` - Executa o servidor em modo produção
- `npm run dev` - Executa o servidor em modo desenvolvimento com auto-reload
- `npm run db:migrate` - Executa migrações do banco (se configurado)

## 📝 Notas

- O banco de dados é criado automaticamente na primeira execução
- As tabelas são sincronizadas automaticamente com `{ alter: true }`
- Por padrão, todos os logs de queries SQL são exibidos no console


