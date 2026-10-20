package br.com.portfolio.frota.venda;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name="vendas")
public class Venda {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,length=120) private String cliente;
    @Column(nullable=false,length=120) private String veiculo;
    @Column(nullable=false,length=12) private String placa;
    @Column(nullable=false,length=120) private String vendedor;
    @Column(nullable=false,length=24) private String status;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal valor;
    @Column(nullable=false) private LocalDate data;
    @Column(length=300) private String observacoes;
    protected Venda() {}
    public Venda(String cliente,String veiculo,String placa,String vendedor,String status,BigDecimal valor,LocalDate data,String observacoes){this.cliente=cliente;this.veiculo=veiculo;this.placa=placa;this.vendedor=vendedor;this.status=status;this.valor=valor;this.data=data;this.observacoes=observacoes;}
    public Long getId(){return id;} public String getCliente(){return cliente;} public String getVeiculo(){return veiculo;} public String getPlaca(){return placa;} public String getVendedor(){return vendedor;} public String getStatus(){return status;} public BigDecimal getValor(){return valor;} public LocalDate getData(){return data;} public String getObservacoes(){return observacoes;}
    public void atualizar(String cliente,String veiculo,String placa,String vendedor,String status,BigDecimal valor,LocalDate data,String observacoes){this.cliente=cliente;this.veiculo=veiculo;this.placa=placa;this.vendedor=vendedor;this.status=status;this.valor=valor;this.data=data;this.observacoes=observacoes;}
}
