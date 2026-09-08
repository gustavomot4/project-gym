import { useState } from 'react';
import styles from './Form.module.css';

function Form() {

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [cpf, setCpf] = useState('');
    const [plano, setPlano] = useState('mensal');

    const [mensagem, setMensagem] = useState('');

    async function cadastrar() {
        setMensagem(''); 

        try {
            const resposta = await fetch('http://localhost:8080/alunos', {
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

            if (!resposta.ok) {
                if (resposta.status === 409) {
                    setMensagem('Erro: CPF já cadastrado.');
                } else if (resposta.status === 400) {
                    setMensagem('Erro: Preencha todos os campos corretamente.');
                } else {
                    setMensagem(`Erro na requisição: Status ${resposta.status}`);
                }
                return;
            }

            const dados = await resposta.json();
            setMensagem('Aluno cadastrado com sucesso!');

            setNome('');
            setEmail('');
            setTelefone('');
            setCpf('');
            setPlano('mensal');

        } catch (erro) {
            console.error('Falhou:', erro.message);
            setMensagem('Erro de conexão com o servidor.');
        }
    }

    return (
        <div className={styles.form}>
            <h2>Preencha os dados</h2>
            
            {}
            <div className={styles.inputGroup}>
                <label htmlFor="nome">Nome</label>
                <input 
                    type="text" 
                    id="nome" 
                    name="nome" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="telefone">Telefone</label>
                <input 
                    type="tel" 
                    id="telefone" 
                    name="telefone" 
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="cpf">CPF</label>
                <input 
                    type="text" 
                    id="cpf" 
                    name="cpf" 
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="plano">Plano</label>
                <select 
                    id="plano" 
                    name="plano" 
                    value={plano}
                    onChange={(e) => setPlano(e.target.value)}
                >
                    <option value="mensal">Mensal</option>
                    <option value="timestral">Timestral</option>
                    <option value="anual">Anual</option>
                </select>
            </div>

            {}
            <button onClick={cadastrar}>Enviar</button>

            {}
            {mensagem && <p>{mensagem}</p>}
        </div>
    );
}

export default Form;