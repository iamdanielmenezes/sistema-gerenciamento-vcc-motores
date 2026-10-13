import { useEffect, useState } from "react";
import type { Cliente } from "./types/Client";
import "./App.css";
import Botao from "./components/Botao";

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

    useEffect(() => {
        async function buscarClientes() {
            try {
                const resposta = await fetch("http://localhost:8080/client");

                if (!resposta.ok) {
                    throw new Error("Não foi possível carregar os clientes.");
                }

                const dados: Cliente[] = await resposta.json();
                setClientes(dados);
            } catch (erro) {
                console.error("Erro ao buscar clientes:", erro);
                setErroClientes(
                    "Não foi possível carregar os clientes. Verifique o backend e a conexão com a API."
                );
            } finally {
                setCarregandoClientes(false);
            }
        }

        buscarClientes();
    }, []);

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
                            <span className="data-atual">Outubro de 2026</span>
                            <Botao
                                texto="+ Novo cliente"
                                aoClicar={() =>
                                    alert(
                                        "A tela de cadastro será implementada na etapa de Clientes."
                                    )
                                }
                            />
                        </div>
                    </section>

                    <section className="grade-indicadores" aria-label="Indicadores">
                        <CardIndicador
                            titulo="Total de clientes"
                            valor={
                                carregandoClientes ? "..." : String(clientes.length)
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
                                <p>Acompanhe os últimos serviços registrados.</p>
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
