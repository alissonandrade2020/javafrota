package br.com.portfolio.frota.veiculo;

import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class VeiculoController {
    private final VeiculoRepository repository;
    public VeiculoController(VeiculoRepository repository){this.repository=repository;}

    @GetMapping("/health") public Map<String,String> health(){return Map.of("status","UP","service","frota-api");}
    @GetMapping("/veiculos") public List<Veiculo> listar(@RequestParam(defaultValue="") String q,
            @RequestParam(defaultValue="") String status){return repository.pesquisar(q.trim(),status.trim().toUpperCase());}
    @GetMapping("/veiculos/{id}") public Veiculo buscar(@PathVariable Long id){return repository.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Veículo não encontrado"));}
    @PostMapping("/veiculos") @ResponseStatus(HttpStatus.CREATED)
    public Veiculo criar(@Valid @RequestBody VeiculoRequest r){return salvar(null,r);}
    @PutMapping("/veiculos/{id}") public Veiculo atualizar(@PathVariable Long id,@Valid @RequestBody VeiculoRequest r){
        Veiculo v=repository.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Veículo não encontrado"));
        v.atualizar(r.marca().trim(),r.modelo().trim(),r.ano(),r.placaNormalizada(),r.status());
        return persistir(v);
    }
    @DeleteMapping("/veiculos/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id){if(!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Veículo não encontrado"); repository.deleteById(id);}
    @GetMapping("/dashboard") public Map<String,Long> dashboard(){return Map.of("total",repository.count(),"ativos",repository.countByStatus("ATIVO"),"manutencao",repository.countByStatus("MANUTENCAO"),"inativos",repository.countByStatus("INATIVO"));}
    private Veiculo salvar(Long id, VeiculoRequest r){return persistir(new Veiculo(r.marca().trim(),r.modelo().trim(),r.ano(),r.placaNormalizada(),r.status()));}
    private Veiculo persistir(Veiculo v){try{return repository.save(v);}catch(DataIntegrityViolationException e){throw new ResponseStatusException(HttpStatus.CONFLICT,"Já existe um veículo com essa placa");}}
}
