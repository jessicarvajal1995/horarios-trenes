import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Api from './api.js';
import logger from './logger.js';

const app = express();
const api = new Api();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontDist = path.join(__dirname, 'front', 'dist');

app.set('trust proxy', true);
app.use(cors())

app.get(['/api', '/api/*'], logger.req, (req, res) => {
  const apiReq = {
    ...req,
    path: req.path.replace(/^\/api/, '') || '/'
  };

  return api
    .request(apiReq)
    .then(apiRes => res.send(apiRes))
    .catch(err => {
      logger.err(err);
      res.status(500).send(err.message);
    });
});

app.use(express.static(frontDist));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontDist, 'index.html'));
});

const port = process.env.PORT || 3056;

app.listen(port, () => logger.log(`api-trenes listening on ${port}`));
