package br.com.portfolio.frota.veiculo;

import jakarta.validation.constraints.*;

public record VeiculoRequest(
    @NotBlank @Size(max=80) String marca,
    @NotBlank @Size(max=100) String modelo,
    @NotNull @Min(1950) @Max(2100) Integer ano,
    @NotBlank @Pattern(regexp="[A-Za-z]{3}[0-9][A-Za-z0-9][0-9]{2}", message="Use o padrão de placa Mercosul, ex.: ABC1D23") String placa,
    @NotBlank @Pattern(regexp="ATIVO|MANUTENCAO|INATIVO") String status,
    @Size(max=40) String cor,
    @Pattern(regexp="FLEX|GASOLINA|DIESEL|ELETRICO|HIBRIDO_FLEX|HIBRIDO_PLUGIN|HIBRIDO_LEVE|FLEX_ETANOL") String combustivel,
    @Pattern(regexp="HATCH|SEDAN|SUV|PICAPE|VAN|CAMINHAO|ONIBUS|MOTO|OUTRO") String categoria,
    @Size(max=500) String imagemUrl,@Size(max=500) String problemaAtual,Long proprietarioId,
    Boolean recargaExterna,@Min(0) Integer autonomiaEletricaKm,@Size(max=180) String fonteImagem
) {
    public String placaNormalizada(){ return placa.toUpperCase().replace("-", "").replace(" ", ""); }
}
