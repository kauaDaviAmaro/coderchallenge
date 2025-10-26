# Primordial Ducks Catalog System

Sistema de catalogação e controle de Patos Primordiais desenvolvido com Vue 3 e Node.js.

## Sobre o Projeto

Sistema completo de gestão de Patos Primordiais com as seguintes funcionalidades:
1. **Catalogar** - Adicionar novos patos ao catálogo
2. **Análise** - Análise de risco e custos operacionais
3. **Capturar** - Sistema de captura com drones de combate

## Início Rápido

### Opção 1: Docker (Recomendado)

#### Pré-requisitos
- Docker instalado (versão 20.10 ou superior)
- Docker Compose instalado (versão 1.29 ou superior)

#### Executar com Docker
```bash
# Construir e iniciar os serviços
docker-compose up -d

# Ver os logs
docker-compose logs -f

# Parar os serviços
docker-compose down
```

A aplicação estará disponível em:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000

Para mais detalhes sobre Docker, consulte [DOCKER.md](DOCKER.md)

### Opção 2: Instalação Manual

#### Pré-requisitos

- Node.js 18+ instalado
- NPM ou Yarn

#### Instalação

1. Clone o repositório

2. Instale as dependências do frontend:
```bash
cd frontend
npm install
```

3. Instale as dependências do backend:
```bash
cd ../backend
npm install
```

#### Executar o Projeto

Você precisará executar o backend e o frontend em terminais separados:

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
O backend estará rodando em `http://localhost:3000`

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
O frontend estará rodando em `http://localhost:5173`

## Estrutura do Projeto

```
coderchallenge/
├── backend/           # API Node.js/Express/Sequelize
│   ├── src/
│   │   ├── config/    # Configurações do banco
│   │   ├── models/    # Modelos Sequelize
│   │   ├── routes/    # Rotas da API
│   │   └── server.js  # Servidor principal
│   └── package.json
├── frontend/          # Aplicação Vue 3
│   ├── src/
│   │   ├── views/     # Páginas
│   │   ├── stores/    # Estado global
│   │   ├── router/    # Rotas
│   │   └── main.js
│   └── package.json
├── docker-compose.yml # Configuração Docker
├── DOCKER.md         # Documentação Docker
└── README.md
```

## Tecnologias

### Frontend
- **Vue 3** - Framework JavaScript
- **Vue Router** - Roteamento
- **Vite** - Build tool
- **Pinia** - Gerenciamento de estado

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM
- **SQLite** - Banco de dados

## API Endpoints

### Ducks

#### GET `/api/ducks`
Lista todos os patos catalogados

#### GET `/api/ducks/:id`
Retorna um pato específico pelo ID

#### POST `/api/ducks`
Cria um novo pato primordial

#### PUT `/api/ducks/:id`
Atualiza um pato existente

#### DELETE `/api/ducks/:id`
Remove um pato do catálogo

#### GET `/api/ducks/list/captured`
Lista todos os patos capturados

### Drones

#### GET `/api/drones`
Lista todos os drones cadastrados

#### GET `/api/drones/:id`
Retorna um drone específico pelo ID

#### POST `/api/drones`
Cria um novo drone

#### PUT `/api/drones/:id`
Atualiza um drone existente

#### DELETE `/api/drones/:id`
Remove um drone do sistema

### Health

#### GET `/health`
Verifica o status da API

## Banco de Dados

O projeto utiliza SQLite. O arquivo `database.sqlite` será criado automaticamente na pasta `backend` na primeira execução.

### Modelo Duck

O modelo Duck armazena:
- Informações do drone
- Medidas físicas (altura, peso)
- Localização GPS
- Status de hibernação
- Batimentos cardíacos
- Quantidade de mutações
- Superpoderes detectados

### Modelo Drone

O modelo Drone armazena:
- Serial único
- Marca e fabricante
- País de origem
- Modelo
- Status (ativo, inativo, manutenção)
- Notas adicionais

## Funcionalidades

### 1ª Missão - Catalogar
- Adicionar novos patos primordial
- Converter unidades (cm/ft, g/lb)
- Incluir dados de GPS e localização
- Registrar status de hibernação
- Adicionar informações sobre superpoderes

### 2ª Missão - Análise
- Análise de risco
- Cálculo de custos operacionais
- Estimativa de poderio militar necessário
- Custo de sequenciamento genômico
- Visualização de estatísticas

### 3ª Missão - Capturar
- Seleção de alvos
- Sistema de combate com drone
- Estratégias de ataque
- Gerador de defesas aleatórias
- Pontos fracos identificados

### Gestão de Drones
- Listar todos os drones cadastrados
- Criar novos drones com serial único
- Editar informações de drones existentes
- Deletar drones
- Filtrar por status (ativo, inativo, manutenção)
- Visualizar estatísticas de drones

## Scripts Disponíveis

### Frontend
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview da build
npm run lint     # Executar linter
npm run format   # Formatar código
```

### Backend
```bash
npm run dev      # Servidor com auto-reload
npm start        # Servidor em produção
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend`:

```env
PORT=3000
NODE_ENV=development
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

### Proxy Vite

O proxy no `vite.config.js` redireciona todas as requisições `/api` para o backend em `http://localhost:3000`.

## Análises Disponíveis

- **Nível de Risco** - Cálculo baseado em status, heart rate e superpoderes
- **Custo Operacional** - Base + altura + peso + distância de Brasília
- **Poderio Militar** - Poder necessário para captura
- **Conhecimento Ganho** - Valor baseado em mutações
- **Custo de Sequenciamento** - $2500 por mutação

## Interface

- Design dark com tema vermelho
- Gráficos e visualizações de dados
- Sistema de grids
- Animações e transições
- Layout responsivo
