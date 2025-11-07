import { Router } from 'express';
import db from '../db.js';

// Importa nosso "segurança" (middleware) para proteger as rotas de admin
import { verifyToken } from '../middleware/auth.js'; 

const router = Router();

// --- Rota PÚBLICA ---
/**
 * Rota: POST /voluntarios
 * Função: Permite que um novo voluntário se inscreva.
 */
router.post('/', async (req, res) => {
    
    // 1. Extrair os dados do corpo (body)
    const { nome, email, telefone, disponibilidade } = req.body;

    // 2. Validação básica
    if (!nome || !email || !telefone) {
        return res.status(400).json({ error: 'Nome, e-mail e telefone são obrigatórios.' });
    }

    try {
        // 3. Montar a query SQL
        const sql = `
            INSERT INTO voluntarios (nome, email, telefone, disponibilidade) 
            VALUES (?, ?, ?, ?)
        `;
        
        // 4. Valores
        const values = [nome, email, telefone, disponibilidade || null];

        // 5. Executar
        const [result] = await db.query(sql, values);

        // 6. Resposta de sucesso
        res.status(201).json({ 
            message: 'Inscrição de voluntário enviada com sucesso!',
            id_voluntario_inserido: result.insertId 
        });

    } catch (err) {
        // Trata o erro de e-mail duplicado
        if (err.code === 'ER_DUP_ENTRY') {
             return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
        }
        console.error('Erro ao registrar voluntário:', err);
        res.status(500).json({ error: 'Erro interno ao registrar a inscrição.' });
    }
});

// --- Rotas PROTEGIDAS (Só Admin pode usar) ---

/**
 * Rota: GET /voluntarios
 * Função: Retorna a lista de todos os voluntários inscritos.
 * Protegido: Requer token de admin ---> NECESSITA DO TOKEN (PORTANTO SÓ ADMIN PODE VER OS VOLUNTÁRIOS)
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        const sql = "SELECT * FROM voluntarios ORDER BY data_registro DESC";
        const [rows] = await db.query(sql);
        res.status(200).json(rows);

    } catch (err) {
        console.error('Erro ao buscar voluntários:', err);
        res.status(500).json({ error: 'Erro interno ao buscar voluntários.' });
    }
});

/**
 * Rota: DELETE /voluntarios/:id
 * Função: Deleta um voluntário inscrito.
 * Protegido: Requer token de admin ---> NECESSITA DO TOKEN (PORTANTO SÓ ADMIN PODE DELETAR OS VOLUNTÁRIOS)
 */
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const sql = "DELETE FROM voluntarios WHERE id_voluntario = ?";
        const [result] = await db.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Voluntário não encontrado para deletar.' });
        }

        res.status(200).json({ message: 'Inscrição de voluntário deletada com sucesso.' });

    } catch (err) {
        console.error('Erro ao deletar voluntário:', err);
        res.status(500).json({ error: 'Erro interno ao deletar voluntário.' });
    }
});

export default router;