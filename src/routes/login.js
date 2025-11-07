// routes/login.js
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js'; // (Ajuste o caminho se necessário)

const router = Router();

// --- Rota de Registro de Admin ---
router.post('/register', async (req, res) => {
    // O front-end ainda envia 'nome', 'email', 'senha'
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }

    // Como 'data_cadastro' não é automática, vamos criar ela aqui
    const data_cadastro = new Date(); // <-- MUDANÇA

    try {
        // Criptografar a senha
        const salt = await bcrypt.genSalt(10);
        const hashSenha = await bcrypt.hash(senha, salt);

        // Salvar no banco (com os nomes de coluna da SUA tabela)
        const sql = `
            INSERT INTO login_users (nome_user, email_user, senha_hash, data_cadastro) 
            VALUES (?, ?, ?, ?)
        `; // <-- MUDANÇA (nomes das colunas)
        
        const values = [nome, email, hashSenha, data_cadastro]; // <-- MUDANÇA (adicionado data_cadastro)

        const [result] = await db.query(sql, values);
        res.status(201).json({ message: 'Administrador registrado com sucesso!', id: result.insertId });

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Este e-mail já está em uso.' });
        }
        console.error('Erro ao registrar admin:', err);
        res.status(500).json({ error: 'Erro interno ao registrar.' });
    }
});

// --- Rota de Login de Admin ---
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
        // 1. Achar o usuário pelo 'email_user'
        const [rows] = await db.query('SELECT * FROM login_users WHERE email_user = ?', [email]); // <-- MUDANÇA

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const admin = rows[0];

        // 2. Comparar a senha com a 'senha_hash' do banco
        const senhaCorreta = await bcrypt.compare(senha, admin.senha_hash); // <-- MUDANÇA

        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // 3. Criar o Token JWT
        const token = jwt.sign(
            { id: admin.id_user, email: admin.email_user }, // <-- MUDANÇA
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 4. Enviar o token e os dados do admin
        res.status(200).json({
            message: 'Login bem-sucedido!',
            token: token,
            admin: { 
                id: admin.id_user, 
                nome: admin.nome_user, // <-- MUDANÇA
                email: admin.email_user // <-- MUDANÇA
            }
        });

    } catch (err) {
        console.error('Erro ao fazer login:', err);
        res.status(500).json({ error: 'Erro interno no login.' });
    }
});

export default router;