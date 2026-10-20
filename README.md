# FrotaFlow — Full Stack Java + React + Vite + PostgreSQL + Docker + CI/CD

Projeto de portfólio para gestão de frota: API REST Java 21/Spring Boot, frontend React + Vite, PostgreSQL, Docker Compose e pipeline GitHub Actions para homologação e produção.

> **Onde executar cada comando?**
> - **Raiz do projeto** (`javafrota` ou `frota-fullstack`): `docker compose`, `git`, configuração `.env`.
> - **`backend`**: comandos `mvn` se executar o Java fora do Docker.
> - **`frontend`**: comandos `npm` se executar o React + Vite fora do Docker.
>
> Para começar, siga o caminho Docker abaixo. Você vai iniciar e testar o backend primeiro, e só depois iniciar o frontend.

## 1. O que está incluído

- Backend: Java 21, Spring Boot, Spring Data JPA, validação e API REST.
- Frontend: React 19 + Vite 6 + TypeScript, painel responsivo de veículos.
- Banco de dados: PostgreSQL 17.
- Containers: Docker Compose.
- CI/CD: GitHub Actions, testes/build, publicação de imagens no GitHub Container Registry (GHCR), deploy de homologação e promoção manual para produção.
- Funcionalidades: painel de totais, pesquisa, filtro por status, cadastro, edição, exclusão e exportação CSV.

## 2. Instale as ferramentas no Windows

1. Instale o [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/) e abra-o. Espere ele informar que está iniciado.
2. Instale o [Git for Windows](https://git-scm.com/download/win).
3. Instale o [Visual Studio Code](https://code.visualstudio.com/) (opcional, recomendado).

Para executar com Docker, não precisa instalar Java, Maven, Node.js ou PostgreSQL no Windows: os builds acontecem nos containers. Para executar Java/React + Vite diretamente no Windows, veja a seção 8.

## 3. Coloque os arquivos na pasta correta

1. Extraia o ZIP para uma pasta, por exemplo `C:\Projetos\javafrota`.
2. O nível raiz precisa conter `backend`, `frontend`, `.github`, `compose.yaml` e `.env.example`.
3. Abra PowerShell e entre na raiz. Ajuste o caminho se necessário:

   ```powershell
   cd C:\Projetos\javafrota
   Get-ChildItem
   ```

   A listagem deve mostrar, entre outros, `backend`, `frontend` e `compose.yaml`.

**Importante:** os comandos Docker deste README são executados nessa raiz. Não entre em `backend` nem `frontend` para executar `docker compose`.

## 4. Crie o `.env` local

Ainda na **raiz do projeto**:

```powershell
Copy-Item .env.example .env
notepad .env
```

Altere `DB_PASSWORD` para uma senha de desenvolvimento local, salve e feche. Exemplo de configuração:

```dotenv
DB_NAME=frota
DB_USER=frota
DB_PASSWORD=coloque_uma_senha_local_forte
APP_PORT=4200
API_PORT=8080
```

Use a senha que você escolheu de verdade nos passos seguintes. Se `.env` já existir, não o sobrescreva; apenas abra e confira. O `.env` está no `.gitignore`: não publique senhas, tokens ou chaves privadas.

## 5. Primeiro: iniciar e testar o BACKEND (Java + PostgreSQL)

Todos os comandos desta seção são executados na **raiz** do projeto.

### 5.1 Inicie o banco e a API Java

Confira que o Docker Desktop está aberto. Execute:

```powershell
docker compose up --build -d db backend
```

Na primeira vez, o Docker baixa o PostgreSQL, cria o banco e compila a aplicação Java. Aguarde alguns minutos e confira os containers:

```powershell
docker compose ps
```

Veja os logs do backend:

```powershell
docker compose logs -f backend
```

Espere a mensagem de inicialização do Spring Boot. Para sair dos logs, pressione `Ctrl+C`; os containers continuam em execução.

### 5.2 Teste o backend antes de abrir o frontend

Abra outro PowerShell (pode continuar na raiz) e execute:

```powershell
Invoke-RestMethod http://localhost:8080/api/health
```

Resposta esperada:

```json
{
  "status": "UP",
  "service": "frota-api"
}
```

Teste a listagem:

```powershell
Invoke-RestMethod http://localhost:8080/api/veiculos
```

Se ainda não cadastrou veículos, uma lista vazia é normal. Para cadastrar um registro de teste pela API:

```powershell
$body = @{
  marca = 'Toyota'
  modelo = 'Corolla'
  ano = 2025
  placa = 'ABC1D23'
  status = 'ATIVO'
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri 'http://localhost:8080/api/veiculos' `
  -Method Post `
  -ContentType 'application/json' `
  -Body $body
```

Se a API devolver os dados do veículo, o backend está funcionando. A placa precisa ser única.

### 5.3 Se o backend falhar

Na raiz, execute:

```powershell
docker compose ps
docker compose logs --tail=150 db
docker compose logs --tail=200 backend
```

Confira se o Docker Desktop está iniciado, se `DB_PASSWORD` está preenchida no `.env`, e se as portas não estão ocupadas. Se a porta 8080 já estiver ocupada, altere `API_PORT=8082` no `.env` e recrie os serviços:

```powershell
docker compose up --build -d db backend
```

Nesse caso, teste `http://localhost:8082/api/health`. A porta interna do container continua sendo 8080.

## 6. Segundo: iniciar o FRONTEND (React + Vite)

Só avance depois que `http://localhost:8080/api/health` responder corretamente.

Na **raiz do projeto**, execute:

```powershell
docker compose up --build -d frontend
```

Esse comando compila o React + Vite e inicia o Nginx. O Nginx encaminha chamadas `/api/...` para o container do backend, sem precisar configurar CORS no navegador.

Abra no navegador:

- **Aplicação completa:** http://localhost:4200
- **Saúde da API diretamente:** http://localhost:8080/api/health
- **Lista de veículos diretamente:** http://localhost:8080/api/veiculos

Na interface, teste busca, filtro de status, cadastro, edição, exclusão e exportação CSV. Se a página abrir mas não carregar os dados, veja os logs:

```powershell
docker compose logs --tail=150 backend
docker compose logs --tail=150 frontend
```

## 7. Comandos Docker mais usados (na raiz)

```powershell
# Estado dos serviços
docker compose ps

# Logs de todos os serviços
docker compose logs -f

# Logs só do backend
docker compose logs -f backend

# Logs só do frontend/Nginx
docker compose logs -f frontend

# Reconstruir após alterações
docker compose up --build -d

# Parar serviços, mantendo os dados
docker compose down

# Iniciar novamente
docker compose up -d
```

**Cuidado:** `docker compose down -v` apaga o volume do banco e os dados locais. Não use se quiser preservar os veículos cadastrados.

## 8. Executar Java e React + Vite fora do Docker (opcional)

O caminho Docker das seções 5 e 6 é recomendado para começar. Esta seção é para desenvolvimento com ferramentas instaladas localmente.

### 8.1 Backend Java diretamente

Pré-requisitos: JDK 21 e Maven instalados.

1. Na raiz do projeto, inicie somente o banco:

   ```powershell
   docker compose up -d db
   ```

2. Abra um PowerShell e entre na pasta **backend**:

   ```powershell
   cd C:\Projetos\javafrota\backend
   ```

3. Defina as variáveis de conexão (substitua a senha pelo valor real do seu `.env`):

   ```powershell
   $env:DB_URL = 'jdbc:postgresql://localhost:5432/frota'
   $env:DB_USER = 'frota'
   $env:DB_PASSWORD = 'coloque_a_mesma_senha_do_env'
   mvn spring-boot:run
   ```

4. Teste `http://localhost:8080/api/health`.

O terminal fica ocupado enquanto a API estiver rodando. Pressione `Ctrl+C` para parar. Se `mvn` não for reconhecido, instale Maven ou use o caminho Docker.

### 8.2 Frontend React + Vite diretamente

Pré-requisito: Node.js 22 e npm instalados.

1. Deixe o backend executando na porta 8080.
2. Em outro PowerShell, entre na pasta **frontend**:

   ```powershell
   cd C:\Projetos\javafrota\frontend
   ```

3. Instale dependências e inicie o React + Vite:

   ```powershell
   npm install
   npm run dev
   ```

4. Acesse http://localhost:4200. O arquivo `vite.config.ts` configura o proxy para encaminhar `/api` para `http://localhost:8080`.

## 9. Publicar no seu repositório GitHub já criado

Repositório informado: [github.com/alissonandrade2020/javafrota](https://github.com/alissonandrade2020/javafrota).

### 9.1 Coloque o projeto dentro da pasta versionada

A raiz do Git deve ficar parecida com isto:

```text
javafrota/                 <- raiz Git
├── backend/
├── frontend/
├── .github/workflows/ci-cd.yaml
├── compose.yaml
├── compose.homolog.yaml
├── compose.producao.yaml
├── .env.example
└── README.md
```

O `README.md`, `backend` e `frontend` ficam no mesmo nível. Não crie repositórios Git separados dentro de `backend` e `frontend`.

### 9.2 Verifique o Git antes de configurar o remoto

Abra PowerShell na raiz onde estão `backend` e `frontend`:

```powershell
git status
git remote -v
```

Se `git status` informar que ainda não é um repositório, execute `git init`. Se já houver um `origin`, confira se aponta para `https://github.com/alissonandrade2020/javafrota.git`.

Se não houver `origin`:

```powershell
git remote add origin https://github.com/alissonandrade2020/javafrota.git
```

Se o remoto estiver apontando para outro endereço:

```powershell
git remote set-url origin https://github.com/alissonandrade2020/javafrota.git
```

### 9.3 Envio inicial para `dev`

Se o repositório remoto estiver **vazio**, execute na raiz Git:

```powershell
git init
git add .
git status
git commit -m "feat: adiciona FrotaFlow full stack"
git branch -M dev
git push -u origin dev
```

Antes de confirmar o commit, confira a saída de `git status`: `.env`, tokens e senhas reais não devem estar na lista de arquivos enviados.

Se o Git disser que não há nada para commit, ou se o GitHub já tiver um README/commit inicial, não force o push. Execute:

```powershell
git fetch origin
git status
git branch -a
```

Se houver divergência entre os históricos, faça backup e integre os históricos antes de enviar. Não use `git push --force` para resolver esse caso. Se necessário, compartilhe a saída desses três comandos (sem tokens/credenciais) para receber instruções específicas.

### 9.4 Fluxo normal de trabalho

- `dev`: desenvolvimento e deploy de homologação.
- `main`: referência estável para produção.
- Faça alterações na `dev`, teste e envie:

  ```powershell
  git add .
  git commit -m "feat: descreva sua alteração"
  git push origin dev
  ```

Criar o repositório GitHub não envia arquivos automaticamente. O `git push` é o passo que envia o código.

## 10. CI/CD: o que já está configurado

O pipeline está em `.github/workflows/ci-cd.yaml`:

1. Em pull request/push para `dev`, testa o backend e compila o frontend.
2. Em push bem-sucedido para `dev`, constrói imagens Docker versionadas pelo SHA curto do commit e publica no GitHub Container Registry (GHCR).
3. O job de homologação tenta atualizar o servidor configurado.
4. Produção é uma promoção manual da imagem já testada, com aprovação do ambiente `producao`.

**O CI/CD não consegue publicar em um servidor só porque o repositório existe.** Para deploy real, você precisa configurar os servidores, arquivos Compose, SSH e secrets nas seções seguintes. Até configurar os secrets, o job de deploy pode falhar; os jobs de teste/build são independentes desse preparo.

## 11. Preparar os servidores Linux

Recomendação: dois servidores Linux ou ambientes isolados, um para homologação e outro para produção. Instale Docker Engine, plugin Docker Compose e `curl`. Restrinja o SSH e firewall. Para uso público, configure domínio e HTTPS. Não exponha a porta do PostgreSQL à internet.

No servidor de homologação, crie a pasta:

```bash
sudo mkdir -p /opt/frota/homolog
sudo chown -R "$USER":"$USER" /opt/frota/homolog
```

Copie `compose.homolog.yaml` do projeto para `/opt/frota/homolog/compose.homolog.yaml`.

No servidor de produção, crie a pasta:

```bash
sudo mkdir -p /opt/frota/producao
sudo chown -R "$USER":"$USER" /opt/frota/producao
```

Copie `compose.producao.yaml` para `/opt/frota/producao/compose.producao.yaml`.

O usuário SSH do deploy precisa acessar a pasta e executar Docker sem interação. Atenção: acesso ao grupo `docker` equivale, na prática, a privilégios elevados.

### 11.1 Secrets do GitHub

No GitHub, abra **Settings → Environments** e crie os ambientes com os nomes exatos `homologacao` e `producao`. Cadastre os secrets a seguir em cada ambiente, com os valores do servidor daquele ambiente:

| Secret | Valor |
|---|---|
| `DEPLOY_HOST` | IP ou domínio do servidor |
| `DEPLOY_USER` | Usuário SSH de deploy |
| `DEPLOY_SSH_KEY` | Chave privada SSH autorizada no servidor |
| `DB_PASSWORD` | Senha exclusiva do PostgreSQL desse ambiente |
| `GHCR_USER` | Usuário GitHub que pode baixar os pacotes |
| `GHCR_TOKEN` | Token com permissão `read:packages` |

O workflow usa `GITHUB_TOKEN` para publicar imagens. O servidor usa `GHCR_TOKEN` para baixá-las. Não coloque tokens/chaves/senhas no código nem em arquivos versionados. Configure aprovação obrigatória para o ambiente `producao`, quando disponível.

Antes do primeiro deploy, verifique se o arquivo Compose correto existe no caminho do servidor. O workflow não provisiona o servidor nem copia esses arquivos automaticamente.

## 12. Publicar em homologação

Depois de configurar servidor, Compose e secrets:

1. Faça commit e push para `dev`:

   ```powershell
   git add .
   git commit -m "feat: melhoria na frota"
   git push origin dev
   ```

2. No GitHub, abra **Actions → CI, homologacao e producao**.
3. Acompanhe testes, publicação de imagens e deploy.
4. Teste `http://IP_OU_DNS_DO_SERVIDOR:8081` e `http://IP_OU_DNS_DO_SERVIDOR:8081/api/health`.

Se falhar, confira logs do workflow, secrets, acesso SSH, permissões GHCR e Compose no servidor.

## 13. Promover para produção

Só promova depois de validar a mesma versão em homologação:

1. Abra **Actions** e selecione `CI, homologacao e producao`.
2. Clique em **Run workflow** e escolha a branch `dev`.
3. Em `image_tag`, informe o SHA curto real do commit testado em homologação (não use um valor fictício).
4. Marque `deploy_production` como `true` e inicie.
5. Aprove a execução quando o ambiente `producao` solicitar revisão.
6. Valide `http://IP_OU_DNS_DO_SERVIDOR:8080/api/health` e a interface.

Rollback dos containers não desfaz mudanças no schema do banco. Faça backup e teste restauração antes de usar dados importantes.

## 14. Rotas disponíveis

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/health` | Verifica se a API responde |
| `GET` | `/api/dashboard` | Contadores do painel |
| `GET` | `/api/veiculos` | Lista veículos; filtros opcionais `q` e `status` |
| `GET` | `/api/veiculos/{id}` | Busca por ID |
| `POST` | `/api/veiculos` | Cadastra veículo |
| `PUT` | `/api/veiculos/{id}` | Atualiza veículo |
| `DELETE` | `/api/veiculos/{id}` | Exclui veículo |

Status aceitos: `ATIVO`, `MANUTENCAO`, `INATIVO`. A placa usa formato Mercosul, por exemplo `ABC1D23`, e deve ser única.

## 15. Segurança antes de usar em produção real

Este é um projeto de portfólio/demonstração, não um sistema pronto para dados sensíveis. Antes de uso real, implemente e revise autenticação/autorização, HTTPS, gestão de segredos, backups e testes de restauração, migrações de banco versionadas, monitoramento, firewall e atualização das imagens. Não exponha PostgreSQL diretamente à internet.
