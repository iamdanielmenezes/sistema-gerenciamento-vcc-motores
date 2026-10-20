# VCC Motores — Sistema de Gerenciamento

Sistema web de gerenciamento desenvolvido para uma empresa de manutenção de bombas hidráulicas, com foco no controle de **clientes, manutenções, orçamentos e pagamentos**.

O projeto surgiu de uma necessidade real de uma pequena empresa e foi desenvolvido como parte dos meus estudos em **Java e Spring Boot**, com o objetivo de aplicar conhecimentos de desenvolvimento backend em uma solução prática.

Inicialmente, desenvolvi uma **API REST em Java com Spring Boot**, integrada ao PostgreSQL, implementando persistência de dados, validações, tratamento de exceções, testes automatizados e regras de negócio.

Posteriormente, para demonstrar as funcionalidades do sistema de forma visual, desenvolvi o **frontend em React e TypeScript com assistência de inteligência artificial**, realizando a integração com a API e os testes entre as camadas.

Atualmente, o sistema funciona como uma **aplicação full-stack executável**, com o frontend servido pelo próprio Spring Boot, sem necessidade de iniciar as IDEs ou o servidor de desenvolvimento do Vite.

## Tecnologias utilizadas

### Backend

- Java 25
- Spring Boot 4.1.1
- Spring Web MVC
- Spring Data JPA
- Hibernate
- Bean Validation
- PostgreSQL
- Maven
- JUnit

### Frontend

- React
- TypeScript
- Vite
- HTML5
- CSS3
- Fetch API

### Ferramentas

- Eclipse
- IntelliJ IDEA
- Postman
- Git
- GitHub

## Funcionalidades

### Clientes

- Cadastro de clientes
- Consulta e listagem de clientes
- Busca de clientes por ID e nome
- Atualização de dados cadastrais
- Exclusão de clientes
- Validação de CPF, e-mail, nome e telefone

### Manutenções

- Cadastro de manutenções vinculadas a clientes
- Consulta e listagem de manutenções
- Busca por cliente e status
- Atualização e exclusão de registros
- Controle dos status:
  - Orçado
  - Em manutenção
  - Finalizado
- Validação das transições de status conforme as regras de negócio

### Orçamentos

- Cadastro e consulta de orçamentos
- Associação de múltiplas manutenções a um orçamento
- Busca por status
- Atualização e exclusão
- Aprovação e cancelamento de orçamentos
- Regra para impedir mais de um orçamento ativo para a mesma manutenção

### Pagamentos

- Cadastro e consulta de pagamentos
- Busca por status
- Atualização e exclusão
- Controle do método de pagamento
- Controle do status do pagamento
- Regra que permite pagamentos somente para orçamentos aprovados
- Regra que impede mais de um pagamento para o mesmo orçamento

### Dashboard

O frontend possui um painel inicial integrado à API REST, apresentando informações reais armazenadas no PostgreSQL.

Entre os indicadores e informações disponíveis estão:

- Total de clientes cadastrados
- Quantidade de manutenções em andamento
- Quantidade de orçamentos aguardando aprovação
- Quantidade de pagamentos pendentes
- Listagem de clientes cadastrados
- Manutenções recentes, ordenadas por data

A interface também oferece navegação entre os módulos, formulários de cadastro e edição, tabelas, filtros e mensagens de retorno das operações.

## Arquitetura do projeto

A aplicação é organizada em três partes principais:

**Backend — Java e Spring Boot**

Responsável pelos endpoints REST, regras de negócio, validações, tratamento de exceções e persistência de dados.

O backend segue uma arquitetura em camadas:

- **Resources:** disponibilizam os endpoints HTTP da API.
- **Services:** implementam as regras de negócio.
- **Repositories:** realizam o acesso aos dados.
- **Entities:** representam as entidades e seus relacionamentos.
- **Exceptions:** tratam os erros e as exceções da aplicação.

**Frontend — React e TypeScript**

Responsável pela interface web e pela comunicação com a API.

O frontend está organizado em páginas, componentes, serviços de integração e tipos TypeScript.

A comunicação é realizada por requisições HTTP utilizando a Fetch API, com troca de dados em formato JSON.

**Banco de dados — PostgreSQL**

Responsável pelo armazenamento persistente das informações de clientes, manutenções, orçamentos e pagamentos.

### Integração entre frontend e backend

Durante o desenvolvimento, o frontend utiliza o Vite na porta `5173`, com um proxy que encaminha as requisições da API para o Spring Boot na porta `8080`.

Para executar a aplicação completa, o frontend é compilado e seus arquivos são incorporados ao `.jar` do Spring Boot por meio do Maven.

Dessa forma, a interface e a API ficam disponíveis no mesmo endereço:

`http://localhost:8080`

## Endpoints da API

| Módulo | Endpoint base |
|---|---|
| Clientes | `/client` |
| Manutenções | `/maintenance` |
| Orçamentos | `/budget` |
| Pagamentos | `/payment` |

A API disponibiliza operações de cadastro, consulta, atualização e exclusão, além de filtros específicos de cada módulo.

## Regras de negócio

Além das operações CRUD, o backend implementa regras para garantir a consistência dos dados.

Entre elas:

- Validação dos dados cadastrais dos clientes
- Controle das transições de status das manutenções
- Impedimento de orçamentos ativos duplicados para uma mesma manutenção
- Restrição de pagamentos a orçamentos aprovados
- Impedimento de pagamentos duplicados para um mesmo orçamento

Essas regras são aplicadas no backend, independentemente da interface utilizada para acessar a API.

## Testes

Foram implementados testes automatizados para verificar comportamentos importantes dos serviços da aplicação, incluindo:

- Busca de registros existentes
- Tratamento de IDs inexistentes
- Validação das transições de status de manutenções
- Bloqueio de orçamentos ativos duplicados
- Bloqueio de pagamentos para orçamentos não aprovados

A API também foi testada manualmente utilizando o Postman, verificando operações CRUD, validações, respostas HTTP e regras de negócio.

Após a implementação do frontend, foram realizados testes manuais de integração entre React, Spring Boot e PostgreSQL, incluindo operações de cadastro, edição, exclusão, filtros e alterações de status.

O frontend também foi validado por meio do build de produção do Vite, incluindo a verificação do TypeScript.

A aplicação completa foi executada localmente por meio de um `.jar` do Spring Boot, com o frontend integrado e acesso aos dados do PostgreSQL.

## Como executar o projeto

O VCC Motores pode ser executado de duas formas:

1. **Aplicação completa:** frontend e backend executados juntos pelo Spring Boot.
2. **Ambiente de desenvolvimento:** frontend e backend iniciados separadamente.

### Pré-requisitos

- JDK 25
- PostgreSQL
- Node.js e npm
- Maven Wrapper, já incluído no repositório

O Node.js e o npm são necessários para compilar o frontend. Depois que o `.jar` completo é gerado, não é necessário iniciar o Vite para utilizar o sistema.

### 1. Clonar o repositório

```bash
git clone https://github.com/iamdanielmenezes/sistema-gerenciamento-vcc-motores.git
```

Entre na pasta do projeto:

```bash
cd sistema-gerenciamento-vcc-motores
```

### 2. Configurar o PostgreSQL

Crie um banco de dados PostgreSQL com o nome:

```text
VCCMotores
```

A configuração padrão da aplicação utiliza:

```text
jdbc:postgresql://localhost:5432/VCCMotores
```

Para configurar as credenciais locais, crie o arquivo:

`src/main/resources/application-local.properties`

Com o seguinte conteúdo, substituindo os valores pelas suas credenciais:

```properties
spring.datasource.username=SEU_USUARIO
spring.datasource.password=SUA_SENHA
```

Esse arquivo é ignorado pelo Git para evitar a publicação de credenciais.

**Importante:** a configuração local precisa estar disponível no momento do empacotamento para ser incluída no `.jar`, ou as credenciais devem ser fornecidas externamente durante a execução, por exemplo, por meio das variáveis de ambiente `SPRING_DATASOURCE_USERNAME` e `SPRING_DATASOURCE_PASSWORD`.

Mantenha o PostgreSQL em execução enquanto utilizar o sistema.

### 3. Gerar o frontend de produção

No terminal, entre na pasta `frontend`:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Gere os arquivos de produção:

```bash
npm run build
```

No Windows PowerShell, caso necessário, utilize `npm.cmd` no lugar de `npm`.

Após o build, o Vite criará a pasta `frontend/dist`.

### 4. Gerar a aplicação executável

Volte para a raiz do projeto:

```bash
cd ..
```

No Windows, execute:

```powershell
.\mvnw.cmd clean package -DskipTests
```

Esse comando compila o backend, copia os arquivos gerados do frontend para os recursos estáticos do Spring Boot e cria o `.jar` executável.

O arquivo gerado será:

```text
target/Sistema-de-gerenciamento-0.0.1-SNAPSHOT.jar
```

O parâmetro `-DskipTests` pula a execução dos testes durante esse empacotamento. Para executar os testes automatizados, utilize:

```powershell
.\mvnw.cmd test
```

### 5. Iniciar o VCC Motores

Com o PostgreSQL funcionando, execute na raiz do projeto:

```powershell
java -jar .\target\Sistema-de-gerenciamento-0.0.1-SNAPSHOT.jar
```

Aguarde o Spring Boot iniciar e acesse:

**http://localhost:8080**

A interface React e a API estarão disponíveis na mesma aplicação.

Não é necessário abrir Eclipse, IntelliJ ou iniciar o Vite.

### Inicialização simplificada no Windows

O projeto também possui o arquivo:

`Iniciar-VCC-Motores.bat`

Depois de gerar o `.jar`, basta dar dois cliques nesse arquivo para iniciar o sistema e abrir o endereço local no navegador.

**Observações:**

- O PostgreSQL precisa estar funcionando.
- O `.jar` deve ter sido gerado previamente.
- A janela de execução deve permanecer aberta enquanto o sistema estiver em uso.
- Caso o navegador abra antes da inicialização completa do Spring Boot, aguarde alguns segundos e atualize a página.

### Execução em ambiente de desenvolvimento

Para trabalhar no backend e no frontend separadamente:

1. Inicie o PostgreSQL.
2. Execute o backend Spring Boot na porta `8080`.
3. Abra outro terminal na pasta `frontend`.
4. Instale as dependências, caso ainda não tenha feito isso.
5. Execute:

```bash
npm run dev
```

Acesse:

**http://localhost:5173**

O proxy do Vite encaminhará as requisições da API para o backend na porta `8080`.

## Estrutura principal do repositório

```text
sistema-gerenciamento-vcc-motores/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── VCCMotores/
│   │   │       └── Sistema_de_gerenciamento/
│   │   │           ├── entities/
│   │   │           ├── repositories/
│   │   │           ├── resources/
│   │   │           └── services/
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│
├── Iniciar-VCC-Motores.bat
├── mvnw
├── mvnw.cmd
├── pom.xml
└── README.md
```

As pastas `target/`, `frontend/dist/` e `frontend/node_modules/` são geradas localmente e não são versionadas no repositório.

## Desenvolvimento e uso de inteligência artificial

O backend do VCC Motores foi desenvolvido por mim, utilizando **Java, Spring Boot e PostgreSQL**, com foco no aprendizado e na aplicação prática de APIs REST, arquitetura em camadas, persistência de dados, validações, tratamento de exceções, testes automatizados e regras de negócio.

Para ampliar o projeto e apresentar suas funcionalidades por meio de uma interface web, desenvolvi o frontend em **React e TypeScript com assistência de inteligência artificial**.

Durante essa etapa, acompanhei a implementação, realizei a integração com a API, executei testes funcionais, identifiquei problemas e apliquei ajustes para garantir a comunicação entre as camadas.

Posteriormente, integrei o frontend compilado ao Spring Boot, permitindo executar o sistema como uma única aplicação Java.

O uso de IA foi um recurso de apoio ao desenvolvimento do frontend, enquanto o **backend Java e suas regras de negócio representam o principal foco técnico deste projeto de portfólio**.

## Objetivo do projeto

Este projeto foi desenvolvido a partir de uma necessidade real de uma pequena empresa de manutenção de bombas hidráulicas, pertencente a um amigo.

A proposta é oferecer uma solução para auxiliar no gerenciamento de clientes, manutenções, orçamentos e pagamentos, organizando informações que podem fazer parte da rotina de uma oficina.

Além de buscar atender a essa necessidade, o projeto foi desenvolvido como parte dos meus estudos em Java e Spring Boot, permitindo aplicar conhecimentos em um cenário próximo de uma aplicação real.

A evolução do backend para uma aplicação full-stack também proporcionou experiência com integração entre tecnologias, comunicação HTTP, construção de interfaces e empacotamento de aplicações.

## Status do projeto

**Funcionalidades principais implementadas e testadas em ambiente local.**

- API REST desenvolvida com Java e Spring Boot
- Persistência de dados com PostgreSQL
- Regras de negócio e validações
- Testes automatizados no backend
- Frontend React e TypeScript integrado à API
- Dashboard com informações reais
- Build de produção do frontend
- Empacotamento do frontend e backend em um `.jar` executável
- Inicialização simplificada no Windows por meio de arquivo `.bat`

O sistema está preparado para execução local. **Não há hospedagem pública configurada neste repositório.**

A aplicação não possui autenticação de usuários implementada e não deve ser disponibilizada diretamente na internet sem a implementação dos controles de segurança necessários.

## Autor

**Daniel Menezes**

Projeto desenvolvido com o objetivo de unir aprendizado, prática e uma solução voltada a uma necessidade real, como parte do meu portfólio em desenvolvimento backend Java.

[Repositório no GitHub](https://github.com/iamdanielmenezes/sistema-gerenciamento-vcc-motores)
