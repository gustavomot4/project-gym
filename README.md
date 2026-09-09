# Project Gym — Projeto Integrador

Sistema de cadastro de alunos de uma academia, dividido em dois projetos que conversam
entre si:

- **`backend/`** — API REST em Java + Spring Boot + JdbcTemplate *(Programação Web)*
- **`frontend/`** — Cliente React + Vite *(Técnicas de Programação Web Front-End)*

O usuário cadastra um aluno pelo formulário React; o dado viaja por HTTP até a API, que
valida, aplica as regras de negócio e persiste no banco. A tela de consulta lê esses dados
de volta pela própria API — nada é estático ou simulado.

---

## Estrutura do repositório

```
project-gym/
├── frontend/                 # cliente React (porta 5173)
│   ├── src/
│   │   ├── App.jsx
│   │   └── componentes/      # NavBar, Form, ListaAlunos (+ CSS Modules)
│   ├── package.json
│   └── README.md             # documentação do cliente
│
├── backend/                  # API REST (porta 8080)
│   ├── src/
│   │   ├── main/java/sptech/school/api_gym/
│   │   │   ├── ApiGymApplication.java
│   │   │   ├── Aluno.java
│   │   │   └── AlunoController.java
│   │   └── main/resources/
│   │       ├── application.properties
│   │       └── schema.sql
│   ├── script.sql            # script SQL de criação da tabela
│   ├── pom.xml
│   └── README.md             # documentação completa da API
│
└── README.md                 # este arquivo
```

---

## Como executar

São **dois terminais**, e a ordem importa: a API precisa estar no ar antes do cliente.

### 1. API (back-end)

Pré-requisito: **JDK 21**.

```bash
cd backend
./mvnw spring-boot:run
```

No Windows, use `mvnw.cmd spring-boot:run`.

Sobe em **http://localhost:8080**. Para conferir:

```bash
curl http://localhost:8080/alunos
```

Não é preciso instalar nem configurar banco: o H2 roda em memória e o `schema.sql` cria a
tabela e carrega 3 alunos de exemplo automaticamente na subida.

### 2. Cliente (front-end)

Pré-requisito: **Node.js 18+**.

```bash
cd frontend
npm install
npm run dev
```

Abre em **http://localhost:5173**.

---

## Como o cliente se comunica com a API

O cliente usa `fetch` para falar com `http://localhost:8080/alunos`.

| Ação na tela            | Método | Endpoint       | Resultado                                  |
|-------------------------|--------|----------------|--------------------------------------------|
| Abrir a página          | `GET`  | `/alunos`      | A lista é preenchida com os alunos do banco |
| Clicar em *Atualizar*   | `GET`  | `/alunos`      | A lista é recarregada                       |
| Preencher e *Enviar*    | `POST` | `/alunos`      | O aluno é validado, gravado e a lista se atualiza sozinha |

### O ciclo completo de um cadastro

1. O usuário digita nos 5 campos controlados do `Form` — cada tecla atualiza o estado.
2. O `Form` valida os campos no cliente e, se estiverem certos, envia `POST /alunos` com o
   corpo em JSON.
3. A API valida **de novo, no servidor**, aplica as regras de negócio e grava no banco.
4. A API responde `201 Created` com o aluno criado e o `id` gerado — ou `400`/`409` com a
   lista de erros.
5. Em caso de sucesso, o `Form` chama o callback `aoCadastrarAluno`, que o `App` usa para
   avisar a `ListaAlunos`.
6. A `ListaAlunos` refaz o `GET /alunos` e a tela mostra o aluno recém-cadastrado — sem
   recarregar a página.

### Por que a validação existe nos dois lados

No cliente ela é conveniência: avisa o usuário na hora, sem ida à rede.
No servidor ela é a que vale — uma requisição inválida é recusada mesmo vindo direto do
Postman, do Insomnia ou do curl, sem passar pelo formulário.

### CORS

Cliente e API rodam em origens diferentes (`5173` e `8080`), então o `AlunoController`
libera a origem do cliente com `@CrossOrigin`. Se você mudar a porta do front, atualize
essa anotação.

---

## Resumo do contrato

**URL base:** `http://localhost:8080` — JSON em requisições e respostas.

| Método | Endpoint       | Descrição                    | Status possíveis    |
|--------|----------------|------------------------------|---------------------|
| `GET`  | `/alunos`      | Lista todos os alunos        | `200`               |
| `GET`  | `/alunos/{id}` | Busca um aluno pelo id       | `200`, `404`        |
| `POST` | `/alunos`      | Cadastra um aluno            | `201`, `400`, `409` |

**Recurso `Aluno`:**

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

**Erros** (`400`, `404`, `409`) seguem sempre o mesmo formato:

```json
{
  "erros": ["O CPF deve ter exatamente 11 dígitos."]
}
```

**Exemplo de cadastro:**

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

> **Documentação completa** — todos os endpoints, parâmetros, regras de validação e
> exemplos de erro: [`backend/README.md`](backend/README.md).
> Detalhes dos componentes React: [`frontend/README.md`](frontend/README.md).

---

## Banco de dados

**H2 em memória** — sem instalação.

O script de criação da tabela está em [`backend/script.sql`](backend/script.sql) (e sua
cópia executável em `backend/src/main/resources/schema.sql`, que o Spring Boot roda
automaticamente na subida).

Console web, com a API rodando: **http://localhost:8080/h2-console**
JDBC URL `jdbc:h2:mem:db_gym` · usuário `sa` · senha em branco.

> Por ser em memória, os dados duram enquanto a aplicação estiver rodando. A cada restart
> a tabela é recriada com os 3 alunos de exemplo.

---

## Tecnologias

**Back-end** — Java 21, Spring Boot 4.1.1, Spring Web MVC, `JdbcTemplate`, H2, Maven.
Nenhuma biblioteca externa além das fornecidas no projeto inicial; a validação é feita em
Java puro.

**Front-end** — React 19, Vite, CSS Modules, `fetch` nativo. Sem bibliotecas de requisição
ou de estilo.
