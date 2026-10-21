package br.com.portfolio.frota.veiculo;

import br.com.portfolio.frota.proprietario.Proprietario;
import br.com.portfolio.frota.proprietario.ProprietarioRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class VeiculoService {
    private final VeiculoRepository veiculos;
    private final ProprietarioRepository proprietarios;

    public VeiculoService(VeiculoRepository veiculos, ProprietarioRepository proprietarios) {
        this.veiculos = veiculos; this.proprietarios = proprietarios;
    }

    @Transactional(readOnly = true)
    public List<VeiculoResponse> listar(String query, String status) {
        return veiculos.pesquisar(query.trim(), status.trim().toUpperCase()).stream().map(VeiculoResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public VeiculoResponse buscar(Long id) { return VeiculoResponse.from(encontrar(id)); }

    public VeiculoResponse criar(VeiculoRequest request) {
        Veiculo veiculo = new Veiculo(request.marca().trim(), request.modelo().trim(), request.ano(),
                request.placaNormalizada(), request.status(), valor(request.cor(), "Prata"), valor(request.combustivel(), "FLEX"),
                valor(request.categoria(), "HATCH"), request.imagemUrl(), request.problemaAtual(),
                proprietario(request.proprietarioId(), null), request.recargaExterna(), request.autonomiaEletricaKm(), request.fonteImagem());
        return persistir(veiculo);
    }

    public VeiculoResponse atualizar(Long id, VeiculoRequest request) {
        Veiculo v = encontrar(id);
        v.atualizar(request.marca().trim(), request.modelo().trim(), request.ano(), request.placaNormalizada(), request.status());
        v.atualizarDetalhes(valor(request.cor(), v.getCor(), "Prata"), valor(request.combustivel(), v.getCombustivel(), "FLEX"),
                valor(request.categoria(), v.getCategoria(), "HATCH"), request.imagemUrl() == null ? v.getImagemUrl() : request.imagemUrl(),
                request.problemaAtual() == null ? v.getProblemaAtual() : request.problemaAtual(), proprietario(request.proprietarioId(), v.getProprietario()));
        v.atualizarEletrificacao(request.recargaExterna() == null ? v.getRecargaExterna() : request.recargaExterna(),
                request.autonomiaEletricaKm() == null ? v.getAutonomiaEletricaKm() : request.autonomiaEletricaKm(),
                request.fonteImagem() == null ? v.getFonteImagem() : request.fonteImagem());
        return persistir(v);
    }

    public void excluir(Long id) {
        if (!veiculos.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Veículo não encontrado");
        veiculos.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> dashboard() {
        return Map.of("total", veiculos.count(), "ativos", veiculos.countByStatus("ATIVO"),
                "manutencao", veiculos.countByStatus("MANUTENCAO"), "inativos", veiculos.countByStatus("INATIVO"));
    }

    private Veiculo encontrar(Long id) {
        return veiculos.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Veículo não encontrado"));
    }
    private Proprietario proprietario(Long id, Proprietario atual) {
        if (id == null) return atual;
        return proprietarios.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Proprietário não encontrado"));
    }
    private String valor(String recebido, String padrao) { return recebido == null ? padrao : recebido; }
    private String valor(String recebido, String atual, String padrao) { return recebido == null ? atual == null ? padrao : atual : recebido; }
    private VeiculoResponse persistir(Veiculo veiculo) {
        try { return VeiculoResponse.from(veiculos.saveAndFlush(veiculo)); }
        catch (DataIntegrityViolationException ex) { throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um veículo com essa placa"); }
    }
}
