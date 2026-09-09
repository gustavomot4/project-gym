import { useState, useEffect } from 'react';
import styles from './ListaAlunos.module.css';

const URL_API = 'http://localhost:8080/alunos';

// props é um objeto -> abrimos com chaves (desestruturação)
function ListaAlunos({ recarregar }) {

    // os três estados do ciclo de uma Promise: dados / carregando / erro
    const [alunos, setAlunos] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    async function buscarAlunos() {
        setCarregando(true);
        setErro('');

        try {
            const resposta = await fetch(URL_API);

            if (!resposta.ok) {
                throw new Error(`Erro ${resposta.status}`);
            }

            const dados = await resposta.json();
            setAlunos(dados);

        } catch (e) {
            console.error('Falhou:', e.message);
            setErro('Não foi possível carregar os alunos. O servidor está rodando?');
            setAlunos([]);
        } finally {
            setCarregando(false);
        }
    }

    // busca ao abrir a tela e sempre que o App avisar que houve um cadastro novo
    useEffect(() => {
        buscarAlunos();
    }, [recarregar]);

    // a lista está vazia de verdade? (não confundir com "ainda carregando")
    const listaVazia = !carregando && !erro && alunos.length === 0;

    return (
        <div className={styles.container}>
            <div className={styles.cabecalho}>
                <h2>Alunos Cadastrados</h2>
                <button onClick={buscarAlunos} disabled={carregando}>
                    {carregando ? 'Atualizando...' : 'Atualizar'}
                </button>
            </div>

            {/* && exibe cada estado sob demanda */}
            {carregando && <p className={styles.statusTexto}>Carregando alunos...</p>}

            {erro && <p className={styles.erro}>{erro}</p>}

            {listaVazia && (
                <p className={styles.statusTexto}>Nenhum aluno cadastrado ainda.</p>
            )}

            {alunos.length > 0 && (
                <p className={styles.contador}>
                    {alunos.length} {alunos.length === 1 ? 'aluno' : 'alunos'}
                </p>
            )}

            {/* map devolve um vetor de JSX; a key identifica cada item */}
            <div className={styles.listaGrid}>
                {alunos.map((aluno) => (
                    <div key={aluno.id} className={styles.alunoCard}>
                        <h3>{aluno.nome || 'Sem nome'}</h3>
                        <p><strong>Email:</strong> {aluno.email}</p>
                        <p><strong>Telefone:</strong> {aluno.telefone}</p>
                        <p><strong>CPF:</strong> {aluno.cpf}</p>
                        <p><strong>Plano:</strong> {aluno.plano}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ListaAlunos;
