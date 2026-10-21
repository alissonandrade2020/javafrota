package br.com.portfolio.frota.veiculo;

import br.com.portfolio.frota.proprietario.Proprietario;
import java.time.Instant;

public record VeiculoResponse(Long id, String marca, String modelo, Integer ano, String placa, String status,
        String cor, String combustivel, String categoria, String imagemUrl, String problemaAtual,
        ProprietarioResumo proprietario, Boolean recargaExterna, Integer autonomiaEletricaKm,
        String fonteImagem, Instant criadoEm) {
    public record ProprietarioResumo(Long id, String nome, String documento, String telefone, String email, String cidade) {
        static ProprietarioResumo from(Proprietario p) {
            return p == null ? null : new ProprietarioResumo(p.getId(), p.getNome(), p.getDocumento(), p.getTelefone(), p.getEmail(), p.getCidade());
        }
    }
    public static VeiculoResponse from(Veiculo v) {
        return new VeiculoResponse(v.getId(), v.getMarca(), v.getModelo(), v.getAno(), v.getPlaca(), v.getStatus(),
                v.getCor(), v.getCombustivel(), v.getCategoria(), v.getImagemUrl(), v.getProblemaAtual(),
                ProprietarioResumo.from(v.getProprietario()), v.getRecargaExterna(), v.getAutonomiaEletricaKm(),
                v.getFonteImagem(), v.getCriadoEm());
    }
}
