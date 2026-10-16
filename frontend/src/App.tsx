
import { useEffect, useState } from "react";
import type { Cliente } from "./types/Client";
import {
    listarClientes,
    cadastrarCliente,
    atualizarCliente,
    excluirCliente,
    buscarClientePorId,
} from "./services/ClienteService";
import { ApiError } from "./services/apiError";
import Botao from "./components/Botao";
import "./App.css";

type Status = "Em andamento" | "Concluída" | "Aguardando";

type Manutencao = {
    id: number;
    cliente: string;
    servico: string;
    data: string;
    status: Status;
};

const manutencoes: Manutencao[] = [
    {
        id: 101,
        cliente: "Carlos Oliveira",
        servico: "Revisão do motor",
        data: "08/10/2026",
        status: "Em andamento",
    },
    {
        id: 102,
        cliente: "Mariana Santos",
        servico: "Troca de óleo",
        data: "07/10/2026",
        status: "Concluída",
    },
    {
        id: 103,
        cliente: "Roberto Lima",
        servico: "Diagnóstico do motor",
        data: "06/10/2026",
        status: "Aguardando",
    },
];

function Badge({ status }: { status: Status }) {
    const classe =
        status === "Concluída"
            ? "badge badge-sucesso"
            : status === "Em andamento"
                ? "badge badge-andamento"
                : "badge badge-pendente";

    return <span className={classe}>{status}</span>;
}

function CardIndicador({
                           titulo,
                           valor,
                           descricao,
                           simbolo,
                       }: {
    titulo: string;
    valor: string;
    descricao: string;
    simbolo: string;
}) {
    return (
        <article className="card-indicador">
            <div className="indicador-topo">
                <span className="indicador-titulo">{titulo}</span>
                <span className="indicador-icone" aria-hidden="true">
          {simbolo}
        </span>
            </div>

            <strong className="indicador-valor">{valor}</strong>
            <p className="indicador-descricao">{descricao}</p>
        </article>
    );
}

function App() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [carregandoClientes, setCarregandoClientes] = useState(true);
    const [erroClientes, setErroClientes] = useState("");
    const [processando, setProcessando] = useState(false);

    function mensagemErro(erro: unknown): string {
        if (erro instanceof ApiError) {
            return `Erro ${erro.status}: ${erro.message}`;
        }

        return "Não foi possível conectar ao servidor. Verifique se o backend está rodando.";
    }

    function mostrarErro(erro: unknown) {
        console.error("Erro na API:", erro);
        alert(mensagemErro(erro));
    }

    useEffect(() => {
        async function buscarClientes() {
            try {
                const dados = await listarClientes();
                setClientes(dados);
                setErroClientes("");
            } catch (erro) {
                console.error("Erro ao buscar clientes:", erro);
                setErroClientes(mensagemErro(erro));
            } finally {
                setCarregandoClientes(false);
            }
        }

        buscarClientes();
    }, []);

    // Localiza apenas o cliente criado para os testes.
    function encontrarClienteTeste() {
        return clientes.find(
            (cliente) => cliente.email === "teste@email.com"
        );
    }

    // POST - Cadastrar cliente de teste
    async function testarCadastro() {
        if (processando) return;

        if (encontrarClienteTeste()) {
            alert("O Cliente Teste já está cadastrado.");
            return;
        }

        const confirmou = window.confirm(
            "Deseja cadastrar um cliente de teste no banco de dados?"
        );

        if (!confirmou) return;

        setProcessando(true);

        try {
            const novoCliente = await cadastrarCliente({
                name: "Cliente Teste",
                cpf: "52998224725",
                email: "teste@email.com",
                phone: "13999999999",
            });

            setClientes((anteriores) => [
                ...anteriores,
                novoCliente,
            ]);

            alert("Cliente cadastrado com sucesso!");
        } catch (erro) {
            mostrarErro(erro);
        } finally {
            setProcessando(false);
        }
    }

    // PUT - Atualizar cliente de teste
    async function testarAtualizacao() {
        if (processando) return;

        const clienteTeste = encontrarClienteTeste();

        if (!clienteTeste) {
            alert("Cliente Teste não encontrado.");
            return;
        }

        const confirmou = window.confirm(
            "Deseja atualizar o nome do Cliente Teste?"
        );

        if (!confirmou) return;

        setProcessando(true);

        try {
            const atualizado = await atualizarCliente(
                clienteTeste.id,
                {
                    name: "Cliente Teste Atualizado",
                    cpf: clienteTeste.cpf,
                    email: clienteTeste.email,
                    phone: clienteTeste.phone,
                }
            );

            setClientes((anteriores) =>
                anteriores.map((cliente) =>
                    cliente.id === atualizado.id
                        ? atualizado
                        : cliente
                )
            );

            alert("Cliente atualizado com sucesso!");
        } catch (erro) {
            mostrarErro(erro);
        } finally {
            setProcessando(false);
        }
    }

    // DELETE - Excluir cliente de teste
    async function testarExclusao() {
        if (processando) return;

        const clienteTeste = encontrarClienteTeste();

        if (!clienteTeste) {
            alert("Cliente Teste não encontrado.");
            return;
        }

        const confirmou = window.confirm(
            `Deseja excluir "${clienteTeste.name}" do banco de dados?`
        );

        if (!confirmou) return;

        setProcessando(true);

        try {
            await excluirCliente(clienteTeste.id);

            setClientes((anteriores) =>
                anteriores.filter(
                    (cliente) => cliente.id !== clienteTeste.id
                )
            );

            alert("Cliente excluído com sucesso!");
        } catch (erro) {
            mostrarErro(erro);
        } finally {
            setProcessando(false);
        }
    }

    // GET - Testar tratamento de erro HTTP 404
    async function testarErroApi() {
        if (processando) return;

        setProcessando(true);

        try {
            await buscarClientePorId(999999999);
            alert(
                "O cliente foi encontrado. Escolha outro ID para testar o erro 404."
            );
        } catch (erro) {
            mostrarErro(erro);
        } finally {
            setProcessando(false);
        }
    }

    return (
        <div className="layout">
            <aside className="menu-lateral">
                <div className="marca">
                    <div className="marca-icone">V</div>
                    <div>
                        <h2>VCC Motores</h2>
                        <span>Gestão de serviços</span>
                    </div>
                </div>

                <span className="menu-legenda">MENU PRINCIPAL</span>

                <nav className="navegacao" aria-label="Menu principal">
                    <p className="item-menu ativo">▦ Dashboard</p>
                    <p className="item-menu">♙ Clientes</p>
                    <p className="item-menu">⚙ Manutenções</p>
                    <p className="item-menu">▤ Orçamentos</p>
                    <p className="item-menu">▣ Pagamentos</p>
                </nav>

                <div className="menu-rodape">
                    <span className="status-ponto" />
                    <span>Sistema de gerenciamento</span>
                </div>
            </aside>

            <div className="area-principal">
                <header className="cabecalho">
                    <div className="cabecalho-titulo">
                        <h1>Sistema de gerenciamento</h1>
                        <p>VCC Motores | Gestão de serviços</p>
                    </div>

                    <div className="usuario">
                        <div className="avatar">V</div>
                        <div className="usuario-info">
                            <strong>Administrador</strong>
                            <span>Painel de gestão</span>
                        </div>
                    </div>
                </header>

                <main className="conteudo">
                    <section className="titulo-pagina">
                        <div>
                            <span className="texto-superior">VISÃO GERAL</span>
                            <h2>Dashboard</h2>
                            <p>Acompanhe os principais indicadores da oficina.</p>
                        </div>

                        <div className="acoes-pagina">
              <span className="data-atual">
                Outubro de 2026
              </span>

                            <Botao
                                texto="+ Novo cliente"
                                aoClicar={testarCadastro}
                                desabilitado={
                                    processando ||
                                    carregandoClientes ||
                                    !!erroClientes
                                }
                            />

                            <Botao
                                texto="Testar PUT"
                                aoClicar={testarAtualizacao}
                                variante="secundario"
                                desabilitado={
                                    processando ||
                                    carregandoClientes ||
                                    !!erroClientes
                                }
                            />

                            <Botao
                                texto="Testar DELETE"
                                aoClicar={testarExclusao}
                                variante="secundario"
                                desabilitado={
                                    processando ||
                                    carregandoClientes ||
                                    !!erroClientes
                                }
                            />

                            <Botao
                                texto="Testar erro 404"
                                aoClicar={testarErroApi}
                                variante="secundario"
                                desabilitado={processando}
                            />
                        </div>
                    </section>

                    <section
                        className="grade-indicadores"
                        aria-label="Indicadores"
                    >
                        <CardIndicador
                            titulo="Total de clientes"
                            valor={
                                carregandoClientes
                                    ? "..."
                                    : erroClientes
                                        ? "—"
                                        : String(clientes.length)
                            }
                            descricao="Clientes cadastrados"
                            simbolo="♙"
                        />

                        <CardIndicador
                            titulo="Manutenções em andamento"
                            valor="12"
                            descricao="Serviços em execução"
                            simbolo="⚙"
                        />

                        <CardIndicador
                            titulo="Orçamentos pendentes"
                            valor="05"
                            descricao="Aguardando aprovação"
                            simbolo="▤"
                        />

                        <CardIndicador
                            titulo="Pagamentos pendentes"
                            valor="08"
                            descricao="Aguardando pagamento"
                            simbolo="$"
                        />
                    </section>

                    <section className="painel">
                        <div className="painel-cabecalho">
                            <div>
                                <h3>Clientes recebidos da API</h3>
                                <p>Dados carregados do Spring Boot.</p>
                            </div>
                        </div>

                        {carregandoClientes ? (
                            <p>Carregando clientes...</p>
                        ) : erroClientes ? (
                            <p role="alert">{erroClientes}</p>
                        ) : clientes.length === 0 ? (
                            <p>Nenhum cliente cadastrado.</p>
                        ) : (
                            <div className="tabela-container">
                                <table className="tabela">
                                    <thead>
                                    <tr>
                                        <th scope="col">Nome</th>
                                        <th scope="col">CPF</th>
                                        <th scope="col">E-mail</th>
                                        <th scope="col">Telefone</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {clientes.map((cliente) => (
                                        <tr key={cliente.id}>
                                            <td className="celula-cliente">
                                                {cliente.name}
                                            </td>
                                            <td>{cliente.cpf}</td>
                                            <td>{cliente.email}</td>
                                            <td>{cliente.phone}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="painel">
                        <div className="painel-cabecalho">
                            <div>
                                <h3>Manutenções recentes</h3>
                                <p>
                                    Acompanhe os últimos serviços registrados.
                                </p>
                            </div>

                            <span className="contador-registros">
                3 registros de exemplo
              </span>
                        </div>

                        <div className="tabela-container">
                            <table className="tabela">
                                <thead>
                                <tr>
                                    <th scope="col">Nº</th>
                                    <th scope="col">Cliente</th>
                                    <th scope="col">Serviço</th>
                                    <th scope="col">Data</th>
                                    <th scope="col">Status</th>
                                </tr>
                                </thead>

                                <tbody>
                                {manutencoes.map((manutencao) => (
                                    <tr key={manutencao.id}>
                                        <td>#{manutencao.id}</td>
                                        <td className="celula-cliente">
                                            {manutencao.cliente}
                                        </td>
                                        <td>{manutencao.servico}</td>
                                        <td>{manutencao.data}</td>
                                        <td>
                                            <Badge status={manutencao.status} />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="painel-rodape">
              <span>
                Dados ilustrativos para a construção da interface.
              </span>
                        </div>
                    </section>

                    <footer className="rodape-conteudo">
                        VCC Motores · Sistema de gerenciamento
                    </footer>
                </main>
            </div>
        </div>
    );
}

export default App;
