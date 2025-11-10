// server.js (O Servidor Principal) --- Caba das ligações
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import db from './db.js'; // Usado só para o teste de conexão

// --- Importa suas rotas ---
import ouvidoriaRoutes from './routes/ouvidoria.js';
import eventosRoutes from './routes/eventos.js';
import doacoesRoutes from './routes/doacoes.js';
import transparenciaRoutes from './routes/transparencia.js';
import loginRoutes from './routes/login.js';
import voluntariosRoutes from './routes/voluntarios.js';

const app = express();
const port = 3000; // O único port que você vai usar

// --- Middlewares ---
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// --- "Plugando" as Rotas no Servidor ---
// O Express vai direcionar tudo que começar com /ouvidoria para o arquivo ouvidoria.js
app.use('/ouvidoria', ouvidoriaRoutes);

// Tudo que começar com /eventos vai para o arquivo eventos.js
app.use('/eventos', eventosRoutes);

// Tudo que começar com /doacoes vai para o arquivo doacoes.js
app.use('/doacoes', doacoesRoutes);

// Tudo que começar com /transparencia vai para o arquivo uploads
app.use('/transparencia', transparenciaRoutes);

// Vamos usar o prefixo /auth (autenticação) -- login.js
app.use('/auth', loginRoutes); 

// Tudo que começar com /voluntarios vai para voluntarios.js
app.use('/voluntarios', voluntariosRoutes);

// --- Rota "Raiz" (TESTE AR) ---
app.get('/', (req, res) => {
    res.send('API do Instituto funcionando!');
});

app.use(cors({ origin: "https://institutoalma-bca3ewgchpgjb3dx.brazilsouth-01.azurewebsites.net" }));

// --- Iniciar o Servidor ---
app.listen(port, () => {
    console.log(`Servidor COMPLETO rodando em http://localhost:${port}`);
});
