-- Executado automaticamente pelo Spring Boot a cada subida da aplicação
-- (spring.sql.init.mode=always). Cópia de backend/script.sql: mantenha os dois iguais.

DROP TABLE IF EXISTS aluno;

CREATE TABLE aluno
(
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome     VARCHAR(100) NOT NULL,
    email    VARCHAR(100) NOT NULL,
    telefone VARCHAR(20)  NOT NULL,
    cpf      VARCHAR(11)  NOT NULL UNIQUE,
    plano    VARCHAR(30)  NOT NULL
);

INSERT INTO aluno (nome, email, telefone, cpf, plano)
VALUES ('João Silva', 'joao@email.com', '11987654321', '12345678901', 'Mensal');

INSERT INTO aluno (nome, email, telefone, cpf, plano)
VALUES ('Maria Santos', 'maria@email.com', '11976543210', '23456789012', 'Trimestral');

INSERT INTO aluno (nome, email, telefone, cpf, plano)
VALUES ('Carlos Oliveira', 'carlos@email.com', '11965432109', '34567890123', 'Anual');
