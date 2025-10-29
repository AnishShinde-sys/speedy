# Speedy AI Backend API

Backend API server for the Speedy AI browser extension.

## Features

- OpenRouter AI integration
- Chat management (create, read, update, delete)
- Message history
- Auto-title generation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your OpenRouter API key to `.env`:
```
OPENROUTER_API_KEY=your_actual_key_here
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## API Endpoints

- `GET /` - API info
- `GET /health` - Health check
- `GET /api/openrouter/models` - Get available AI models
- `POST /api/openrouter/chat` - Send chat message to AI
- `GET /api/chats` - List all chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get chat by ID
- `DELETE /api/chats/:id` - Delete chat
- `POST /api/chats/:id/message` - Add message to chat
- `POST /api/chats/:id/generate-title` - Auto-generate chat title
- `PATCH /api/chats/:id/title` - Update chat title

## Environment Variables

- `OPENROUTER_API_KEY` - Your OpenRouter API key (required)
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `YOUR_SITE_URL` - Your site URL for OpenRouter
- `YOUR_SITE_NAME` - Your site name for OpenRouter

