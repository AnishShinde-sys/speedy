# Speedy - AI Chrome Extension

A Chrome extension with AI-powered chat capabilities.

## Monorepo Structure

```
speedy/
├── extension/        # Chrome extension
│   ├── src/          # React source files
│   ├── manifest.json # Chrome extension manifest
│   └── package.json  # Extension dependencies
└── api/              # Backend API server
    ├── src/          # TypeScript source files
    └── package.json  # API dependencies
```

## Development

### Extension
```bash
cd extension
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
cd extension
npm run build
```

### API
```bash
cd api
npm run build
```
