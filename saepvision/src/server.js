const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'saepvision-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use('/api', apiRoutes);
app.use(express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

function startServer(port) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`SAEPVision rodando em http://localhost:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Porta ${port} em uso. Tentando ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  });
}

startServer(PORT);
