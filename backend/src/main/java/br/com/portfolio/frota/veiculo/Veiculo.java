package br.com.portfolio.frota.veiculo;

import br.com.portfolio.frota.proprietario.Proprietario;
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
    @Column(length = 40) private String cor;
    @Column(length = 30) private String combustivel;
    @Column(length = 30) private String categoria;
    @Column(length = 500) private String imagemUrl;
    @Column(length = 500) private String problemaAtual;
    private Boolean recargaExterna = false;
    private Integer autonomiaEletricaKm;
    @Column(length=180) private String fonteImagem;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "proprietario_id") private Proprietario proprietario;
    @Column(nullable = false, updatable = false) private Instant criadoEm = Instant.now();
    protected Veiculo() {}
    public Veiculo(String marca, String modelo, Integer ano, String placa, String status) {
        this(marca,modelo,ano,placa,status,"Prata","DIESEL","CAMINHAO",null,null,null);
    }
    public Veiculo(String marca,String modelo,Integer ano,String placa,String status,String cor,String combustivel,String categoria,String imagemUrl,String problemaAtual,Proprietario proprietario){this(marca,modelo,ano,placa,status,cor,combustivel,categoria,imagemUrl,problemaAtual,proprietario,false,null,null);}
    public Veiculo(String marca,String modelo,Integer ano,String placa,String status,String cor,String combustivel,String categoria,String imagemUrl,String problemaAtual,Proprietario proprietario,Boolean recargaExterna,Integer autonomiaEletricaKm,String fonteImagem){this.marca=marca;this.modelo=modelo;this.ano=ano;this.placa=placa;this.status=status;this.cor=cor;this.combustivel=combustivel;this.categoria=categoria;this.imagemUrl=imagemUrl;this.problemaAtual=problemaAtual;this.proprietario=proprietario;this.recargaExterna=recargaExterna;this.autonomiaEletricaKm=autonomiaEletricaKm;this.fonteImagem=fonteImagem;}
    public Long getId(){return id;} public String getMarca(){return marca;} public String getModelo(){return modelo;}
    public Integer getAno(){return ano;} public String getPlaca(){return placa;} public String getStatus(){return status;}
    public String getCor(){return cor;} public String getCombustivel(){return combustivel;} public String getCategoria(){return categoria;} public String getImagemUrl(){return imagemUrl;} public String getProblemaAtual(){return problemaAtual;} public Proprietario getProprietario(){return proprietario;} public Boolean getRecargaExterna(){return recargaExterna;} public Integer getAutonomiaEletricaKm(){return autonomiaEletricaKm;} public String getFonteImagem(){return fonteImagem;}
    public Instant getCriadoEm(){return criadoEm;}
    public void atualizar(String marca,String modelo,Integer ano,String placa,String status){
        this.marca=marca;this.modelo=modelo;this.ano=ano;this.placa=placa;this.status=status;
    }
    public void atualizarDetalhes(String cor,String combustivel,String categoria,String imagemUrl,String problemaAtual,Proprietario proprietario){this.cor=cor;this.combustivel=combustivel;this.categoria=categoria;this.imagemUrl=imagemUrl;this.problemaAtual=problemaAtual;this.proprietario=proprietario;}
    public void atualizarEletrificacao(Boolean recargaExterna,Integer autonomiaEletricaKm,String fonteImagem){this.recargaExterna=recargaExterna==null?false:recargaExterna;this.autonomiaEletricaKm=autonomiaEletricaKm;this.fonteImagem=fonteImagem;}
}
