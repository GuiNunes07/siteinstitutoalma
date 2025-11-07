// src/middleware/auth.js
import jwt from 'jsonwebtoken';

// Este é o nosso "segurança"
export const verifyToken = (req, res, next) => {
    
    // 1. Onde está o crachá (token)?
    // O padrão é enviá-lo no "cabeçalho" (header) da requisição,
    // com o nome "Authorization" e o formato "Bearer SEU_TOKEN_LONGO"
    const authHeader = req.headers['authorization'];
    
    // 2. Extrair o token (tirar o "Bearer " do começo)
    const token = authHeader && authHeader.split(' ')[1]; // Pega só o token

    // 3. O convidado tem um crachá?
    if (token == null) {
        // Se não tem token, não pode entrar.
        return res.status(401).json({ error: 'Acesso não autorizado. Token não fornecido.' }); // 401 = Não Autorizado
    }

    // 4. O crachá é verdadeiro?
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        
        // Se 'err', o crachá é falso ou expirou
        if (err) {
            console.error('Erro na verificação do token:', err.message);
            return res.status(403).json({ error: 'Acesso negado. Token inválido ou expirado.' }); // 403 = Proibido
        }

        // 5. O crachá é válido!
        // Nós "carimbamos" a mão do usuário (o 'req') com os dados dele
        // para que a próxima rota (a rota final) saiba quem ele é.
        req.user = user; 
        
        // Deixa o usuário passar para a rota final
        next(); 
    });
};