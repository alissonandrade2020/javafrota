package br.com.portfolio.frota.auth;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "usuarios")
public class Usuario {
    public enum Perfil { ADMIN_MASTER, GERENTE, RH, VENDEDOR, MECANICO, OPERACAO }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 120) private String nome;
    @Column(nullable = false, unique = true, length = 140) private String email;
    @Column(nullable = false, length = 100) private String senha;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 24) private Perfil perfil;
    @Column(nullable = false) private boolean ativo = true;
    @Column(nullable = false, updatable = false) private Instant criadoEm = Instant.now();

    protected Usuario() {}
    public Usuario(String nome, String email, String senha, Perfil perfil) {
        this.nome = nome; this.email = email; this.senha = senha; this.perfil = perfil;
    }
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getSenha() { return senha; }
    public Perfil getPerfil() { return perfil; }
    public boolean isAtivo() { return ativo; }
    public Instant getCriadoEm() { return criadoEm; }
    public void atualizar(String nome, String email, Perfil perfil, boolean ativo) {
        this.nome = nome; this.email = email; this.perfil = perfil; this.ativo = ativo;
    }
    public void alterarSenha(String senha) { this.senha = senha; }
}
