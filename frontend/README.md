# Gym — Front-end (Técnicas de Programação Web Front-End)

Cliente **React 19 + Vite** que cadastra e lista alunos de uma academia, consumindo a API
REST em `../backend`.

---

## Como executar

Pré-requisito: **Node.js 18+** (`node -v`).

```bash
cd frontend
npm install
npm run dev
```

A aplicação abre em **http://localhost:5173**.

> A API precisa estar rodando em `http://localhost:8080` **antes** de abrir a tela.
> Sem ela, a lista mostra *"Não foi possível carregar os alunos"* e o cadastro falha.
> Veja [`../backend/README.md`](../backend/README.md).

Outros comandos:

| Comando           | O que faz                          |
|-------------------|------------------------------------|
| `npm run dev`     | Servidor de desenvolvimento        |
| `npm run build`   | Build de produção em `dist/`       |
| `npm run preview` | Serve o build de produção          |
| `npm run lint`    | Análise estática com oxlint        |

---

## Estrutura

```
frontend/src/
├── main.jsx                    # ponto de entrada
├── App.jsx                     # monta a tela e conecta os componentes
├── App.css / index.css         # estilos globais (reset e tipografia)
└── componentes/
    ├── navbar/
    │   ├── NavBar.jsx
    │   └── NavBar.module.css
    ├── forms/
    │   ├── Form.jsx            # tela de CADASTRO  (POST /alunos)
    │   └── Form.module.css
    └── listaAluno/
        ├── ListaAlunos.jsx     # tela de CONSULTA  (GET /alunos)
        └── ListaAlunos.module.css
```

Cada componente tem seu próprio arquivo **CSS Module** (`*.module.css`), importado como
`styles` e aplicado via `className={styles.nomeDaClasse}`. Isso mantém as classes com
escopo local, sem colisão de nomes entre componentes.

---

## Componentes

### `App`

Guarda o estado `recarregar` e o compartilha entre os dois filhos. É ele que liga o
cadastro à consulta:

```jsx
const [recarregar, setRecarregar] = useState(0)

function aoCadastrarAluno() {
  setRecarregar(recarregar + 1)
}

<Form aoCadastrarAluno={aoCadastrarAluno} />
<ListaAlunos recarregar={recarregar} />
```

`aoCadastrarAluno` é um **callback**: o `App` entrega a função ao `Form`, e o `Form` a
chama de volta quando um aluno é cadastrado com sucesso. Isso muda `recarregar`, o que faz
a `ListaAlunos` buscar os dados de novo — a lista se atualiza sozinha, sem recarregar a
página.

### `Form` — cadastro

Formulário com **5 campos controlados**: nome, email, telefone, CPF e plano.

Cada campo tem seu estado, e o valor exibido vem dele (`value={nome}`), sendo atualizado a
cada tecla (`onChange={(e) => setNome(e.target.value)}`).

Antes de enviar, valida os campos no cliente (usando `filter` e `map` para juntar todos os
campos vazios numa única mensagem). Se passar, envia `POST /alunos` com
`JSON.stringify(...)` e `Content-Type: application/json`.

Trata os três estados da requisição:

| Estado       | O que aparece na tela                                          |
|--------------|----------------------------------------------------------------|
| `carregando` | Botão vira *"Enviando..."* e os campos ficam desabilitados      |
| `sucesso`    | Faixa verde com o nome do aluno cadastrado; os campos são limpos |
| `erro`       | Faixa vermelha com as mensagens devolvidas pela API             |

As mensagens de erro vêm do próprio servidor — a API responde
`{ "erros": ["..."] }`, e o componente as exibe:

```jsx
const corpo = await resposta.json().catch(() => null);
const mensagens = (corpo && corpo.erros) || [];
```

### `ListaAlunos` — consulta

Busca `GET /alunos` ao abrir a tela e sempre que a prop `recarregar` muda. Também tem um
botão **Atualizar** para recarregar sob demanda.

Renderiza os alunos com `map`, usando o `id` como `key`. Trata os mesmos três estados:
*Carregando alunos...*, mensagem de erro, ou *Nenhum aluno cadastrado ainda*.

Nenhum dado é estático — tudo o que aparece na tela veio da API.

### `NavBar`

Barra de navegação com o logotipo e os links da aplicação.

---

## Integração com a API

| Ação do usuário         | Requisição              | Componente    |
|-------------------------|-------------------------|---------------|
| Abrir a tela            | `GET /alunos`           | `ListaAlunos` |
| Clicar em *Atualizar*   | `GET /alunos`           | `ListaAlunos` |
| Clicar em *Enviar*      | `POST /alunos`          | `Form`        |

A URL da API está no topo de cada componente:

```js
const URL_API = 'http://localhost:8080/alunos';
```

Se a API rodar em outro endereço, ajuste essa constante em `Form.jsx` e em
`ListaAlunos.jsx` — e libere a nova origem no `@CrossOrigin` do back-end.

O contrato completo (endpoints, parâmetros, formatos e status) está em
[`../backend/README.md`](../backend/README.md).
