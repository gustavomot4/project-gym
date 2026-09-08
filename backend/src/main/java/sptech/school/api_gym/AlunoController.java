
package sptech.school.api_gym;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alunos")
@CrossOrigin(origins = "http://localhost:5173")
public class AlunoController {

    private final JdbcTemplate jdbcTemplate;

    public AlunoController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Aluno>> listarAlunos() {
        String sql = "SELECT * FROM aluno";
        List<Aluno> alunos = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Aluno.class));

        return ResponseEntity.status(200).body(alunos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aluno> listarAlunoPeloId(@PathVariable Integer id) {
        String sql = "SELECT * FROM aluno WHERE id = ? ";
        try {
            Aluno aluno = jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(Aluno.class), id);

            return ResponseEntity.status(200).body(aluno);
        } catch (EmptyResultDataAccessException e) {
            return ResponseEntity.status(404).build();
        }
    }

    @PostMapping
    public ResponseEntity<Aluno> criarAluno(@RequestBody Aluno aluno) {

        if (aluno.getNome() == null || aluno.getNome().isBlank() || aluno.getEmail() == null
                || aluno.getEmail().isBlank() || aluno.getTelefone() == null || aluno.getTelefone().isBlank()
                || aluno.getCpf() == null || aluno.getCpf().isBlank() || aluno.getPlano() == null
                || aluno.getPlano().isBlank() ) {

            return ResponseEntity.status(400).build();
        }

        String sqlVerificar = "SELECT COUNT(*) FROM aluno WHERE cpf = ?";
        Integer quantidade = jdbcTemplate.queryForObject(sqlVerificar, Integer.class, aluno.getCpf());

        if (quantidade > 0) {
            return ResponseEntity.status(409).build();
        }

        String sql = "INSERT INTO aluno (nome, email, telefone, cpf , plano ) VALUES (?, ?, ?, ? , ?)";
        jdbcTemplate.update(sql, aluno.getNome(), aluno.getEmail(),
                aluno.getTelefone(), aluno.getCpf(), aluno.getPlano());

        return ResponseEntity.status(201).body(aluno);
    }
}
