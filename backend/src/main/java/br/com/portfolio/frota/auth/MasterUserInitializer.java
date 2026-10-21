package br.com.portfolio.frota.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class MasterUserInitializer implements CommandLineRunner {
    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    @Value("${app.auth.master-email}") private String email;
    @Value("${app.auth.master-password}") private String password;

    public MasterUserInitializer(UsuarioRepository usuarios, PasswordEncoder encoder) {
        this.usuarios = usuarios; this.encoder = encoder;
    }

    @Override public void run(String... args) {
        if (usuarios.findByEmailIgnoreCase(email).isPresent()) return;
        if (password == null || password.length() < 12)
            throw new IllegalStateException("Configure MASTER_PASSWORD com no mínimo 12 caracteres para criar o administrador master inicial.");
        usuarios.save(new Usuario("Administrador Master", email.trim().toLowerCase(), encoder.encode(password), Usuario.Perfil.ADMIN_MASTER));
    }
}
