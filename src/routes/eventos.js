import { Router } from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// --- Rota de Eventos (POST) --- // verifyToken --> Só admin pode postar eventos.
router.post('/', verifyToken, async (req, res) => {
    const { titulo, descricao, data_inicio, data_fim, local } = req.body;

    if (!titulo || !descricao || !data_inicio || !local) {
        return res.status(400).json({ error: 'Título, descrição, data de início e local são obrigatórios.' });
    }

    try {
        const sql = `
            INSERT INTO eventos (titulo, descricao, data_inicio, data_fim, local) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [titulo, descricao, data_inicio, data_fim || null, local];
        const [result] = await db.query(sql, values);
        res.status(201).json({ 
            message: 'Evento criado com sucesso!',
            id_evento_inserido: result.insertId 
        });
    } catch (err) {
        console.error('Erro ao criar evento:', err);
        res.status(500).json({ error: 'Erro interno ao criar o evento.' });
    }
});

// --- Rota de Eventos (GET - Todos) ---
router.get('/', async (req, res) => {
    try {
        const sql = "SELECT * FROM eventos ORDER BY data_inicio DESC";
        const [rows] = await db.query(sql);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Erro ao buscar eventos:', err);
        res.status(500).json({ error: 'Erro interno ao buscar eventos.' });
    }
});


// --- Rota de Eventos (GET - Específico por ID) ---
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = "SELECT * FROM eventos WHERE id_evento = ?";
        const [rows] = await db.query(sql, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Evento não encontrado.' });
        }
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error('Erro ao buscar evento por ID:', err);
        res.status(500).json({ error: 'Erro interno ao buscar evento.' });
    }
});

// --- Rota de Eventos (PUT - Update) --- 
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descricao, data_inicio, data_fim, local } = req.body;

        if (!titulo || !descricao || !data_inicio || !local) {
            return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
        }

        const sql = `
            UPDATE eventos 
            SET titulo = ?, descricao = ?, data_inicio = ?, data_fim = ?, local = ?
            WHERE id_evento = ?
        `;
        const values = [titulo, descricao, data_inicio, data_fim || null, local, id];
        const [result] = await db.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Evento não encontrado para atualizar.' });
        }
        res.status(200).json({ message: 'Evento atualizado com sucesso.' });
    } catch (err) {
        console.error('Erro ao atualizar evento:', err);
        res.status(500).json({ error: 'Erro interno ao atualizar evento.' });
    }
});

// --- Rota de Eventos (DELETE) --- // verifyToken --> Só admin pode deletar os eventos.
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const sql = "DELETE FROM eventos WHERE id_evento = ?";
        const [result] = await db.query(sql, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Evento não encontrado para deletar.' });
        }
        res.status(200).json({ message: 'Evento deletado com sucesso.' });
    } catch (err) {
        console.error('Erro ao deletar evento:', err);
        res.status(500).json({ error: 'Erro interno ao deletar evento.' });
    }
});

export default router;