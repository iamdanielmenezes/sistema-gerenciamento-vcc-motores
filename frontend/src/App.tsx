import { useEffect, useState } from "react";
import type { Cliente } from "./types/Client";
import type { Manutencao, StatusManutencao } from "./types/Maintenance";
import type { Orcamento } from "./types/Budget";
import type { Pagamento } from "./types/Payment";
import { nomesStatusManutencao } from "./types/Maintenance";
import { listarClientes } from "./services/ClienteService";
import { listarManutencoes } from "./services/MaintenanceService";
import { listarOrcamentos } from "./services/BudgetService";
import { listarPagamentos } from "./services/PaymentService";
import { ApiError } from "./services/apiError";
import Clientes from "./pages/Clientes";
import Manutencoes from "./pages/Manutencoes";
import Orcamentos from "./pages/Orcamentos";
import Pagamentos from "./pages/Pagamentos";
import "./App.css";

type Pagina = "dashboard" | "clientes" | "manutencoes" | "orcamentos" | "pagamentos";

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
    if (erro instanceof ApiError) return `Erro ${erro.status}: ${erro.message}`;
    if (erro instanceof Error) return erro.message;
    return "Não foi possível conectar ao servidor. Verifique se o backend está funcionando.";
}

function BadgeManutencao({ status }: { status: StatusManutencao }) {
    const classe = status === "FINALIZADO"
        ? "badge badge-sucesso"
        : status === "EM_MANUTENCAO"
            ? "badge badge-andamento"
            : "badge badge-pendente";
    return <span className={classe}>{nomesStatusManutencao[status]}</span>;
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
    const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;
        async function carregarDashboard() {
            try {
                const [dadosClientes, dadosManutencoes, dadosOrcamentos, dadosPagamentos] =
                    await Promise.all([
                        listarClientes(),
                        listarManutencoes(),
                        listarOrcamentos(),
                        listarPagamentos(),
                    ]);
                if (!ativo) return;
                setClientes(dadosClientes);
                setManutencoes(dadosManutencoes);
                setOrcamentos(dadosOrcamentos);
                setPagamentos(dadosPagamentos);
                setErro("");
            } catch (erroRecebido) {
                if (ativo) setErro(mensagemErro(erroRecebido));
            } finally {
                if (ativo) setCarregando(false);
            }
        }
        void carregarDashboard();
        return () => { ativo = false; };
    }, []);

    const indicador = (quantidade: number) => carregando ? "..." : erro ? "—" : String(quantidade);
    const manutencoesRecentes = [...manutencoes]
        .sort((a, b) => {
            const porData = b.date.localeCompare(a.date);
            return porData !== 0 ? porData : b.id - a.id;
        })
        .slice(0, 5);

    function formatarData(data: string) {
        const partes = data.slice(0, 10).split("-");
        return partes.length === 3
            ? `${partes[2]}/${partes[1]}/${partes[0]}`
            : data;
    }

    return (
        <>
            <section className="titulo-pagina">
                <div>
                    <span className="texto-superior">VISÃO GERAL</span>
                    <h2>Dashboard</h2>
                    <p>Acompanhe os principais indicadores da oficina.</p>
                </div>
                <div className="acoes-pagina">
                    <button className="botao botao-primario" type="button" onClick={aoAbrirClientes}>
                        Gerenciar clientes
                    </button>
                </div>
            </section>

            <section className="grade-indicadores" aria-label="Indicadores da oficina">
                <CardIndicador titulo="Total de clientes"
                               valor={indicador(clientes.length)}
                               descricao="Clientes cadastrados no sistema" simbolo="♙" />
                <CardIndicador titulo="Manutenções em andamento"
                               valor={indicador(manutencoes.filter(m => m.status === "EM_MANUTENCAO").length)}
                               descricao="Serviços em execução" simbolo="⚙" />
                <CardIndicador titulo="Orçamentos pendentes"
                               valor={indicador(orcamentos.filter(o => o.status === "AGUARDANDO_APROVACAO").length)}
                               descricao="Aguardando aprovação" simbolo="▤" />
                <CardIndicador titulo="Pagamentos pendentes"
                               valor={indicador(pagamentos.filter(p => p.status === "PENDENTE").length)}
                               descricao="Aguardando recebimento" simbolo="$" />
            </section>

            {erro && (
                <div className="clientes-mensagem clientes-mensagem-erro" role="alert">
                    {erro}
                    <button type="button" className="botao botao-secundario"
                            style={{ marginLeft: 12 }} onClick={() => window.location.reload()}>
                        Tentar novamente
                    </button>
                </div>
            )}

            <section className="painel">
                <div className="painel-cabecalho">
                    <div>
                        <h3>Clientes cadastrados</h3>
                        <p>Dados reais recebidos do Spring Boot.</p>
                    </div>
                    <button className="botao botao-secundario" type="button" onClick={aoAbrirClientes}>
                        Ver todos
                    </button>
                </div>
                {carregando ? (
                    <p style={{ padding: "0 24px 24px" }}>Carregando clientes...</p>
                ) : erro ? (
                    <p style={{ padding: "0 24px 24px" }}>Não foi possível carregar os clientes.</p>
                ) : clientes.length === 0 ? (
                    <p style={{ padding: "0 24px 24px" }}>Nenhum cliente cadastrado.</p>
                ) : (
                    <div className="tabela-container">
                        <table className="tabela">
                            <thead><tr><th scope="col">Nome</th><th scope="col">E-mail</th><th scope="col">Telefone</th></tr></thead>
                            <tbody>
                            {clientes.slice(0, 5).map(cliente => (
                                <tr key={cliente.id}>
                                    <td className="celula-cliente">{cliente.name}</td>
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
                        <p>Últimos serviços registrados no sistema.</p>
                    </div>
                    <button className="botao botao-secundario" type="button" onClick={aoAbrirManutencoes}>
                        Ver manutenções
                    </button>
                </div>
                {carregando ? (
                    <p style={{ padding: "0 24px 24px" }}>Carregando manutenções...</p>
                ) : erro ? (
                    <p style={{ padding: "0 24px 24px" }}>Não foi possível carregar as manutenções.</p>
                ) : manutencoesRecentes.length === 0 ? (
                    <p style={{ padding: "0 24px 24px" }}>Nenhuma manutenção cadastrada.</p>
                ) : (
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
                            {manutencoesRecentes.map(manutencao => (
                                <tr key={manutencao.id}>
                                    <td>#{manutencao.id}</td>
                                    <td className="celula-cliente">{manutencao.client?.name ?? "Cliente não informado"}</td>
                                    <td>{manutencao.description}</td>
                                    <td>{formatarData(manutencao.date)}</td>
                                    <td><BadgeManutencao status={manutencao.status} /></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
                return <Orcamentos />;

            case "pagamentos":
                return <Pagamentos />;
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