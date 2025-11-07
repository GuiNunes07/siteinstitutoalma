// routes/transparencia.js
import { Router } from 'express';
import multer from 'multer'; // Importamos o multer
import db from '../db.js';   // (Ajuste o caminho se seu db.js estiver em /src)
import path from 'path';     // Módulo 'path' do Node para lidar com nomes de arquivos
import fs from 'fs';         // Módulo 'fs' (File System) para deletar arquivos

const router = Router();

// --- 1. Configuração do Multer (Onde salvar os arquivos) ---
const storage = multer.diskStorage({
    // Define a pasta de destino
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Salva na pasta 'uploads/' que criamos
    },
    // Define o nome do arquivo
    filename: (req, file, cb) => {
        // Cria um nome único: timestamp + nome original
        // Ex: 1678886400000-relatorio.pdf
        const nomeUnico = Date.now() + '-' + file.originalname;
        cb(null, nomeUnico);
    }
});

// Inicializa o multer com a configuração de storage
const upload = multer({ storage: storage });

// --- 2. Rotas da Transparência ---

/**
 * Rota: POST /transparencia
 * Função: Faz o upload de um arquivo e salva o caminho no banco.
 * Middleware: 'upload.single('arquivo')' processa o upload antes da rota.
 * 'arquivo' é o nome do campo no Postman (form-data).
 */
router.post('/', upload.single('arquivo'), async (req, res) => {
    
    // Os dados de texto vêm em 'req.body'
    const { titulo } = req.body;
    
    // Os dados do arquivo vêm em 'req.file' (graças ao multer)
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    if (!titulo) {
        return res.status(400).json({ error: 'O campo "titulo" é obrigatório.' });
    }

    // O caminho onde o arquivo foi salvo
    const caminho_arquivo = req.file.path; 

    try {
        const sql = `
            INSERT INTO transparencia (titulo, caminho_arquivo) 
            VALUES (?, ?)
        `;
        const values = [titulo, caminho_arquivo];
        const [result] = await db.query(sql, values);

        res.status(201).json({ 
            message: 'Documento enviado com sucesso!',
            id_inserido: result.insertId,
            caminho: caminho_arquivo
        });
    } catch (err) {
        console.error('Erro ao salvar no banco:', err);
        res.status(500).json({ error: 'Erro interno ao salvar o registro.' });
    }
});

/**
 * Rota: GET /transparencia
 * Função: Lista todos os documentos do banco.
 */
router.get('/', async (req, res) => {
    try {
        const sql = "SELECT * FROM transparencia ORDER BY data_upload DESC";
        const [rows] = await db.query(sql);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Erro ao buscar documentos:', err);
        res.status(500).json({ error: 'Erro interno ao buscar documentos.' });
    }
});

/**
 * Rota: DELETE /transparencia/:id
 * Função: Deleta um registro do banco E o arquivo do servidor.
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Achar o arquivo no banco ANTES de deletar o registro
        const [rows] = await db.query("SELECT caminho_arquivo FROM transparencia WHERE id = ?", [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Documento não encontrado.' });
        }
        
        const caminho = rows[0].caminho_arquivo;

        // 2. Deletar o registro do banco
        const [result] = await db.query("DELETE FROM transparencia WHERE id = ?", [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Documento não encontrado para deletar.' });
        }

        // 3. Deletar o arquivo do disco (da pasta 'uploads/')
        fs.unlink(caminho, (err) => {
            if (err) {
                console.error('Erro ao deletar o arquivo físico:', err);
                // Mesmo se der erro aqui, o registro do banco já foi, então mandamos sucesso.
            }
        });

        res.status(200).json({ message: 'Documento deletado com sucesso.' });
    } catch (err) {
        console.error('Erro ao deletar documento:', err);
        res.status(500).json({ error: 'Erro interno ao deletar documento.' });
    }
});

export default router;