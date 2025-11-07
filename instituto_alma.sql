CREATE DATABASE instituto_db;
USE instituto_db;


CREATE TABLE login_users
(
	id_user INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	nome_user VARCHAR(100) NOT NULL, 
	email_user VARCHAR(150) NOT NULL UNIQUE,
	senha_hash VARCHAR(255) NOT NULL,
	data_cadastro DATETIME
);

SHOW INDEXES FROM login_users;

/* ---------------------------------------------------------------------------- */

CREATE TABLE doacoes /* Doação Valores */
(
	id_doacao INT PRIMARY KEY AUTO_INCREMENT,
	id_user INT, FOREIGN KEY (id_user) REFERENCES login_users(id_user) ON DELETE SET NULL,
	valor DECIMAL(10,2) DEFAULT 0.00, 
	data_doacao DATETIME,
    descricao VARCHAR(255)
);

select * from doacoes;

/* --------------------------------------------------------------------------- */

CREATE TABLE eventos
(
	id_evento INT PRIMARY KEY AUTO_INCREMENT,
	titulo VARCHAR(200) NOT NULL,
	descricao TEXT NOT NULL,
	data_inicio DATETIME NOT NULL,
	data_fim DATETIME,
	local VARCHAR(200) NOT NULL
);

select * from eventos;

/* --------------------------------------------------------------------------- */

CREATE TABLE transparencia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  caminho_arquivo VARCHAR(255) NOT NULL,
  data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from transparencia;

/* --------------------------------------------------------------------------- */

CREATE TABLE ouvidoria
(
	id_mensagem INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(150) NOT NULL,
	assunto VARCHAR(200),
	mensagem TEXT NOT NULL,
	data_envio DATETIME NOT NULL,
	status VARCHAR(50) NOT NULL DEFAULT 'Não Lida'
);

select * from ouvidoria;

/* --------------------------------------------------------------------------- */

CREATE TABLE voluntarios (
    id_voluntario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    disponibilidade VARCHAR(255),
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from voluntarios;