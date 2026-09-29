# Sistema de Gerenciamento - VCC Motores

Sistema de gerenciamento desenvolvido para uma empresa de manutenção de bombas hidráulicas, com foco no controle de clientes, manutenções, orçamentos e pagamentos.

O projeto foi desenvolvido utilizando Java e Spring Boot, com uma API REST integrada a um banco de dados PostgreSQL, permitindo gerenciar clientes, manutenções, orçamentos e pagamentos, além de aplicar validações, tratamento de exceções e regras de negócio.

O projeto foi desenvolvido com foco em:

* Desenvolvimento de APIs REST com Spring Boot
* Estruturação e organização de projetos em camadas
* Modelagem de entidades e relacionamentos
* Persistência de dados com Spring Data JPA e Hibernate
* Integração com banco de dados PostgreSQL
* Implementação de regras de negócio
* Validação de dados
* Tratamento de exceções
* Testes automatizados

---

# Funcionalidades

### Clientes

* Cadastro de clientes
* Consulta de clientes
* Busca de cliente por ID
* Busca de clientes por nome
* Atualização de dados
* Exclusão de clientes
* Validação de CPF, e-mail, nome e telefone

### Manutenções

* Cadastro de manutenções
* Consulta de manutenções
* Busca por cliente
* Busca por status
* Atualização de manutenções
* Exclusão de manutenções
* Controle de status da manutenção
* Validação dos dados
* Regras para controlar a transição entre os status

### Orçamentos

* Cadastro de orçamentos
* Consulta de orçamentos
* Busca por status
* Atualização de orçamentos
* Exclusão de orçamentos
* Associação de múltiplas manutenções a um orçamento
* Controle de aprovação e cancelamento
* Regra para impedir mais de um orçamento ativo para a mesma manutenção

### Pagamentos

* Cadastro de pagamentos
* Consulta de pagamentos
* Busca por status
* Atualização de pagamentos
* Exclusão de pagamentos
* Controle de método e status do pagamento
* Regra que permite pagamento somente após aprovação do orçamento
* Regra que impede mais de um pagamento para o mesmo orçamento

---

# Tecnologias utilizadas

* Java 25
* Spring Boot
* Spring Web
* Spring Data JPA
* Hibernate
* Bean Validation
* PostgreSQL
* Maven
* JUnit

# Ferramentas

* Eclipse
* Postman
* Git
* GitHub

---

# Testes

Foram implementados testes automatizados para verificar comportamentos importantes dos serviços da aplicação, incluindo:

* Busca de registros existentes
* Tratamento de IDs inexistentes
* Validação das transições de status de manutenções
* Bloqueio de orçamentos ativos duplicados
* Bloqueio de pagamentos para orçamentos não aprovados

Além dos testes automatizados, a API foi testada manualmente utilizando o Postman, verificando operações CRUD, validações, respostas HTTP e regras de negócio.

---

# Estrutura do projeto

O projeto segue uma estrutura em camadas, separando as responsabilidades entre:

* **Resources:** responsáveis pelos endpoints da API
* **Services:** responsáveis pelas regras de negócio
* **Repositories:** responsáveis pelo acesso aos dados
* **Entities:** representam as entidades do sistema
* **Exceptions:** responsáveis pelo tratamento dos erros da aplicação

---

# Como executar

1. Clone o repositório.
2. Crie um banco de dados PostgreSQL.
3. Configure as credenciais do banco no arquivo `application-local.properties`.
4. Execute o projeto utilizando o Maven.
5. A API estará disponível em `http://localhost:8080`.

---

# Objetivo

Este projeto foi desenvolvido a partir de uma necessidade real de uma pequena empresa de manutenção de bombas hidráulicas, pertencente a um amigo, com o objetivo de criar uma solução simples para auxiliar no gerenciamento de clientes, manutenções, orçamentos e pagamentos.

Além de buscar atender a essa necessidade, o projeto também foi desenvolvido como parte dos meus estudos em Java e Spring Boot, permitindo aplicar na prática os conhecimentos adquiridos e desenvolver um projeto real para composição do meu portfólio em desenvolvimento Back-end.

Projeto desenvolvido com o objetivo de unir aprendizado, prática e uma aplicação para uma necessidade real.
