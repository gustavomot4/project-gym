# API Gym — Back-end (Programação Web)

API REST em **Java 21 + Spring Boot 4.1.1 + JdbcTemplate** que gerencia o cadastro de
alunos de uma academia. É esta API que o cliente React (`../frontend`) consome.

---

## Sumário

- [Como executar](#como-executar)
- [Banco de dados](#banco-de-dados)
- [Contrato da API](#contrato-da-api)
  - [GET /alunos](#get-alunos)
  - [GET /alunos/{id}](#get-alunosid)
  - [POST /alunos](#post-alunos)
- [Regras de negócio e validação](#regras-de-negócio-e-validação)
- [Códigos de status](#códigos-de-status)
- [CORS](#cors)
- [Estrutura do projeto](#estrutura-do-projeto)

---

## Como executar

Pré-requisito: **JDK 21** instalado (`java -version`).

Não é preciso instalar o Maven — o projeto usa o wrapper (`mvnw`).

```bash
cd backend
./mvnw spring-boot:run
```

No Windows (PowerShell / cmd):

```bash
cd backend
mvnw.cmd spring-boot:run
```

A API sobe em **http://localhost:8080**. Para conferir:

```bash
curl http://localhost:8080/alunos
```

> Se a porta 8080 já estiver ocupada, a aplicação falha com
> `Port 8080 was already in use`. Encerre o processo anterior antes de subir de novo.

---

## Banco de dados

**H2 em memória** — nenhuma instalação necessária.

Na subida, o Spring Boot executa `src/main/resources/schema.sql`, que recria a tabela
`aluno` e carrega 3 alunos de exemplo.

> **Importante:** por ser em memória, os dados existem apenas enquanto a aplicação está
> rodando. A cada restart o banco volta aos 3 registros iniciais.

O mesmo script está em [`script.sql`](script.sql) na raiz do back-end, para documentação
e para recriar a base manualmente em outro SGBD.

### Tabela `aluno`

| Coluna     | Tipo           | Restrições                  | Descrição                          |
|------------|----------------|-----------------------------|------------------------------------|
| `id`       | `BIGINT`       | PK, `AUTO_INCREMENT`        | Identificador gerado pelo banco    |
| `nome`     | `VARCHAR(100)` | `NOT NULL`                  | Nome completo do aluno             |
| `email`    | `VARCHAR(100)` | `NOT NULL`                  | E-mail de contato                  |
| `telefone` | `VARCHAR(20)`  | `NOT NULL`                  | Telefone com DDD, só dígitos       |
| `cpf`      | `VARCHAR(11)`  | `NOT NULL`, **`UNIQUE`**    | CPF, só dígitos                    |
| `plano`    | `VARCHAR(30)`  | `NOT NULL`                  | `Mensal`, `Trimestral` ou `Anual`  |

### Console do H2

Com a aplicação rodando, acesse **http://localhost:8080/h2-console**:

| Campo    | Valor                |
|----------|----------------------|
| JDBC URL | `jdbc:h2:mem:db_gym` |
| User     | `sa`                 |
| Password | *(em branco)*        |

---

## Contrato da API

**URL base:** `http://localhost:8080`
**Formato:** JSON (`Content-Type: application/json`) em requisições e respostas.

### Representação do recurso `Aluno`

```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11987654321",
  "cpf": "12345678901",
  "plano": "Mensal"
}
```

### Representação de erro

Toda resposta de erro (400, 404, 409) segue o mesmo formato — uma lista, porque uma única
requisição pode violar várias regras ao mesmo tempo:

```json
{
  "erros": ["O CPF deve ter exatamente 11 dígitos."]
}
```

---

### `GET /alunos`

Lista todos os alunos cadastrados, ordenados por `id`. Alimenta a tela de consulta do
cliente.

**Parâmetros:** nenhum.

**Requisição**

```bash
curl http://localhost:8080/alunos
```

**Resposta — `200 OK`**

```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "11987654321",
    "cpf": "12345678901",
    "plano": "Mensal"
  },
  {
    "id": 2,
    "nome": "Maria Santos",
    "email": "maria@email.com",
    "telefone": "11976543210",
    "cpf": "23456789012",
    "plano": "Trimestral"
  },
  {
    "id": 3,
    "nome": "Carlos Oliveira",
    "email": "carlos@email.com",
    "telefone": "11965432109",
    "cpf": "34567890123",
    "plano": "Anual"
  }
]
```

Quando não há nenhum aluno, a resposta é `200 OK` com uma lista vazia: `[]`.

| Status   | Quando ocorre                |
|----------|------------------------------|
| `200 OK` | Consulta realizada com êxito |

---

### `GET /alunos/{id}`

Busca um aluno específico pelo identificador.

**Parâmetros de rota**

| Parâmetro | Tipo      | Obrigatório | Descrição       |
|-----------|-----------|-------------|-----------------|
| `id`      | `Integer` | Sim         | Id do aluno     |

**Requisição**

```bash
curl http://localhost:8080/alunos/1
```

**Resposta — `200 OK`**

```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11987654321",
  "cpf": "12345678901",
  "plano": "Mensal"
}
```

**Resposta — `404 Not Found`** (id inexistente)

```bash
curl http://localhost:8080/alunos/999
```

```json
{
  "erros": ["Aluno de id 999 não encontrado."]
}
```

| Status          | Quando ocorre                    |
|-----------------|----------------------------------|
| `200 OK`        | Aluno encontrado                 |
| `404 Not Found` | Não existe aluno com aquele `id` |

---

### `POST /alunos`

Cadastra um novo aluno e persiste no banco.

**Corpo da requisição**

| Campo      | Tipo     | Obrigatório | Regra                                           |
|------------|----------|-------------|-------------------------------------------------|
| `nome`     | `String` | Sim         | 3 a 100 caracteres                              |
| `email`    | `String` | Sim         | Formato válido, até 100 caracteres              |
| `telefone` | `String` | Sim         | Só dígitos, 10 ou 11 (com DDD)                  |
| `cpf`      | `String` | Sim         | Só dígitos, exatamente 11, **único** no sistema |
| `plano`    | `String` | Sim         | `Mensal`, `Trimestral` ou `Anual`               |

O campo `id` **não** deve ser enviado — é gerado pelo banco e devolvido na resposta.

**Requisição**

```bash
curl -X POST http://localhost:8080/alunos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Ana Souza",
    "email": "ana@email.com",
    "telefone": "11955554444",
    "cpf": "45678901234",
    "plano": "Anual"
  }'
```

**Resposta — `201 Created`** (com o `id` gerado)

```json
{
  "id": 4,
  "nome": "Ana Souza",
  "email": "ana@email.com",
  "telefone": "11955554444",
  "cpf": "45678901234",
  "plano": "Anual"
}
```

**Resposta — `400 Bad Request`** (dados inválidos)

```bash
curl -X POST http://localhost:8080/alunos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Jo","email":"invalido","telefone":"abc","cpf":"111.222.333-44","plano":"Ouro"}'
```

```json
{
  "erros": [
    "O nome deve ter entre 3 e 100 caracteres.",
    "O email informado é inválido.",
    "O telefone deve conter apenas números.",
    "O CPF deve conter apenas números, sem pontos ou traços.",
    "O plano deve ser um destes: Mensal, Trimestral, Anual."
  ]
}
```

Com o corpo vazio (`{}`), todos os campos obrigatórios são reportados:

```json
{
  "erros": [
    "O nome é obrigatório.",
    "O email é obrigatório.",
    "O telefone é obrigatório.",
    "O CPF é obrigatório.",
    "O plano é obrigatório."
  ]
}
```

**Resposta — `409 Conflict`** (CPF já cadastrado)

```json
{
  "erros": ["Já existe um aluno cadastrado com este CPF."]
}
```

| Status             | Quando ocorre                                |
|--------------------|----------------------------------------------|
| `201 Created`      | Aluno cadastrado e persistido                |
| `400 Bad Request`  | Algum campo viola as regras de validação     |
| `409 Conflict`     | Já existe um aluno com o CPF informado       |

---

## Regras de negócio e validação

Toda validação roda **no servidor**, dentro de `AlunoController`. Nenhum dado chega ao
banco sem passar por ela — a requisição é recusada mesmo vindo direto do Postman, do
Insomnia ou do curl, sem passar pelo formulário do cliente.

Antes de validar, a API normaliza os campos removendo espaços das pontas (`trim`).

| Campo      | Regras aplicadas                                                                 |
|------------|----------------------------------------------------------------------------------|
| `nome`     | Obrigatório; entre 3 e 100 caracteres                                            |
| `email`    | Obrigatório; precisa ter texto antes do `@`, um `.` depois dele, um único `@`, nenhum espaço e não terminar em `.`; máximo 100 caracteres |
| `telefone` | Obrigatório; apenas dígitos; 10 ou 11 dígitos                                    |
| `cpf`      | Obrigatório; apenas dígitos; exatamente 11; não pode ter todos os dígitos iguais; **não pode se repetir no banco** |
| `plano`    | Obrigatório; precisa ser exatamente `Mensal`, `Trimestral` ou `Anual`            |

As mensagens são **acumuladas**: uma requisição com cinco problemas devolve os cinco de
uma vez, e não apenas o primeiro.

> A unicidade do CPF é garantida em dois níveis: pela checagem na API (que devolve o
> `409` com mensagem clara) e pela constraint `UNIQUE` na coluna.

---

## Códigos de status

| Código             | Uso nesta API                                        |
|--------------------|------------------------------------------------------|
| `200 OK`           | `GET /alunos` e `GET /alunos/{id}` com sucesso       |
| `201 Created`      | `POST /alunos` com sucesso                           |
| `400 Bad Request`  | Corpo ausente ou campos que violam as regras         |
| `404 Not Found`    | `GET /alunos/{id}` com id inexistente                |
| `409 Conflict`     | `POST /alunos` com CPF já cadastrado                 |

---

## CORS

O cliente React roda em outra origem (porta 5173), então o controller libera
explicitamente essas origens:

```java
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
```

> Se você rodar o front em outra porta, acrescente-a nessa lista em
> `AlunoController.java`, senão o navegador bloqueia as requisições.

---

## Estrutura do projeto

```
backend/
├── src/main/java/sptech/school/api_gym/
│   ├── ApiGymApplication.java   # ponto de entrada do Spring Boot
│   ├── Aluno.java               # representação do recurso
│   └── AlunoController.java     # endpoints, validação e acesso ao banco
├── src/main/resources/
│   ├── application.properties   # conexão com o H2 e console web
│   └── schema.sql               # DDL + carga inicial (executado na subida)
├── script.sql                   # cópia do DDL para documentação
└── pom.xml
```

### Dependências

Apenas as fornecidas no projeto inicial — nenhuma biblioteca externa foi acrescentada:

- `spring-boot-starter-webmvc` — endpoints REST
- `spring-boot-starter-jdbc` — `JdbcTemplate`
- `spring-boot-h2console` / `h2` — banco relacional em memória
- `spring-boot-devtools` — restart automático em desenvolvimento

A validação é feita em Java puro, sem Bean Validation, justamente para respeitar essa
restrição.
