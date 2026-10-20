package br.com.portfolio.frota.manutencao;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ordens_servico")
public class OrdemServico {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private Long veiculoId;
    @Column(nullable=false,length=12) private String placa;
    @Column(nullable=false,length=120) private String veiculo;
    @Column(length=120) private String proprietario;
    @Column(nullable=false,length=500) private String problema;
    @Column(length=1000) private String diagnostico;
    @Column(nullable=false,length=20) private String prioridade;
    @Column(nullable=false,length=24) private String status;
    @Column(length=120) private String responsavel;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal custo;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal maoDeObra=BigDecimal.ZERO;
    @OneToMany(mappedBy="ordem",cascade=CascadeType.ALL,orphanRemoval=true,fetch=FetchType.EAGER) private List<OrdemServicoItem> itens=new ArrayList<>();
    @Column(nullable=false) private LocalDate abertura;
    private LocalDate previsaoConclusao;
    protected OrdemServico() {}
    public OrdemServico(Long veiculoId,String placa,String veiculo,String proprietario,String problema,String diagnostico,String prioridade,String status,String responsavel,BigDecimal custo,LocalDate abertura,LocalDate previsaoConclusao){this(veiculoId,placa,veiculo,proprietario,problema,diagnostico,prioridade,status,responsavel,custo,abertura,previsaoConclusao,custo);}
    public OrdemServico(Long veiculoId,String placa,String veiculo,String proprietario,String problema,String diagnostico,String prioridade,String status,String responsavel,BigDecimal custo,LocalDate abertura,LocalDate previsaoConclusao,BigDecimal maoDeObra){this.veiculoId=veiculoId;this.placa=placa;this.veiculo=veiculo;this.proprietario=proprietario;this.problema=problema;this.diagnostico=diagnostico;this.prioridade=prioridade;this.status=status;this.responsavel=responsavel;this.custo=custo;this.maoDeObra=maoDeObra;this.abertura=abertura;this.previsaoConclusao=previsaoConclusao;}
    public Long getId(){return id;} public Long getVeiculoId(){return veiculoId;} public String getPlaca(){return placa;} public String getVeiculo(){return veiculo;} public String getProprietario(){return proprietario;} public String getProblema(){return problema;} public String getDiagnostico(){return diagnostico;} public String getPrioridade(){return prioridade;} public String getStatus(){return status;} public String getResponsavel(){return responsavel;} public BigDecimal getCusto(){return custo;} public BigDecimal getTotalPagar(){return custo;} public BigDecimal getMaoDeObra(){return maoDeObra;} public List<OrdemServicoItem> getItens(){return itens;} public LocalDate getAbertura(){return abertura;} public LocalDate getPrevisaoConclusao(){return previsaoConclusao;}
    public void atualizar(Long veiculoId,String placa,String veiculo,String proprietario,String problema,String diagnostico,String prioridade,String status,String responsavel,BigDecimal custo,LocalDate abertura,LocalDate previsaoConclusao,BigDecimal maoDeObra){this.veiculoId=veiculoId;this.placa=placa;this.veiculo=veiculo;this.proprietario=proprietario;this.problema=problema;this.diagnostico=diagnostico;this.prioridade=prioridade;this.status=status;this.responsavel=responsavel;this.custo=custo;this.maoDeObra=maoDeObra;this.abertura=abertura;this.previsaoConclusao=previsaoConclusao;}
    public void adicionarItem(OrdemServicoItem item){itens.add(item);item.setOrdem(this);}
    public void limparItens(){itens.clear();}
    public void recalcularTotal(){this.custo=maoDeObra.add(itens.stream().map(OrdemServicoItem::getSubtotal).reduce(BigDecimal.ZERO,BigDecimal::add));}
}
