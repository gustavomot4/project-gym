package sptech.school.api_gym;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/alunos")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AlunoController {

    // regra de negócio: a academia só trabalha com estes três planos
    private static final List<String> PLANOS_VALIDOS = List.of("Mensal", "Trimestral", "Anual");

    private final JdbcTemplate jdbcTemplate;

    public AlunoController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Aluno>> listarAlunos() {
        String sql = "SELECT id, nome, email, telefone, cpf, plano FROM aluno ORDER BY id";
        List<Aluno> alunos = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Aluno.class));

        return ResponseEntity.status(200).body(alunos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> listarAlunoPeloId(@PathVariable Integer id) {
        String sql = "SELECT id, nome, email, telefone, cpf, plano FROM aluno WHERE id = ?";

        try {
            Aluno aluno = jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(Aluno.class), id);
            return ResponseEntity.status(200).body(aluno);

        } catch (EmptyResultDataAccessException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("erros", List.of("Aluno de id " + id + " não encontrado.")));
        }
    }

    @PostMapping
    public ResponseEntity<?> criarAluno(@RequestBody Aluno aluno) {

        if (aluno == null) {
            return ResponseEntity.status(400)
                    .body(Map.of("erros", List.of("O corpo da requisição é obrigatório.")));
        }

        // 1) remove espaços das pontas antes de qualquer checagem
        normalizar(aluno);

        // 2) valida formato e regras de negócio
        List<String> erros = validar(aluno);

        if (!erros.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("erros", erros));
        }

        // 3) regra de negócio: o CPF não pode se repetir
        String sqlVerificar = "SELECT COUNT(*) FROM aluno WHERE cpf = ?";
        Integer quantidade = jdbcTemplate.queryForObject(sqlVerificar, Integer.class, aluno.getCpf());

        if (quantidade != null && quantidade > 0) {
            return ResponseEntity.status(409)
                    .body(Map.of("erros", List.of("Já existe um aluno cadastrado com este CPF.")));
        }

        // 4) persiste
        String sql = "INSERT INTO aluno (nome, email, telefone, cpf, plano) VALUES (?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, aluno.getNome(), aluno.getEmail(),
                aluno.getTelefone(), aluno.getCpf(), aluno.getPlano());

        // 5) devolve o recurso criado COM o id gerado pelo banco
        //    (o CPF é único, então ele identifica com segurança a linha recém-inserida)
        String sqlId = "SELECT id FROM aluno WHERE cpf = ?";
        Integer idGerado = jdbcTemplate.queryForObject(sqlId, Integer.class, aluno.getCpf());
        aluno.setId(idGerado);

        return ResponseEntity.status(201).body(aluno);
    }

    private void normalizar(Aluno aluno) {
        if (aluno.getNome() != null) aluno.setNome(aluno.getNome().trim());
        if (aluno.getEmail() != null) aluno.setEmail(aluno.getEmail().trim());
        if (aluno.getTelefone() != null) aluno.setTelefone(aluno.getTelefone().trim());
        if (aluno.getCpf() != null) aluno.setCpf(aluno.getCpf().trim());
        if (aluno.getPlano() != null) aluno.setPlano(aluno.getPlano().trim());
    }

    /**
     * Devolve a lista de problemas encontrados. Lista vazia significa que o aluno é válido.
     * Todas as checagens rodam no servidor, então a requisição é recusada mesmo que venha
     * do Postman, do Insomnia ou do curl, sem passar pelo formulário do cliente.
     */
    private List<String> validar(Aluno aluno) {
        List<String> erros = new ArrayList<>();

        // nome
        if (estaVazio(aluno.getNome())) {
            erros.add("O nome é obrigatório.");
        } else if (aluno.getNome().length() < 3 || aluno.getNome().length() > 100) {
            erros.add("O nome deve ter entre 3 e 100 caracteres.");
        }

        // email
        if (estaVazio(aluno.getEmail())) {
            erros.add("O email é obrigatório.");
        } else if (!emailValido(aluno.getEmail())) {
            erros.add("O email informado é inválido.");
        } else if (aluno.getEmail().length() > 100) {
            erros.add("O email deve ter no máximo 100 caracteres.");
        }

        // telefone
        if (estaVazio(aluno.getTelefone())) {
            erros.add("O telefone é obrigatório.");
        } else if (!apenasDigitos(aluno.getTelefone())) {
            erros.add("O telefone deve conter apenas números.");
        } else if (aluno.getTelefone().length() < 10 || aluno.getTelefone().length() > 11) {
            erros.add("O telefone deve ter 10 ou 11 dígitos, incluindo o DDD.");
        }

        // cpf
        if (estaVazio(aluno.getCpf())) {
            erros.add("O CPF é obrigatório.");
        } else if (!apenasDigitos(aluno.getCpf())) {
            erros.add("O CPF deve conter apenas números, sem pontos ou traços.");
        } else if (aluno.getCpf().length() != 11) {
            erros.add("O CPF deve ter exatamente 11 dígitos.");
        } else if (todosDigitosIguais(aluno.getCpf())) {
            erros.add("O CPF informado é inválido.");
        }

        // plano
        if (estaVazio(aluno.getPlano())) {
            erros.add("O plano é obrigatório.");
        } else if (!PLANOS_VALIDOS.contains(aluno.getPlano())) {
            erros.add("O plano deve ser um destes: " + String.join(", ", PLANOS_VALIDOS) + ".");
        }

        return erros;
    }

    private boolean estaVazio(String texto) {
        return texto == null || texto.isBlank();
    }

    private boolean emailValido(String email) {
        int arroba = email.indexOf('@');

        // precisa ter algo antes do @, um ponto depois dele e nada de espaços
        return arroba > 0
                && email.indexOf('.', arroba) > arroba + 1
                && !email.endsWith(".")
                && email.indexOf(' ') == -1
                && email.lastIndexOf('@') == arroba;
    }

    private boolean apenasDigitos(String texto) {
        for (int i = 0; i < texto.length(); i++) {
            if (!Character.isDigit(texto.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    private boolean todosDigitosIguais(String cpf) {
        for (int i = 1; i < cpf.length(); i++) {
            if (cpf.charAt(i) != cpf.charAt(0)) {
                return false;
            }
        }
        return true;
    }
}
