import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Rota: POST /doacoes
router.post('/', async (req, res) => {
    const { id_user, valor, descricao } = req.body;
    if (!valor || valor <= 0) {
        return res.status(400).json({ error: 'O valor da doação é obrigatório e deve ser maior que zero.' });
    }
    const data_doacao = new Date();
    try {
        const sql = `
            INSERT INTO doacoes 
            (id_user, valor, data_doacao, descricao) 
            VALUES (?, ?, ?, ?)
        `;
        const values = [id_user || null, valor, data_doacao, descricao || null];
        const [result] = await db.query(sql, values);
        res.status(201).json({ 
            message: 'Registro de doação criado com sucesso!',
            id_doacao_inserida: result.insertId 
        });
    } catch (err) {
        console.error('Erro ao registrar doação:', err);
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
             return res.status(404).json({ error: 'Usuário (id_user) não encontrado.' });
        }
        res.status(500).json({ error: 'Erro interno ao registrar a doação.' });
    }
});

// Rota: GET /doacoes
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT d.*, u.nome AS nome_usuario 
            FROM doacoes d
            LEFT JOIN login_users u ON d.id_user = u.id_user
            ORDER BY d.data_doacao DESC
        `;
        const [rows] = await db.query(sql);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Erro ao buscar doações:', err);
        res.status(500).json({ error: 'Erro interno ao buscar doações.' });
    }
});

// Rota: GET /doacoes/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = "SELECT * FROM doacoes WHERE id_doacao = ?";
        const [rows] = await db.query(sql, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Doação não encontrada.' });
        }
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error('Erro ao buscar doação por ID:', err);
        res.status(500).json({ error: 'Erro interno ao buscar doação.' });
    }
});

// Rota: DELETE /doacoes/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = "DELETE FROM doacoes WHERE id_doacao = ?";
        const [result] = await db.query(sql, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Doação não encontrada para deletar.' });
        }
        res.status(200).json({ message: 'Registro de doação deletado com sucesso.' });
    } catch (err) {
        console.error('Erro ao deletar doação:', err);
        res.status(500).json({ error: 'Erro interno ao deletar doação.' });
    }
});

export default router;
