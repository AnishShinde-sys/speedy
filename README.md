# Speedy - AI Chrome Extension

A Chrome extension with AI-powered chat capabilities.

## Monorepo Structure

```
speedy/
├── api/              # Backend API server
│   ├── src/          # TypeScript source files
│   └── package.json  # API dependencies
├── src/              # Chrome extension source
│   ├── components/   # React components
│   └── Sidepanel.jsx # Main sidepanel UI
├── manifest.json     # Chrome extension manifest
└── package.json      # Extension dependencies
```

## Development

### Extension
```bash
npm install
npm run dev
```

### API Server
```bash
cd api
npm install
npm run dev
```

## Build

### Extension
```bash
npm run build
```

### API
```bash
cd api
npm run build
```

