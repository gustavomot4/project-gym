import { useState } from 'react'
import NavBar from './componentes/navbar/NavBar'
import Form from './componentes/forms/Form'
import ListaAlunos from './componentes/listaAluno/ListaAlunos'
import './App.css'

function App() {
  // o estado vive no App porque os DOIS filhos dependem dele:
  // o Form muda o valor, a ListaAlunos reage à mudança
  const [recarregar, setRecarregar] = useState(0)

  // callback: o App entrega esta função ao Form, e o Form a "chama de volta"
  // quando um aluno é cadastrado com sucesso
  function aoCadastrarAluno() {
    setRecarregar(recarregar + 1)
  }

  return (
    <div>
      <NavBar />
      <Form aoCadastrarAluno={aoCadastrarAluno} />
      <ListaAlunos recarregar={recarregar} />
    </div>
  )
}

export default App
