import fs from 'fs';
import https from 'https';
import express from 'express';
import initializeDatabase from './index.js';
import models from './models/index.js';

const app = express();

// middleware
app.use(express.static('public'));

// view engine
app.set('view engine', 'ejs');

async function startApplication() {
  await initializeDatabase();
  console.log('DB Initialized successfully');

  const options = {
    key: fs.readFileSync('/root/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/localhost/localhost.key'),
    cert: fs.readFileSync('/root/.local/share/caddy/certificates/acme-v02.api.letsencrypt.org-directory/localhost/localhost.crt')
  };

  https.createServer(options, app).listen(3000, () => {
    console.log('HTTPS server running on port 3000');
  });
}

startApplication().catch(console.error);

// routes
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', (req, res) => res.render('smoothies'));