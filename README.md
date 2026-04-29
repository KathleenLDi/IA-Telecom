# TelecomIA + Gemini

Este pacote contém:

- `index.html`: tela da TelecomIA já adaptada para chamar o back-end local.
- `backend/server.js`: servidor Node.js que chama o Gemini.
- `backend/dados-internos.txt`: local onde você poderá colocar os dados do setor TELECOM depois.
- `backend/.env.example`: modelo do arquivo de configuração da chave.

## Como rodar

### 1. Entrar na pasta do back-end

```bash
cd backend
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Criar o arquivo `.env`

Copie o arquivo `.env.example` e renomeie para `.env`.

Depois coloque sua chave:

```env
GEMINI_API_KEY=SUA_CHAVE_DO_GEMINI_AQUI
PORT=4000
```

### 4. Rodar o servidor

```bash
npm start
```

### 5. Abrir o front-end

Abra o arquivo `index.html` no navegador.

## Onde colocar seus dados depois

Abra o arquivo:

```txt
backend/dados-internos.txt
```

Cole ali os procedimentos, fluxos, dúvidas frequentes, SLA, padrões, equipamentos e informações internas do setor TELECOM.

A IA vai usar esse conteúdo como base interna.

## Importante

Não coloque a chave do Gemini dentro do HTML. Ela deve ficar somente no arquivo `.env` do back-end.
