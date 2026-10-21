package br.com.portfolio.frota.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository contextRepository;
    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;

    public AuthController(AuthenticationManager authenticationManager, SecurityContextRepository contextRepository,
            UsuarioRepository usuarios, PasswordEncoder encoder) {
        this.authenticationManager = authenticationManager; this.contextRepository = contextRepository;
        this.usuarios = usuarios; this.encoder = encoder;
    }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String senha) {}
    public record UsuarioRequest(@NotBlank @Size(max=120) String nome, @NotBlank @Email @Size(max=140) String email,
            @Size(min=8, max=72) String senha, @NotNull Usuario.Perfil perfil, Boolean ativo) {}
    public record UsuarioResponse(Long id, String nome, String email, Usuario.Perfil perfil, boolean ativo) {
        static UsuarioResponse from(Usuario u) { return new UsuarioResponse(u.getId(), u.getNome(), u.getEmail(), u.getPerfil(), u.isAtivo()); }
    }
    public record SessionResponse(Long id, String nome, String email, Usuario.Perfil perfil) {
        static SessionResponse from(Usuario u) { return new SessionResponse(u.getId(), u.getNome(), u.getEmail(), u.getPerfil()); }
    }

    @GetMapping("/csrf") public java.util.Map<String, String> csrf(CsrfToken token) { return java.util.Map.of("token", token.getToken()); }

    @PostMapping("/login") public SessionResponse login(@Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest, HttpServletResponse servletResponse) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.senha()));
            servletRequest.getSession(true);
            servletRequest.changeSessionId();
            Usuario usuario = usuarios.findByEmailIgnoreCase(authentication.getName())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas"));
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            contextRepository.saveContext(context, servletRequest, servletResponse);
            return SessionResponse.from(usuario);
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos");
        }
    }

    @GetMapping("/me") public SessionResponse me(Authentication authentication) {
        return SessionResponse.from(usuarios.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED)));
    }

    @PostMapping("/logout") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
    }

    @GetMapping("/users") public List<UsuarioResponse> listUsers() {
        return usuarios.findAll().stream().map(UsuarioResponse::from).toList();
    }

    @PostMapping("/users") @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse createUser(@Valid @RequestBody UsuarioRequest request) {
        if (request.perfil() == Usuario.Perfil.ADMIN_MASTER)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O perfil master é reservado à conta inicial do sistema");
        if (request.senha() == null || request.senha().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe uma senha com pelo menos 8 caracteres");
        String email = request.email().trim().toLowerCase();
        if (usuarios.existsByEmailIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Este e-mail já está cadastrado");
        return UsuarioResponse.from(usuarios.save(new Usuario(request.nome().trim(), email, encoder.encode(request.senha()), request.perfil())));
    }

    @PutMapping("/users/{id}") public UsuarioResponse updateUser(@PathVariable Long id, @Valid @RequestBody UsuarioRequest request) {
        Usuario usuario = usuarios.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
        if (usuario.getPerfil() == Usuario.Perfil.ADMIN_MASTER &&
                (request.perfil() != Usuario.Perfil.ADMIN_MASTER || Boolean.FALSE.equals(request.ativo())))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A conta master não pode ser rebaixada ou desativada");
        if (usuario.getPerfil() != Usuario.Perfil.ADMIN_MASTER && request.perfil() == Usuario.Perfil.ADMIN_MASTER)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O perfil master é reservado à conta inicial do sistema");
        String email = request.email().trim().toLowerCase();
        usuarios.findByEmailIgnoreCase(email).filter(outro -> !outro.getId().equals(id)).ifPresent(outro -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este e-mail já está cadastrado");
        });
        usuario.atualizar(request.nome().trim(), email, request.perfil(), request.ativo() == null ? usuario.isAtivo() : request.ativo());
        if (request.senha() != null && !request.senha().isBlank()) usuario.alterarSenha(encoder.encode(request.senha()));
        return UsuarioResponse.from(usuarios.save(usuario));
    }
}
