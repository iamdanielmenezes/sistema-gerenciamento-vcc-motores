
import { useEffect, useState } from "react";
import type { Cliente } from "./types/Client";
import { listarClientes } from "./services/ClienteService";
import { ApiError } from "./services/apiError";
import Clientes from "./pages/Clientes";
import Manutencoes from "./pages/Manutencoes";
import "./App.css";

type Pagina =
    | "dashboard"
    | "clientes"
    | "manutencoes"
    | "orcamentos"
    | "pagamentos";

type StatusManutencaoExemplo =
    | "Em andamento"
    | "Concluída"
    | "Aguardando";

type ManutencaoExemplo = {
    id: number;
    cliente: string;
    servico: string;
    data: string;
    status: StatusManutencaoExemplo;
};

const manutencoesExemplo: ManutencaoExemplo[] = [
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

const itensMenu: {
    pagina: Pagina;
    icone: string;
    titulo: string;
}[] = [
    {
        pagina: "dashboard",
        icone: "▦",
        titulo: "Dashboard",
    },
    {
        pagina: "clientes",
        icone: "♙",
        titulo: "Clientes",
    },
    {
        pagina: "manutencoes",
        icone: "⚙",
        titulo: "Manutenções",
    },
    {
        pagina: "orcamentos",
        icone: "▤",
        titulo: "Orçamentos",
    },
    {
        pagina: "pagamentos",
        icone: "▣",
        titulo: "Pagamentos",
    },
];

function mensagemErro(erro: unknown): string {
    if (erro instanceof ApiError) {
        return `Erro ${erro.status}: ${erro.message}`;
    }

    return "Não foi possível conectar ao servidor. Verifique se o backend está funcionando.";
}

function BadgeManutencao({
                             status,
                         }: {
    status: StatusManutencaoExemplo;
}) {
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

function Dashboard({
                       aoAbrirClientes,
                       aoAbrirManutencoes,
                   }: {
    aoAbrirClientes: () => void;
    aoAbrirManutencoes: () => void;
}) {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarClientes() {
            try {
                const dados = await listarClientes();

                if (ativo) {
                    setClientes(dados);
                    setErro("");
                }
            } catch (erroRecebido) {
                if (ativo) {
                    setErro(mensagemErro(erroRecebido));
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        void carregarClientes();

        return () => {
            ativo = false;
        };
    }, []);

    const totalClientes = carregando
        ? "..."
        : erro
            ? "—"
            : String(clientes.length);

    return (
        <>
            <section className="titulo-pagina">
                <div>
                    <span className="texto-superior">VISÃO GERAL</span>

                    <h2>Dashboard</h2>

                    <p>
                        Acompanhe os principais indicadores da oficina.
                    </p>
                </div>

                <div className="acoes-pagina">
                    <button
                        className="botao botao-primario"
                        type="button"
                        onClick={aoAbrirClientes}
                    >
                        Gerenciar clientes
                    </button>
                </div>
            </section>

            <section
                className="grade-indicadores"
                aria-label="Indicadores da oficina"
            >
                <CardIndicador
                    titulo="Total de clientes"
                    valor={totalClientes}
                    descricao="Clientes cadastrados no sistema"
                    simbolo="♙"
                />

                <CardIndicador
                    titulo="Manutenções em andamento"
                    valor="—"
                    descricao="Integração em desenvolvimento"
                    simbolo="⚙"
                />

                <CardIndicador
                    titulo="Orçamentos pendentes"
                    valor="—"
                    descricao="Integração em desenvolvimento"
                    simbolo="▤"
                />

                <CardIndicador
                    titulo="Pagamentos pendentes"
                    valor="—"
                    descricao="Integração em desenvolvimento"
                    simbolo="$"
                />
            </section>

            {erro && (
                <div
                    className="clientes-mensagem clientes-mensagem-erro"
                    role="alert"
                >
                    {erro}
                </div>
            )}

            <section className="painel">
                <div className="painel-cabecalho">
                    <div>
                        <h3>Clientes cadastrados</h3>

                        <p>Dados reais recebidos do Spring Boot.</p>
                    </div>

                    <button
                        className="botao botao-secundario"
                        type="button"
                        onClick={aoAbrirClientes}
                    >
                        Ver todos
                    </button>
                </div>

                {carregando ? (
                    <p style={{ padding: "0 24px 24px" }}>
                        Carregando clientes...
                    </p>
                ) : erro ? (
                    <p style={{ padding: "0 24px 24px" }}>
                        Não foi possível carregar os clientes.
                    </p>
                ) : clientes.length === 0 ? (
                    <p style={{ padding: "0 24px 24px" }}>
                        Nenhum cliente cadastrado.
                    </p>
                ) : (
                    <div className="tabela-container">
                        <table className="tabela">
                            <thead>
                            <tr>
                                <th scope="col">Nome</th>
                                <th scope="col">E-mail</th>
                                <th scope="col">Telefone</th>
                            </tr>
                            </thead>

                            <tbody>
                            {clientes.slice(0, 5).map((cliente) => (
                                <tr key={cliente.id}>
                                    <td className="celula-cliente">
                                        {cliente.name}
                                    </td>

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

                        <p>Prévia visual da próxima funcionalidade.</p>
                    </div>

                    <button
                        className="botao botao-secundario"
                        type="button"
                        onClick={aoAbrirManutencoes}
                    >
                        Ver manutenções
                    </button>
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
                        {manutencoesExemplo.map((manutencao) => (
                            <tr key={manutencao.id}>
                                <td>#{manutencao.id}</td>

                                <td className="celula-cliente">
                                    {manutencao.cliente}
                                </td>

                                <td>{manutencao.servico}</td>

                                <td>{manutencao.data}</td>

                                <td>
                                    <BadgeManutencao
                                        status={manutencao.status}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="painel-rodape">
          <span>
            Dados ilustrativos. O Dashboard será integrado
            aos registros reais na etapa de indicadores.
          </span>
                </div>
            </section>
        </>
    );
}

function PaginaEmDesenvolvimento({
                                     titulo,
                                     descricao,
                                 }: {
    titulo: string;
    descricao: string;
}) {
    return (
        <>
            <section className="titulo-pagina">
                <div>
          <span className="texto-superior">
            GESTÃO DE SERVIÇOS
          </span>

                    <h2>{titulo}</h2>

                    <p>{descricao}</p>
                </div>
            </section>

            <section className="painel">
                <div
                    style={{
                        padding: "48px 24px",
                        textAlign: "center",
                    }}
                >
                    <h3 style={{ marginTop: 0 }}>
                        Módulo em desenvolvimento
                    </h3>

                    <p
                        style={{
                            color: "var(--cor-texto-secundario)",
                            marginBottom: 0,
                        }}
                    >
                        Esta tela será conectada ao backend
                        nas próximas etapas.
                    </p>
                </div>
            </section>
        </>
    );
}

function App() {
    const [paginaAtual, setPaginaAtual] =
        useState<Pagina>("dashboard");

    function navegar(pagina: Pagina) {
        setPaginaAtual(pagina);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function renderizarPagina() {
        switch (paginaAtual) {
            case "dashboard":
                return (
                    <Dashboard
                        aoAbrirClientes={() => navegar("clientes")}
                        aoAbrirManutencoes={() => navegar("manutencoes")}
                    />
                );

            case "clientes":
                return <Clientes />;

            case "manutencoes":
                return <Manutencoes />;

            case "orcamentos":
                return (
                    <PaginaEmDesenvolvimento
                        titulo="Orçamentos"
                        descricao="Acompanhe os orçamentos e suas aprovações."
                    />
                );

            case "pagamentos":
                return (
                    <PaginaEmDesenvolvimento
                        titulo="Pagamentos"
                        descricao="Acompanhe os pagamentos dos serviços."
                    />
                );
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

                <span className="menu-legenda">
          MENU PRINCIPAL
        </span>

                <nav
                    className="navegacao"
                    aria-label="Menu principal"
                >
                    {itensMenu.map((item) => (
                        <button
                            key={item.pagina}
                            type="button"
                            className={
                                paginaAtual === item.pagina
                                    ? "item-menu ativo"
                                    : "item-menu"
                            }
                            onClick={() => navegar(item.pagina)}
                            aria-current={
                                paginaAtual === item.pagina
                                    ? "page"
                                    : undefined
                            }
                            style={{
                                width: "100%",
                                textAlign: "left",
                                border: "none",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                fontSize: "inherit",
                            }}
                        >
              <span aria-hidden="true">
                {item.icone}
              </span>{" "}
                            {item.titulo}
                        </button>
                    ))}
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
                    {renderizarPagina()}

                    <footer className="rodape-conteudo">
                        VCC Motores · Sistema de gerenciamento
                    </footer>
                </main>
            </div>
        </div>
    );
}

export default App;
