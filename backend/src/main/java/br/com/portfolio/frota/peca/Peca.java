package br.com.portfolio.frota.peca;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "pecas")
public class Peca {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, unique=true, length=40) private String sku;
    @Column(nullable=false, length=120) private String nome;
    @Column(nullable=false, length=60) private String categoria;
    @Column(nullable=false) private Integer quantidade;
    @Column(nullable=false) private Integer estoqueMinimo;
    @Column(nullable=false, precision=12, scale=2) private BigDecimal custoUnitario;
    @Column(length=100) private String fornecedor;
    protected Peca() {}
    public Peca(String sku,String nome,String categoria,Integer quantidade,Integer estoqueMinimo,BigDecimal custoUnitario,String fornecedor){this.sku=sku;this.nome=nome;this.categoria=categoria;this.quantidade=quantidade;this.estoqueMinimo=estoqueMinimo;this.custoUnitario=custoUnitario;this.fornecedor=fornecedor;}
    public Long getId(){return id;} public String getSku(){return sku;} public String getNome(){return nome;} public String getCategoria(){return categoria;} public Integer getQuantidade(){return quantidade;} public Integer getEstoqueMinimo(){return estoqueMinimo;} public BigDecimal getCustoUnitario(){return custoUnitario;} public String getFornecedor(){return fornecedor;}
    public void atualizar(String sku,String nome,String categoria,Integer quantidade,Integer estoqueMinimo,BigDecimal custoUnitario,String fornecedor){this.sku=sku;this.nome=nome;this.categoria=categoria;this.quantidade=quantidade;this.estoqueMinimo=estoqueMinimo;this.custoUnitario=custoUnitario;this.fornecedor=fornecedor;}
    public void ajustarEstoque(int variacao){this.quantidade+=variacao;}
}
