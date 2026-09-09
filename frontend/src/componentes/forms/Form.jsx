import { useState } from 'react';
import styles from './Form.module.css';

const URL_API = 'http://localhost:8080/alunos';

// props é um objeto -> abrimos com chaves (desestruturação)
function Form({ aoCadastrarAluno }) {

    // cada campo controlado tem seu próprio estado
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [cpf, setCpf] = useState('');
    const [plano, setPlano] = useState('Mensal');

    // os três estados do ciclo de uma Promise: carregando / sucesso / erro
    const [carregando, setCarregando] = useState(false);
    const [sucesso, setSucesso] = useState('');
    const [erro, setErro] = useState('');

    // devolve a mensagem de erro encontrada, ou '' quando está tudo certo
    function validarCampos() {
        const campos = [
            { rotulo: 'Nome', valor: nome },
            { rotulo: 'E-mail', valor: email },
            { rotulo: 'Telefone', valor: telefone },
            { rotulo: 'CPF', valor: cpf },
            { rotulo: 'Plano', valor: plano }
        ];

        // filter seleciona só os campos vazios; map transforma cada um no seu rótulo
        const vazios = campos
            .filter((campo) => campo.valor.trim() === '')
            .map((campo) => campo.rotulo);

        if (vazios.length > 0) {
            return `Preencha os campos: ${vazios.join(', ')}.`;
        }

        if (!email.includes('@')) {
            return 'Informe um e-mail válido.';
        }

        if (cpf.trim().length !== 11) {
            return 'O CPF deve ter 11 dígitos, apenas números.';
        }

        if (telefone.trim().length < 10) {
            return 'O telefone deve ter DDD + número.';
        }

        return '';
    }

    function limparCampos() {
        setNome('');
        setEmail('');
        setTelefone('');
        setCpf('');
        setPlano('Mensal');
    }

    async function cadastrar() {
        // toda tentativa começa zerando as mensagens da tentativa anterior
        setSucesso('');
        setErro('');

        const mensagemDeErro = validarCampos();

        if (mensagemDeErro) {
            setErro(mensagemDeErro);
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch(URL_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    telefone: telefone,
                    cpf: cpf,
                    plano: plano
                })
            });

            // status fora de 200-299: o servidor recusou
            if (!resposta.ok) {
                // a API responde { "erros": ["mensagem 1", "mensagem 2"] }
                const corpo = await resposta.json().catch(() => null);
                const mensagens = (corpo && corpo.erros) || [];

                setErro(
                    mensagens.length > 0
                        ? mensagens.join(' ')
                        : `Erro ${resposta.status} ao cadastrar.`
                );
                return;
            }

            const alunoCriado = await resposta.json();

            setSucesso(`Aluno ${alunoCriado.nome} cadastrado com sucesso!`);
            limparCampos();

            // chama de volta o App, que manda a lista buscar os dados de novo
            aoCadastrarAluno();

        } catch (e) {
            console.error('Falhou:', e.message);
            setErro('Não foi possível conectar ao servidor. Ele está rodando?');
        } finally {
            // sai do "carregando" tanto no sucesso quanto na falha
            setCarregando(false);
        }
    }

    return (
        <div className={styles.form}>
            <h2>Preencha os dados</h2>

            <div className={styles.inputGroup}>
                <label htmlFor="nome">Nome</label>
                <input
                    type="text"
                    id="nome"
                    name="nome"
                    placeholder="Nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={carregando}
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="aluno@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={carregando}
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="telefone">Telefone</label>
                <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    placeholder="11987654321"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    disabled={carregando}
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="cpf">CPF</label>
                <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    placeholder="Somente números"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    disabled={carregando}
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="plano">Plano</label>
                <select
                    id="plano"
                    name="plano"
                    value={plano}
                    onChange={(e) => setPlano(e.target.value)}
                    disabled={carregando}
                >
                    <option value="Mensal">Mensal</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Anual">Anual</option>
                </select>
            </div>

            {/* o botão fica bloqueado enquanto a requisição não termina */}
            <button onClick={cadastrar} disabled={carregando}>
                {carregando ? 'Enviando...' : 'Enviar'}
            </button>

            {/* && mostra a mensagem só quando ela existe */}
            {erro && <p className={styles.erro}>{erro}</p>}
            {sucesso && <p className={styles.sucesso}>{sucesso}</p>}
        </div>
    );
}

export default Form;
