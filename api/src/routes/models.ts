import express from 'express';
import { getEnabledModels } from '../models.js';

export const modelsRouter = express.Router();

// GET /api/models - List available models
modelsRouter.get('/', (req, res) => {
  try {
    const models = getEnabledModels();
    res.json({
      models,
      count: models.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

