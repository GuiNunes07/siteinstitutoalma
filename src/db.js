// db.js
import mysql from 'mysql2/promise'; // Importa a versão com 'Promises'

// Crie a "pool" de conexões
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_PASSWORD, // Coloque a senha que deu certo!
    database: 'instituto_db',      // O nome do banco que deu certo!
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testa a conexão (opcional, mas recomendado)
pool.getConnection()
    .then(connection => {
        console.log('Conexão com o MySQL bem-sucedida!');
        connection.release(); // Libera a conexão de volta para a pool
    })
    .catch(err => {
        console.error('Erro ao conectar com o MySQL:', err);
    });

// Exporta a pool para ser usada em outros arquivos
export default pool;