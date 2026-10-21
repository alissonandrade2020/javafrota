package br.com.portfolio.frota.auth;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class UsuarioDetailsService implements UserDetailsService {
    private final UsuarioRepository usuarios;
    public UsuarioDetailsService(UsuarioRepository usuarios) { this.usuarios = usuarios; }

    @Override public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarios.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
        return User.withUsername(usuario.getEmail()).password(usuario.getSenha()).disabled(!usuario.isAtivo())
                .authorities(new SimpleGrantedAuthority("ROLE_" + usuario.getPerfil().name())).build();
    }
}
