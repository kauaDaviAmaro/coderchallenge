# Docker Setup

Este projeto está configurado para rodar com Docker e Docker Compose.

## Pré-requisitos

- Docker instalado (versão 20.10 ou superior)
- Docker Compose instalado (versão 1.29 ou superior)

## Estrutura Docker

- **Backend**: Node.js 20 Alpine
- **Frontend**: Nginx Alpine (multi-stage build)
- **Banco de dados**: SQLite (persistido em volume)

## Como usar

### 1. Construir e iniciar os serviços

```bash
docker-compose up -d
```

Este comando irá:
- Construir as imagens Docker para backend e frontend
- Iniciar os serviços em modo detached (background)
- Criar volumes para persistência de dados

### 2. Verificar os serviços

```bash
docker-compose ps
```

### 3. Ver os logs

```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend
```

### 4. Parar os serviços

```bash
docker-compose down
```

### 5. Parar e remover volumes (limpar dados)

```bash
docker-compose down -v
```

### 6. Reconstruir após mudanças no código

```bash
docker-compose up -d --build
```

## Acessar a aplicação

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## Comandos úteis

### Acessar o container backend

```bash
docker exec -it coderchallenge-backend sh
```

### Acessar o container frontend

```bash
docker exec -it coderchallenge-frontend sh
```

### Ver o tamanho das imagens

```bash
docker images | grep coderchallenge
```

### Limpar containers e imagens antigas

```bash
docker-compose down --rmi all
```

## Volumes

O projeto usa volumes Docker para:
- **backend-data**: Armazena o banco de dados SQLite

O volume `backend-data` é criado automaticamente e preserva os dados entre reinicializações.

## Ambiente de desenvolvimento

Para desenvolvimento local sem Docker:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

## Solução de problemas

### Porta já em uso

Se as portas 80 ou 3000 já estiverem em uso:

1. Edite o arquivo `docker-compose.yml`
2. Altere as portas na seção `ports`
3. Exemplo: `"8080:80"` para o frontend
4. Execute `docker-compose up -d` novamente

### Problemas com permissões

No Linux, pode ser necessário ajustar permissões:

```bash
sudo chown -R $USER:$USER .
```

### Limpar tudo e começar do zero

```bash
docker-compose down -v --rmi all
docker system prune -a
docker-compose up -d --build
```
