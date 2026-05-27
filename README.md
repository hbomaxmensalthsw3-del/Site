# Project Void — Key System

Sistema de keys para scripts Roblox com painel admin.

## Instalação

```bash
npm install
```

## Configuração

1. Copie `.env.example` para `.env` e preencha:
   - `DATABASE_URL` — URL do PostgreSQL
   - `JWT_SECRET` — qualquer frase secreta longa
   - `OWNER_PASSWORD` — senha do owner (padrão: owner40028922)

2. Crie as tabelas no banco:
```bash
node src/setup.js
```

3. Inicie o servidor:
```bash
npm start
```

## Deploy no Railway

1. Suba o código no GitHub
2. No Railway: New Project → Deploy from GitHub → selecione o repositório
3. Adicione um banco PostgreSQL no Railway (Add Service → Database → PostgreSQL)
4. Copie a `DATABASE_URL` do banco para as variáveis do projeto
5. Adicione também `JWT_SECRET` e `OWNER_PASSWORD` nas variáveis
6. No terminal do Railway (ou localmente com a DATABASE_URL do Railway): `node src/setup.js`

## Endpoints importantes

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/keys/verify` | POST | Verificar key via script Lua |
| `/api/keys/` | GET | Listar keys (admin) |
| `/api/keys/create` | POST | Criar key (admin) |
| `/api/keys/bulk` | POST | Criar várias keys (admin) |
| `/api/auth/login` | POST | Login admin |
| `/api/auth/me` | GET | Dados do usuário logado |

## Script Lua (executor Roblox)

A URL para o script Lua:
```
https://SEU-DOMINIO.railway.app/api/keys/verify
```

Campo `key` = a key do jogador  
Campo `hwid` = RbxAnalyticsService:GetClientId()
