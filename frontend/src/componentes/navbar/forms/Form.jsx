import styles from './Form.module.css';
function Form(){
    return(
        <div className={styles.form}>
            <h2>Preencha os dados</h2>
            <form>
                <div className={styles.inputGroup}>
                    <label htmlFor="nome">Nome</label>
                    <input type="text" id="nome" name="nome" />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="telefone">Telefone</label>
                    <input type="tel" id="telefone" name="telefone" />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="cpf">CPF</label>
                    <input type="text" id="cpf" name="cpf" />
                </div>
                <div className= {styles.inputGroup}>
                    <label htmlFor="endereco">Endereço</label>
                    <input type="text" id="endereco" name="endereco" />
                </div>
                <button type="submit">Enviar</button>
            </form>
        </div>
    )

}
export default Form;