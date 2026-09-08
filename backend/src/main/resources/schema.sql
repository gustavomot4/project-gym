CREATE TABLE aluno
(
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome     VARCHAR(100),
    email    VARCHAR(100),
    telefone VARCHAR(20),
    cpf      VARCHAR(11),
    plano    VARCHAR(30),
    ativo    BOOLEAN DEFAULT TRUE
);

INSERT INTO aluno (nome, email, telefone, cpf, plano, ativo)
VALUES ('João Silva', 'joao@email.com', '11987654321', '12345678901', 'Mensal', TRUE);

INSERT INTO aluno (nome, email, telefone, cpf, plano, ativo)
VALUES ('Maria Santos', 'maria@email.com', '11976543210', '23456789012', 'Trimestral', TRUE);

INSERT INTO aluno (nome, email, telefone, cpf, plano, ativo)
VALUES ('Carlos Oliveira', 'carlos@email.com', '11965432109', '34567890123', 'Anual', FALSE);