package br.com.portfolio.frota.veiculo;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class VeiculoController {
    private final VeiculoService veiculos;

    public VeiculoController(VeiculoService veiculos) { this.veiculos = veiculos; }

    @GetMapping("/health") public Map<String, String> health() {
        return Map.of("status", "UP", "service", "frota-api");
    }
    @GetMapping("/veiculos") public List<VeiculoResponse> listar(@RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "") String status) { return veiculos.listar(q, status); }
    @GetMapping("/veiculos/{id}") public VeiculoResponse buscar(@PathVariable Long id) { return veiculos.buscar(id); }
    @PostMapping("/veiculos") @ResponseStatus(HttpStatus.CREATED)
    public VeiculoResponse criar(@Valid @RequestBody VeiculoRequest request) { return veiculos.criar(request); }
    @PutMapping("/veiculos/{id}")
    public VeiculoResponse atualizar(@PathVariable Long id, @Valid @RequestBody VeiculoRequest request) { return veiculos.atualizar(id, request); }
    @DeleteMapping("/veiculos/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) { veiculos.excluir(id); }
    @GetMapping("/dashboard") public Map<String, Long> dashboard() { return veiculos.dashboard(); }
}
