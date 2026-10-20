package br.com.portfolio.frota.manutencao;

import br.com.portfolio.frota.peca.Peca;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name="itens_ordem_servico")
public class OrdemServicoItem {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @JsonIgnore @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="ordem_id",nullable=false) private OrdemServico ordem;
    @ManyToOne(fetch=FetchType.EAGER,optional=false) @JoinColumn(name="peca_id",nullable=false) private Peca peca;
    @Column(nullable=false,length=40) private String sku;
    @Column(nullable=false,length=120) private String nomePeca;
    @Column(nullable=false) private Integer quantidade;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal valorUnitario;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal subtotal;
    protected OrdemServicoItem() {}
    public OrdemServicoItem(Peca peca,Integer quantidade){this.peca=peca;this.sku=peca.getSku();this.nomePeca=peca.getNome();this.quantidade=quantidade;this.valorUnitario=peca.getCustoUnitario();this.subtotal=valorUnitario.multiply(BigDecimal.valueOf(quantidade));}
    public Long getId(){return id;} public Peca getPeca(){return peca;} public String getSku(){return sku;} public String getNomePeca(){return nomePeca;} public Integer getQuantidade(){return quantidade;} public BigDecimal getValorUnitario(){return valorUnitario;} public BigDecimal getSubtotal(){return subtotal;} void setOrdem(OrdemServico ordem){this.ordem=ordem;}
}
