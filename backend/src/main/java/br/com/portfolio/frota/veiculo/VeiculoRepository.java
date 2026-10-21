package br.com.portfolio.frota.veiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.Optional;
import java.util.List;
public interface VeiculoRepository extends JpaRepository<Veiculo,Long> {
 @Query("select v from Veiculo v where (:q = '' or lower(v.marca) like lower(concat('%',:q,'%')) or lower(v.modelo) like lower(concat('%',:q,'%')) or lower(v.placa) like lower(concat('%',:q,'%'))) and (:status = '' or v.status = :status) order by v.id desc")
 List<Veiculo> pesquisar(@Param("q") String q, @Param("status") String status);
 @EntityGraph(attributePaths = "proprietario")
 @Query("select v from Veiculo v where v.id = :id")
 Optional<Veiculo> buscarComProprietario(@Param("id") Long id);
 long countByStatus(String status);
 boolean existsByPlaca(String placa);
}
