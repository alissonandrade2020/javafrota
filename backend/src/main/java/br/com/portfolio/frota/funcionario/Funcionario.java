package br.com.portfolio.frota.funcionario;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "funcionarios")
public class Funcionario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 120) private String nome;
    @Column(nullable = false, unique = true, length = 140) private String email;
    @Column(length = 30) private String telefone;
    @Column(nullable = false, length = 50) private String cargo;
    @Column(nullable = false, length = 30) private String setor;
    @Column(nullable = false, length = 24) private String perfil;
    @Column(nullable = false, length = 20) private String status = "ATIVO";
    private LocalDate dataAdmissao;
    protected Funcionario() {}
    public Funcionario(String nome,String email,String telefone,String cargo,String setor,String perfil,String status,LocalDate dataAdmissao){this.nome=nome;this.email=email;this.telefone=telefone;this.cargo=cargo;this.setor=setor;this.perfil=perfil;this.status=status;this.dataAdmissao=dataAdmissao;}
    public Long getId(){return id;} public String getNome(){return nome;} public String getEmail(){return email;} public String getTelefone(){return telefone;} public String getCargo(){return cargo;} public String getSetor(){return setor;} public String getPerfil(){return perfil;} public String getStatus(){return status;} public LocalDate getDataAdmissao(){return dataAdmissao;}
    public void atualizar(String nome,String email,String telefone,String cargo,String setor,String perfil,String status,LocalDate dataAdmissao){this.nome=nome;this.email=email;this.telefone=telefone;this.cargo=cargo;this.setor=setor;this.perfil=perfil;this.status=status;this.dataAdmissao=dataAdmissao;}
}
