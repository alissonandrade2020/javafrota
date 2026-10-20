package br.com.portfolio.frota.config;

import br.com.portfolio.frota.funcionario.FuncionarioRepository;
import br.com.portfolio.frota.manutencao.OrdemServicoRepository;
import br.com.portfolio.frota.peca.PecaRepository;
import br.com.portfolio.frota.proprietario.ProprietarioRepository;
import br.com.portfolio.frota.venda.VendaRepository;
import br.com.portfolio.frota.veiculo.VeiculoRepository;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/relatorios")
public class RelatoriosController {
    private final VeiculoRepository veiculos;
    private final FuncionarioRepository funcionarios;
    private final PecaRepository pecas;
    private final ProprietarioRepository proprietarios;
    private final OrdemServicoRepository ordens;
    private final VendaRepository vendas;
    public RelatoriosController(VeiculoRepository veiculos,FuncionarioRepository funcionarios,PecaRepository pecas,OrdemServicoRepository ordens,VendaRepository vendas,ProprietarioRepository proprietarios){this.veiculos=veiculos;this.funcionarios=funcionarios;this.pecas=pecas;this.ordens=ordens;this.vendas=vendas;this.proprietarios=proprietarios;}

    @GetMapping("/resumo")
    public Map<String,Object> resumo(@RequestParam(required=false) LocalDate de,@RequestParam(required=false) LocalDate ate){
        LocalDate inicio=de==null?LocalDate.now().withDayOfMonth(1):de;
        LocalDate fim=ate==null?LocalDate.now():ate;
        var listaVendas=vendas.findAll().stream().filter(v->!v.getData().isBefore(inicio)&&!v.getData().isAfter(fim)).toList();
        var receita=listaVendas.stream().filter(v->v.getStatus().equals("FECHADA")).map(v->v.getValor()).reduce(BigDecimal.ZERO,BigDecimal::add);
        Map<String,Object> result=new LinkedHashMap<>();
        result.put("periodo",Map.of("de",inicio,"ate",fim));
        result.put("totalVeiculos",veiculos.count());
        result.put("veiculosPorStatus",contar(veiculos.findAll(),v->v.getStatus()));
        result.put("veiculosPorCombustivel",contar(veiculos.findAll(),v->v.getCombustivel()==null?"NAO_INFORMADO":v.getCombustivel()));
        result.put("totalProprietarios",proprietarios.count());
        result.put("funcionariosAtivos",funcionarios.countByStatus("ATIVO"));
        result.put("funcionariosPorPerfil",contar(funcionarios.findAll(),f->f.getPerfil()));
        result.put("estoqueBaixo",pecas.findAll().stream().filter(p->p.getQuantidade()<=p.getEstoqueMinimo()).count());
        result.put("itensEstoque",pecas.count());
        result.put("ordensAbertas",ordens.findAll().stream().filter(o->!List.of("CONCLUIDA","CANCELADA").contains(o.getStatus())).count());
        result.put("ordensPorStatus",contar(ordens.findAll(),o->o.getStatus()));
        var servicosNoPeriodo=ordens.findAll().stream().filter(o->!o.getAbertura().isBefore(inicio)&&!o.getAbertura().isAfter(fim)).toList();
        result.put("servicosNoPeriodo",servicosNoPeriodo.size());
        result.put("totalCobrancaOficina",servicosNoPeriodo.stream().map(o->o.getTotalPagar()).reduce(BigDecimal.ZERO,BigDecimal::add));
        result.put("vendasNoPeriodo",listaVendas.size());
        result.put("vendasFechadas",listaVendas.stream().filter(v->v.getStatus().equals("FECHADA")).count());
        result.put("receitaNoPeriodo",receita);
        result.put("vendasPorStatus",contar(listaVendas,v->v.getStatus()));
        result.put("vendas",listaVendas);
        return result;
    }
    private <T> Map<String,Long> contar(List<T> dados,Function<T,String> chave){return dados.stream().collect(Collectors.groupingBy(chave,TreeMap::new,Collectors.counting()));}
}
