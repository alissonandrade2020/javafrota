package br.com.portfolio.frota.config;

import br.com.portfolio.frota.funcionario.*;
import br.com.portfolio.frota.manutencao.*;
import br.com.portfolio.frota.peca.*;
import br.com.portfolio.frota.proprietario.*;
import br.com.portfolio.frota.venda.*;
import br.com.portfolio.frota.veiculo.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api")
public class CadastrosController {
    private final ProprietarioRepository proprietarios;
    private final FuncionarioRepository funcionarios;
    private final PecaRepository pecas;
    private final OrdemServicoRepository ordens;
    private final VendaRepository vendas;
    private final VeiculoRepository veiculos;

    public CadastrosController(ProprietarioRepository proprietarios, FuncionarioRepository funcionarios,
            PecaRepository pecas, OrdemServicoRepository ordens, VendaRepository vendas, VeiculoRepository veiculos) {
        this.proprietarios=proprietarios; this.funcionarios=funcionarios; this.pecas=pecas;
        this.ordens=ordens; this.vendas=vendas; this.veiculos=veiculos;
    }

    public record ProprietarioPayload(@NotBlank @Size(max=120) String nome,@NotBlank @Size(max=20) String documento,
            @Size(max=30) String telefone,@Email @Size(max=140) String email,@Size(max=80) String cidade) {}
    public record FuncionarioPayload(@NotBlank @Size(max=120) String nome,@NotBlank @Email @Size(max=140) String email,
            @Size(max=30) String telefone,@NotBlank @Size(max=50) String cargo,@NotBlank @Size(max=30) String setor,
            @NotBlank @Pattern(regexp="ADMINISTRADOR|RH|VENDEDOR|MECANICO|OPERACAO") String perfil,
            @NotBlank @Pattern(regexp="ATIVO|AFASTADO|INATIVO") String status,LocalDate dataAdmissao) {}
    public record PecaPayload(@NotBlank @Size(max=40) String sku,@NotBlank @Size(max=120) String nome,
            @NotBlank @Size(max=60) String categoria,@NotNull @Min(0) Integer quantidade,@NotNull @Min(0) Integer estoqueMinimo,
            @NotNull @DecimalMin("0.0") BigDecimal custoUnitario,@Size(max=100) String fornecedor) {}
    public record ItemPayload(@NotNull @Positive Long pecaId,@NotNull @Min(1) Integer quantidade) {}
    public record OrdemPayload(@NotNull @Positive Long veiculoId,@NotBlank @Size(max=500) String problema,
            @Size(max=1000) String diagnostico,@NotBlank @Pattern(regexp="BAIXA|MEDIA|ALTA|CRITICA") String prioridade,
            @NotBlank @Pattern(regexp="ABERTA|DIAGNOSTICO|AGUARDANDO_PECA|EM_EXECUCAO|CONCLUIDA|CANCELADA") String status,
            @Size(max=120) String responsavel,@NotNull @DecimalMin("0.0") BigDecimal maoDeObra,LocalDate abertura,LocalDate previsaoConclusao,
            List<@Valid ItemPayload> itens) {}
    public record VendaPayload(@NotBlank @Size(max=120) String cliente,@NotBlank @Size(max=120) String veiculo,
            @NotBlank @Pattern(regexp="[A-Za-z]{3}[0-9][A-Za-z0-9][0-9]{2}") String placa,
            @NotBlank @Size(max=120) String vendedor,@NotBlank @Pattern(regexp="LEAD|NEGOCIACAO|FECHADA|PERDIDA") String status,
            @NotNull @DecimalMin("0.0") BigDecimal valor,LocalDate data,@Size(max=300) String observacoes) {}

    public record ProprietarioView(Long id,String nome,String documento,String telefone,String email,String cidade,Instant criadoEm) {
        static ProprietarioView from(Proprietario p){return new ProprietarioView(p.getId(),p.getNome(),p.getDocumento(),p.getTelefone(),p.getEmail(),p.getCidade(),p.getCriadoEm());}
    }
    public record FuncionarioView(Long id,String nome,String email,String telefone,String cargo,String setor,String perfil,String status,LocalDate dataAdmissao) {
        static FuncionarioView from(Funcionario f){return new FuncionarioView(f.getId(),f.getNome(),f.getEmail(),f.getTelefone(),f.getCargo(),f.getSetor(),f.getPerfil(),f.getStatus(),f.getDataAdmissao());}
    }
    public record PecaView(Long id,String sku,String nome,String categoria,Integer quantidade,Integer estoqueMinimo,BigDecimal custoUnitario,String fornecedor) {
        static PecaView from(Peca p){return new PecaView(p.getId(),p.getSku(),p.getNome(),p.getCategoria(),p.getQuantidade(),p.getEstoqueMinimo(),p.getCustoUnitario(),p.getFornecedor());}
    }
    public record PecaResumo(Long id,String sku,String nome,BigDecimal custoUnitario) {
        static PecaResumo from(Peca p){return new PecaResumo(p.getId(),p.getSku(),p.getNome(),p.getCustoUnitario());}
    }
    public record ItemView(Long id,PecaResumo peca,String sku,String nomePeca,Integer quantidade,BigDecimal valorUnitario,BigDecimal subtotal) {
        static ItemView from(OrdemServicoItem i){return new ItemView(i.getId(),PecaResumo.from(i.getPeca()),i.getSku(),i.getNomePeca(),i.getQuantidade(),i.getValorUnitario(),i.getSubtotal());}
    }
    public record OrdemView(Long id,Long veiculoId,String placa,String veiculo,String proprietario,String problema,String diagnostico,String prioridade,
            String status,String responsavel,BigDecimal custo,BigDecimal totalPagar,BigDecimal maoDeObra,List<ItemView> itens,LocalDate abertura,LocalDate previsaoConclusao) {
        static OrdemView from(OrdemServico o){return new OrdemView(o.getId(),o.getVeiculoId(),o.getPlaca(),o.getVeiculo(),o.getProprietario(),o.getProblema(),o.getDiagnostico(),o.getPrioridade(),o.getStatus(),o.getResponsavel(),o.getCusto(),o.getTotalPagar(),o.getMaoDeObra(),o.getItens().stream().map(ItemView::from).toList(),o.getAbertura(),o.getPrevisaoConclusao());}
    }
    public record VendaView(Long id,String cliente,String veiculo,String placa,String vendedor,String status,BigDecimal valor,LocalDate data,String observacoes) {
        static VendaView from(Venda v){return new VendaView(v.getId(),v.getCliente(),v.getVeiculo(),v.getPlaca(),v.getVendedor(),v.getStatus(),v.getValor(),v.getData(),v.getObservacoes());}
    }

    @GetMapping("/proprietarios") public List<ProprietarioView> proprietarios(){return proprietarios.findAll().stream().map(ProprietarioView::from).toList();}
    @PostMapping("/proprietarios") @ResponseStatus(HttpStatus.CREATED) public ProprietarioView criarProprietario(@Valid @RequestBody ProprietarioPayload p){return ProprietarioView.from(proprietarios.save(new Proprietario(p.nome().trim(),p.documento().trim(),p.telefone(),p.email(),p.cidade())));}
    @PutMapping("/proprietarios/{id}") public ProprietarioView atualizarProprietario(@PathVariable Long id,@Valid @RequestBody ProprietarioPayload p){var x=notFound(proprietarios.findById(id).orElse(null),"Proprietário");x.atualizar(p.nome().trim(),p.documento().trim(),p.telefone(),p.email(),p.cidade());return ProprietarioView.from(proprietarios.save(x));}
    @DeleteMapping("/proprietarios/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void excluirProprietario(@PathVariable Long id){proprietarios.delete(notFound(proprietarios.findById(id).orElse(null),"Proprietário"));}

    @GetMapping("/funcionarios") public List<FuncionarioView> funcionarios(){return funcionarios.findAll().stream().map(FuncionarioView::from).toList();}
    @PostMapping("/funcionarios") @ResponseStatus(HttpStatus.CREATED) public FuncionarioView criarFuncionario(@Valid @RequestBody FuncionarioPayload p){return FuncionarioView.from(funcionarios.save(new Funcionario(p.nome().trim(),p.email().trim().toLowerCase(),p.telefone(),p.cargo().trim(),p.setor().trim(),p.perfil(),p.status(),p.dataAdmissao())));}
    @PutMapping("/funcionarios/{id}") public FuncionarioView atualizarFuncionario(@PathVariable Long id,@Valid @RequestBody FuncionarioPayload p){var x=notFound(funcionarios.findById(id).orElse(null),"Funcionário");x.atualizar(p.nome().trim(),p.email().trim().toLowerCase(),p.telefone(),p.cargo().trim(),p.setor().trim(),p.perfil(),p.status(),p.dataAdmissao());return FuncionarioView.from(funcionarios.save(x));}
    @DeleteMapping("/funcionarios/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void excluirFuncionario(@PathVariable Long id){funcionarios.delete(notFound(funcionarios.findById(id).orElse(null),"Funcionário"));}

    @GetMapping("/pecas") public List<PecaView> pecas(){return pecas.findAll().stream().map(PecaView::from).toList();}
    @PostMapping("/pecas") @ResponseStatus(HttpStatus.CREATED) public PecaView criarPeca(@Valid @RequestBody PecaPayload p){return PecaView.from(pecas.save(new Peca(p.sku().trim().toUpperCase(),p.nome().trim(),p.categoria().trim(),p.quantidade(),p.estoqueMinimo(),p.custoUnitario(),p.fornecedor())));}
    @PutMapping("/pecas/{id}") public PecaView atualizarPeca(@PathVariable Long id,@Valid @RequestBody PecaPayload p){var x=notFound(pecas.findById(id).orElse(null),"Peça");x.atualizar(p.sku().trim().toUpperCase(),p.nome().trim(),p.categoria().trim(),p.quantidade(),p.estoqueMinimo(),p.custoUnitario(),p.fornecedor());return PecaView.from(pecas.save(x));}
    @DeleteMapping("/pecas/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void excluirPeca(@PathVariable Long id){pecas.delete(notFound(pecas.findById(id).orElse(null),"Peça"));}

    @GetMapping("/manutencoes") public List<OrdemView> manutencoes(){return ordens.findAll().stream().map(OrdemView::from).toList();}
    @PostMapping("/manutencoes") @ResponseStatus(HttpStatus.CREATED) @Transactional public OrdemView criarOrdem(@Valid @RequestBody OrdemPayload p){var x=ordem(p);adicionarItens(x,p.itens());x.recalcularTotal();return OrdemView.from(ordens.save(x));}
    @PutMapping("/manutencoes/{id}") @Transactional public OrdemView atualizarOrdem(@PathVariable Long id,@Valid @RequestBody OrdemPayload p){var x=notFound(ordens.findById(id).orElse(null),"Ordem de serviço");var v=veiculo(p.veiculoId());devolverEstoque(x);x.atualizar(v.getId(),v.getPlaca(),v.getMarca()+" "+v.getModelo(),nomeDono(v),p.problema().trim(),p.diagnostico(),p.prioridade(),p.status(),p.responsavel(),BigDecimal.ZERO,data(p.abertura()),p.previsaoConclusao(),p.maoDeObra());x.limparItens();adicionarItens(x,p.itens());x.recalcularTotal();return OrdemView.from(ordens.save(x));}
    @DeleteMapping("/manutencoes/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @Transactional public void excluirOrdem(@PathVariable Long id){var x=notFound(ordens.findById(id).orElse(null),"Ordem de serviço");devolverEstoque(x);ordens.delete(x);}

    @GetMapping("/vendas") public List<VendaView> vendas(){return vendas.findAll().stream().map(VendaView::from).toList();}
    @PostMapping("/vendas") @ResponseStatus(HttpStatus.CREATED) public VendaView criarVenda(@Valid @RequestBody VendaPayload p){return VendaView.from(vendas.save(venda(null,p)));}
    @PutMapping("/vendas/{id}") public VendaView atualizarVenda(@PathVariable Long id,@Valid @RequestBody VendaPayload p){var x=notFound(vendas.findById(id).orElse(null),"Venda");x.atualizar(p.cliente().trim(),p.veiculo().trim(),normalizarPlaca(p.placa()),p.vendedor().trim(),p.status(),p.valor(),data(p.data()),p.observacoes());return VendaView.from(vendas.save(x));}
    @DeleteMapping("/vendas/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void excluirVenda(@PathVariable Long id){vendas.delete(notFound(vendas.findById(id).orElse(null),"Venda"));}

    private OrdemServico ordem(OrdemPayload p){var v=veiculo(p.veiculoId());return new OrdemServico(v.getId(),v.getPlaca(),v.getMarca()+" "+v.getModelo(),nomeDono(v),p.problema().trim(),p.diagnostico(),p.prioridade(),p.status(),p.responsavel(),BigDecimal.ZERO,data(p.abertura()),p.previsaoConclusao(),p.maoDeObra());}
    private void adicionarItens(OrdemServico ordem,List<ItemPayload> itens){if(itens==null)return;for(var item:itens){var peca=notFound(pecas.findById(item.pecaId()).orElse(null),"Peça");if(peca.getQuantidade()<item.quantidade())throw new ResponseStatusException(HttpStatus.CONFLICT,"Estoque insuficiente para "+peca.getNome());peca.ajustarEstoque(-item.quantidade());pecas.save(peca);ordem.adicionarItem(new OrdemServicoItem(peca,item.quantidade()));}}
    private void devolverEstoque(OrdemServico ordem){for(var item:ordem.getItens()){var peca=item.getPeca();peca.ajustarEstoque(item.getQuantidade());pecas.save(peca);}}
    private Veiculo veiculo(Long id){return notFound(veiculos.buscarComProprietario(id).orElse(null),"Veículo");}
    private String nomeDono(Veiculo veiculo){return veiculo.getProprietario()==null?"":veiculo.getProprietario().getNome();}
    private Venda venda(Long id,VendaPayload p){return new Venda(p.cliente().trim(),p.veiculo().trim(),normalizarPlaca(p.placa()),p.vendedor().trim(),p.status(),p.valor(),data(p.data()),p.observacoes());}
    private LocalDate data(LocalDate date){return date==null?LocalDate.now():date;}
    private String normalizarPlaca(String placa){return placa.toUpperCase().replaceAll("[^A-Z0-9]", "");}
    private <T> T notFound(T value,String entity){if(value==null)throw new ResponseStatusException(HttpStatus.NOT_FOUND,entity+" não encontrado(a)");return value;}
}
