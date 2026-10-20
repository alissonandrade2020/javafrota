package br.com.portfolio.frota.config;

import br.com.portfolio.frota.funcionario.*;
import br.com.portfolio.frota.manutencao.*;
import br.com.portfolio.frota.peca.*;
import br.com.portfolio.frota.proprietario.*;
import br.com.portfolio.frota.venda.*;
import br.com.portfolio.frota.veiculo.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Configuration
@ConditionalOnProperty(name="app.seed.enabled",havingValue="true",matchIfMissing=true)
public class FrotaSeedConfig {
    @Bean
    CommandLineRunner seedDemoData(VeiculoRepository veiculos, ProprietarioRepository proprietarios,
            FuncionarioRepository funcionarios, PecaRepository pecas, OrdemServicoRepository ordens, VendaRepository vendas) {
        return args -> {
            if (proprietarios.count()==0) proprietarios.saveAll(List.of(
                new Proprietario("Ana Almeida","12345678901","(11) 99911-2200","ana.almeida@example.com","São Paulo"),
                new Proprietario("Rafael Costa","23456789012","(11) 99922-3300","rafael.costa@example.com","Guarulhos"),
                new Proprietario("Logística Horizonte Ltda.","12345678000199","(11) 4000-2000","frota@horizonte.example","Campinas"),
                new Proprietario("Mariana Souza","34567890123","(19) 99933-4400","mariana.souza@example.com","Campinas")
            ));

            List<Proprietario> donos=proprietarios.findAll();
            if (veiculos.count()==0) veiculos.saveAll(List.of(
                new Veiculo("Volvo","FH 540",2024,"BRA1B23","ATIVO","Prata","DIESEL","CAMINHAO",null,null,donos.get(2)),
                new Veiculo("Mercedes-Benz","Actros 2651",2023,"BRC2D34","ATIVO","Branco","DIESEL","CAMINHAO",null,null,donos.get(2)),
                new Veiculo("Scania","R 450",2022,"CRD3E45","ATIVO","Azul","DIESEL","CAMINHAO",null,null,donos.get(2)),
                new Veiculo("Volkswagen","Delivery 11.180",2024,"DSE4F56","ATIVO","Branco","DIESEL","CAMINHAO",null,null,donos.get(2)),
                new Veiculo("Ford","Cargo 2429",2021,"EFT5G67","ATIVO","Prata","DIESEL","CAMINHAO",null,null,donos.get(2)),
                new Veiculo("Iveco","S-Way 480",2023,"FGU6H78","ATIVO","Vermelho","DIESEL","CAMINHAO",null,null,donos.get(2)),
                new Veiculo("DAF","XF 530",2024,"GUV7J89","ATIVO","Branco","DIESEL","CAMINHAO",null,null,donos.get(2)),
                new Veiculo("Renault","Master L3H2",2022,"HVA8K90","ATIVO","Branco","DIESEL","VAN",null,null,donos.get(2)),
                new Veiculo("Volkswagen","Constellation 24.280",2020,"JWB9L01","MANUTENCAO","Branco","DIESEL","CAMINHAO",null,"Vazamento no sistema de arrefecimento",donos.get(2)),
                new Veiculo("Mercedes-Benz","Sprinter 416",2021,"KXC1M23","MANUTENCAO","Prata","DIESEL","VAN",null,"Desgaste no conjunto de embreagem",donos.get(2))
            ));

            addVehicle(veiculos,new Veiculo("Chevrolet","Onix 1.0 Turbo",2026,"ABC1D23","MANUTENCAO","Azul","FLEX","HATCH",
                "https://www.chevrolet.com.br/content/dam/chevrolet/south-america/brazil/portuguese/index/visid/cars/onix/refresh/versions/versiones-v3/desktop/5_turbo_atdesk.png?imwidth=1200","Batida frontal: capô amassado e farol esquerdo quebrado.",donos.get(0),false,null,"Chevrolet Brasil — Onix 2027"));
            addVehicle(veiculos,new Veiculo("Chevrolet","Celta LT 1.0",2014,"DEF2G34","MANUTENCAO","Prata","FLEX","HATCH",
                "https://commons.wikimedia.org/wiki/Special:FilePath/Chevrolet_Celta_20150902-IMG_20150902_143826.JPG?width=960","Luz da injeção acesa e falha intermitente em marcha lenta",donos.get(1),false,null,"Wikimedia Commons — CC BY-SA"));
            addVehicle(veiculos,new Veiculo("Hyundai","HB20 Limited TGDI",2026,"GHI3J45","ATIVO","Preto Onix","FLEX","HATCH",
                "https://www.hyundai.com.br/content/dam/hmb/cars/hb20/2025-2026/limited-tgdi/7-8/HB20-7-8-dianteira-passageiro-limited-tgdi-preto-onix.webp",null,donos.get(0),false,null,"Hyundai Brasil — HB20 2026/2027"));
            addVehicle(veiculos,new Veiculo("BYD","Dolphin GS",2026,"JKL4M56","ATIVO","Cinza","ELETRICO","HATCH",
                "https://www.byd.com/material/byd-site/br/product/byd-dolphin/exterior/dolphin-grey-lake-PC.jpg",null,donos.get(3),true,291,"BYD Brasil — Dolphin"));
            addVehicle(veiculos,new Veiculo("Ford","Ranger XLS 2.0 Turbo",2026,"MNO5P67","ATIVO","Azul","DIESEL","PICAPE",
                "https://www.ford.com.br/content/dam/Ford/website-assets/latam/br/nameplate/2025/nova-geracao-ranger/models/xl-20-ch-diesel-4x4-mt/fbr-ranger-xl-ch-4x4-mt.jpg",null,donos.get(2),false,null,"Ford Brasil — Ranger"));
            addVehicle(veiculos,new Veiculo("Toyota","Corolla Cross XRX Hybrid",2026,"QRS6T78","ATIVO","Branco Polar","HIBRIDO_FLEX","SUV",
                null,null,donos.get(1),false,null,"Toyota Brasil — Corolla Cross Hybrid 2026"));
            addVehicle(veiculos,new Veiculo("Fiat","Pulse Audace Hybrid",2026,"TUV7X89","ATIVO","Cinza","HIBRIDO_LEVE","SUV",
                null,null,donos.get(0),false,null,"Fiat Brasil — Pulse Hybrid"));
            addVehicle(veiculos,new Veiculo("BYD","Song Pro DM-i",2026,"WXY8Z90","ATIVO","Cinza","HIBRIDO_PLUGIN","SUV",
                null,null,donos.get(3),true,68,"BYD Brasil — Song Pro"));

            if (funcionarios.count()==0) funcionarios.saveAll(List.of(
                new Funcionario("Alexandre Alves","admin@frotaflow.example","(11) 99900-1000","Administrador","Gestão","ADMINISTRADOR","ATIVO",LocalDate.now().minusYears(5)),
                new Funcionario("Camila Rocha","rh@frotaflow.example","(11) 99900-2000","Analista de RH","Recursos Humanos","RH","ATIVO",LocalDate.now().minusYears(3)),
                new Funcionario("Diego Martins","vendas@frotaflow.example","(11) 99900-3000","Consultor de vendas","Comercial","VENDEDOR","ATIVO",LocalDate.now().minusYears(2)),
                new Funcionario("João Nunes","oficina@frotaflow.example","(11) 99900-4000","Mecânico líder","Oficina","MECANICO","ATIVO",LocalDate.now().minusYears(4)),
                new Funcionario("Luana Freitas","operacao@frotaflow.example","(11) 99900-5000","Analista de frota","Operações","OPERACAO","AFASTADO",LocalDate.now().minusYears(1))
            ));
            if (pecas.count()==0) pecas.saveAll(List.of(
                new Peca("FILT-OIL-01","Filtro de óleo 1.0","Filtros",18,8,new BigDecimal("39.90"),"Auto Peças Brasil"),
                new Peca("PAST-FRE-02","Jogo de pastilhas dianteiras","Freios",3,6,new BigDecimal("189.50"),"Freio Forte"),
                new Peca("BAT-12V-03","Bateria 12V 60Ah","Elétrica",7,4,new BigDecimal("499.00"),"Energia Auto"),
                new Peca("OLEO-5W30-04","Óleo sintético 5W30 — 1L","Lubrificantes",42,12,new BigDecimal("46.90"),"LubriMax"),
                new Peca("FAR-LED-05","Lâmpada LED H7","Iluminação",2,4,new BigDecimal("129.90"),"Auto Luz"),
                new Peca("CAB-REC-06","Cabo de recarga tipo 2","Elétrica",2,1,new BigDecimal("890.00"),"E-Mobility"),
                new Peca("ONX-CAP-07","Capô Chevrolet Onix","Carroceria",5,1,new BigDecimal("700.00"),"Lataria Brasil"),
                new Peca("ONX-FAR-08","Farol esquerdo Chevrolet Onix","Iluminação",5,1,new BigDecimal("300.00"),"Auto Luz")
            ));
            if (vendas.count()==0) vendas.saveAll(List.of(
                new Venda("Mariana Souza","BYD Dolphin GS","JKL4M56","Diego Martins","FECHADA",new BigDecimal("159800.00"),LocalDate.now().minusDays(8),"Venda direta — demonstração"),
                new Venda("Rafael Costa","Hyundai HB20 Limited TGDI","GHI3J45","Diego Martins","NEGOCIACAO",new BigDecimal("112000.00"),LocalDate.now().minusDays(2),"Test drive agendado"),
                new Venda("Logística Horizonte Ltda.","Ford Ranger XLS 2.0 Turbo","MNO5P67","Diego Martins","LEAD",new BigDecimal("289000.00"),LocalDate.now(),"Frota corporativa"),
                new Venda("Ana Almeida","Chevrolet Onix 1.0 Turbo","ABC1D23","Diego Martins","PERDIDA",new BigDecimal("105000.00"),LocalDate.now().minusDays(14),"Cliente adiou a compra")
            ));
            if (ordens.count()==0) {
                var celta=veiculos.findAll().stream().filter(v->v.getPlaca().equals("DEF2G34")).findFirst().orElse(null);
                var caminhão=veiculos.findAll().stream().filter(v->v.getPlaca().equals("JWB9L01")).findFirst().orElse(null);
                var onix=veiculos.findAll().stream().filter(v->v.getPlaca().equals("ABC1D23")).findFirst().orElse(null);
                if(onix!=null){var capô=pecas.findAll().stream().filter(p->p.getSku().equals("ONX-CAP-07")).findFirst().orElse(null);var farol=pecas.findAll().stream().filter(p->p.getSku().equals("ONX-FAR-08")).findFirst().orElse(null);var colisao=new OrdemServico(onix.getId(),onix.getPlaca(),onix.getMarca()+" "+onix.getModelo(),"Ana Almeida","Colisão frontal: capô amassado e farol esquerdo quebrado.","Substituir capô e farol esquerdo; alinhar e pintar o capô.","ALTA","EM_EXECUCAO","João Nunes",BigDecimal.ZERO,LocalDate.now().minusDays(1),LocalDate.now().plusDays(3),new BigDecimal("800.00"));if(capô!=null&&farol!=null){capô.ajustarEstoque(-1);farol.ajustarEstoque(-1);pecas.save(capô);pecas.save(farol);colisao.adicionarItem(new OrdemServicoItem(capô,1));colisao.adicionarItem(new OrdemServicoItem(farol,1));}colisao.recalcularTotal();ordens.save(colisao);}
                if(celta!=null)ordens.save(new OrdemServico(celta.getId(),celta.getPlaca(),celta.getMarca()+" "+celta.getModelo(),"Rafael Costa",celta.getProblemaAtual(),"Verificar sensor de oxigênio e corpo de borboleta", "ALTA","DIAGNOSTICO","João Nunes",new BigDecimal("650.00"),LocalDate.now().minusDays(1),LocalDate.now().plusDays(2)));
                if(caminhão!=null)ordens.save(new OrdemServico(caminhão.getId(),caminhão.getPlaca(),caminhão.getMarca()+" "+caminhão.getModelo(),"Logística Horizonte Ltda.",caminhão.getProblemaAtual(),"Aguardando teste de pressão do sistema", "MEDIA","AGUARDANDO_PECA","João Nunes",new BigDecimal("2300.00"),LocalDate.now().minusDays(3),LocalDate.now().plusDays(4)));
            }
        };
    }
    private void addVehicle(VeiculoRepository repository,Veiculo vehicle){if(!repository.existsByPlaca(vehicle.getPlaca()))repository.save(vehicle);}
}
