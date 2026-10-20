package br.com.portfolio.frota.veiculo;

import jakarta.validation.constraints.*;

public record VeiculoRequest(
    @NotBlank @Size(max=80) String marca,
    @NotBlank @Size(max=100) String modelo,
    @NotNull @Min(1950) @Max(2100) Integer ano,
    @NotBlank @Pattern(regexp="[A-Za-z]{3}[0-9][A-Za-z0-9][0-9]{2}", message="Use o padrão de placa Mercosul, ex.: ABC1D23") String placa,
    @NotBlank @Pattern(regexp="ATIVO|MANUTENCAO|INATIVO") String status
) {
    public String placaNormalizada(){ return placa.toUpperCase().replace("-", "").replace(" ", ""); }
}
