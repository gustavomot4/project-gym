import { useState, useEffect } from 'react';
import styles from './ListaAlunos.module.css';

function ListaAlunos({ recarregar }) {
    const [alunos, setAlunos] = useState([]);
    const [carregando, setCarregando] = useState(false);

    // Função GET para buscar os alunos na API
    async function buscarAlunos() {
        setCarregando(true);
        try {
            const resposta = await fetch('http://localhost:8080/alunos');
            if (resposta.ok) {
                const dados = await resposta.json();
                setAlunos(dados);
            }
        } catch (erro) {
            console.error('Erro ao buscar alunos:', erro.message);
        } finally {
            setCarregando(false);
        }
    }

    // Executa ao carregar e sempre que 'recarregar' mudar
    useEffect(() => {
        buscarAlunos();
    }, [recarregar]);

    return (
        <div className={styles.container}>
            <h2>Alunos Cadastrados</h2>

            {carregando && <p className={styles.statusTexto}>Carregando alunos...</p>}

            {!carregando && alunos.length === 0 && (
                <p className={styles.statusTexto}>Nenhum aluno cadastrado ainda.</p>
            )}

            {!carregando && alunos.length > 0 && (
                <div className={styles.listaGrid}>
                    {alunos.map((aluno) => (
                        <div key={aluno.id || aluno.cpf} className={styles.alunoCard}>
                            <h3>{aluno.nome}</h3>
                            <p><strong>Email:</strong> {aluno.email}</p>
                            <p><strong>Telefone:</strong> {aluno.telefone}</p>
                            <p><strong>CPF:</strong> {aluno.cpf}</p>
                            <p><strong>Plano:</strong> {aluno.plano}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ListaAlunos;