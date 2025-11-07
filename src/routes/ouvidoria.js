import { Router } from 'express';
import db from '../db.js';

const router = Router();

// --- Rota da Ouvidoria (POST) ---
// Rota: POST /ouvidoria
router.post('/', async (req, res) => {
    
    // 1. Extrair os dados do corpo (body) da requisição
    // (O front-end deve enviar 'nome', 'email', 'assunto', 'mensagem')
    const { nome, email, assunto, mensagem } = req.body;

    // 2. Validação básica (para não inserir lixo no banco)
    if (!nome || !email || !mensagem) {
        return res.status(400).json({ error: 'Nome, e-mail e mensagem são obrigatórios.' });
    }

    // 3. Pegar a data e hora atual (conforme seu schema 'DATETIME NOT NULL')
    const data_envio = new Date();

    try {
        // 4. Montar a query SQL (com '?' para evitar SQL Injection)
        const sql = `
            INSERT INTO ouvidoria 
            (nome, email, assunto, mensagem, data_envio) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        // 5. Preparar os valores na ordem correta dos '?'
        const values = [nome, email, assunto, mensagem, data_envio];

        // 6. Executar a query no banco de dados
        // Usamos 'await' pois 'db.query' vem do 'mysql2/promise'
        const [result] = await db.query(sql, values);

        // 7. Enviar uma resposta de sucesso
        res.status(201).json({ 
            message: 'Mensagem enviada com sucesso!',
            id_inserido: result.insertId // Retorna o ID da mensagem que foi criada
        });

    } catch (err) {
        // 8. Se der erro, enviar uma resposta de erro
        console.error('Erro ao inserir na ouvidoria:', err);
        res.status(500).json({ error: 'Erro interno ao processar a mensagem.' });
    }
});

// --- Rota da Ouvidoria (GET - Todas) ---
// Rota: GET /ouvidoria
// Função: Busca todas as mensagens da ouvidoria no banco.
router.get('/', async (req, res) => {
    try {
        // 1. Montar a query SQL (simples)
        // Vamos ordenar pelas mais recentes primeiro (data_envio DESC)
        const sql = "SELECT * FROM ouvidoria ORDER BY data_envio DESC";

        // 2. Executar a query
        const [rows] = await db.query(sql);

        // 3. Enviar as linhas (rows) como resposta
        res.status(200).json(rows);

    } catch (err) {
        console.error('Erro ao buscar mensagens da ouvidoria:', err);
        res.status(500).json({ error: 'Erro interno ao buscar mensagens.' });
    }
});

// --- Rota da Ouvidoria (GET - Específica por ID) ---
// Rota: GET /ouvidoria/1 (onde 1 é o ID)
router.get('/:id', async (req, res) => {
    try {
        // 1. Pegar o ID da URL (req.params)
        const { id } = req.params;

        // 2. Montar a query SQL
        const sql = "SELECT * FROM ouvidoria WHERE id_mensagem = ?";
        
        // 3. Executar a query
        const [rows] = await db.query(sql, [id]);

        // 4. Verificar se encontrou algo
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Mensagem não encontrada.' });
        }

        // 5. Enviar a primeira (e única) linha encontrada
        res.status(200).json(rows[0]);

    } catch (err) {
        console.error('Erro ao buscar mensagem por ID:', err);
        res.status(500).json({ error: 'Erro interno ao buscar mensagem.' });
    }
});


// --- Rota da Ouvidoria (DELETE) ---
// Rota: DELETE /ouvidoria/1 (onde 1 é o ID)
router.delete('/:id', async (req, res) => {
    try {
        // 1. Pegar o ID da URL (req.params)
        const { id } = req.params;

        // 2. Montar a query SQL
        const sql = "DELETE FROM ouvidoria WHERE id_mensagem = ?";
        
        // 3. Executar a query
        const [result] = await db.query(sql, [id]);

        // 4. Verificar se algo foi realmente deletado
        if (result.affectedRows === 0) {
            // Se 'affectedRows' for 0, significa que não encontrou o ID
            return res.status(404).json({ error: 'Mensagem não encontrada para deletar.' });
        }

        // 5. Enviar resposta de sucesso
        res.status(200).json({ message: 'Mensagem deletada com sucesso.' });

    } catch (err) {
        console.error('Erro ao deletar mensagem:', err);
        res.status(500).json({ error: 'Erro interno ao deletar mensagem.' });
    }
});

export default router;