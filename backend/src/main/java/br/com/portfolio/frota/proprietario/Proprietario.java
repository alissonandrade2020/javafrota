package br.com.portfolio.frota.proprietario;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "proprietarios")
public class Proprietario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 120) private String nome;
    @Column(nullable = false, unique = true, length = 20) private String documento;
    @Column(length = 30) private String telefone;
    @Column(length = 140) private String email;
    @Column(length = 80) private String cidade;
    @Column(nullable = false, updatable = false) private Instant criadoEm = Instant.now();
    protected Proprietario() {}
    public Proprietario(String nome, String documento, String telefone, String email, String cidade) { this.nome=nome; this.documento=documento; this.telefone=telefone; this.email=email; this.cidade=cidade; }
    public Long getId(){return id;} public String getNome(){return nome;} public String getDocumento(){return documento;} public String getTelefone(){return telefone;} public String getEmail(){return email;} public String getCidade(){return cidade;} public Instant getCriadoEm(){return criadoEm;}
    public void atualizar(String nome,String documento,String telefone,String email,String cidade){this.nome=nome;this.documento=documento;this.telefone=telefone;this.email=email;this.cidade=cidade;}
}
