package br.com.portfolio.frota.veiculo;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "veiculos")
public class Veiculo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 80) private String marca;
    @Column(nullable = false, length = 100) private String modelo;
    @Column(nullable = false) private Integer ano;
    @Column(nullable = false, unique = true, length = 20) private String placa;
    @Column(nullable = false, length = 30) private String status = "ATIVO";
    @Column(nullable = false, updatable = false) private Instant criadoEm = Instant.now();
    protected Veiculo() {}
    public Veiculo(String marca, String modelo, Integer ano, String placa, String status) {
        this.marca=marca; this.modelo=modelo; this.ano=ano; this.placa=placa; this.status=status;
    }
    public Long getId(){return id;} public String getMarca(){return marca;} public String getModelo(){return modelo;}
    public Integer getAno(){return ano;} public String getPlaca(){return placa;} public String getStatus(){return status;}
    public Instant getCriadoEm(){return criadoEm;}
    public void atualizar(String marca,String modelo,Integer ano,String placa,String status){
        this.marca=marca;this.modelo=modelo;this.ano=ano;this.placa=placa;this.status=status;
    }
}
