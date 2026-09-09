-- ============================================================
--  Projeto Integrador - API Gym
--  Script de criação da tabela e carga inicial de dados
-- ============================================================
--
--  Banco utilizado: H2 (em memória), dialeto compatível com MySQL.
--
--  ATENÇÃO: a aplicação NÃO executa este arquivo.
--  Quem o Spring Boot executa automaticamente na subida é a cópia
--  em src/main/resources/schema.sql (por causa de spring.sql.init.mode=always).
--  Os dois arquivos têm o mesmo conteúdo e devem ser mantidos em sincronia.
--
--  Este script existe para documentar a estrutura do banco e para permitir
--  recriar a base manualmente em outro SGBD, se necessário.
-- ============================================================

DROP TABLE IF EXISTS aluno;

-- Recurso principal da aplicação: o aluno matriculado na academia.
CREATE TABLE aluno
(
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome     VARCHAR(100) NOT NULL,
    email    VARCHAR(100) NOT NULL,
    telefone VARCHAR(20)  NOT NULL,
    cpf      VARCHAR(11)  NOT NULL UNIQUE, -- regra de negócio: um CPF por aluno
    plano    VARCHAR(30)  NOT NULL         -- valores aceitos: Mensal, Trimestral, Anual
);

-- ------------------------------------------------------------
--  Carga inicial (para a tela de consulta não nascer vazia)
-- ------------------------------------------------------------

INSERT INTO aluno (nome, email, telefone, cpf, plano)
VALUES ('João Silva', 'joao@email.com', '11987654321', '12345678901', 'Mensal');

INSERT INTO aluno (nome, email, telefone, cpf, plano)
VALUES ('Maria Santos', 'maria@email.com', '11976543210', '23456789012', 'Trimestral');

INSERT INTO aluno (nome, email, telefone, cpf, plano)
VALUES ('Carlos Oliveira', 'carlos@email.com', '11965432109', '34567890123', 'Anual');
