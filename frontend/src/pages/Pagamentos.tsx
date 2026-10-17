
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";

import type { Orcamento } from "../types/Budget";
import type {
    MetodoPagamento,
    Pagamento,
    StatusPagamento,
} from "../types/Payment";

import {
    nomesMetodosPagamento,
    nomesStatusPagamento,
} from "../types/Payment";

import { listarOrcamentos } from "../services/BudgetService";

import {
    atualizarPagamento,
    cadastrarPagamento,
    excluirPagamento,
    listarPagamentos,
} from "../services/PaymentService";

import { ApiError } from "../services/apiError";

import "./Pagamentos.css";

type ModoModal = "novo" | "editar" | "detalhes" | null;

type FormularioPagamento = {
    budgetId: string;
    method: MetodoPagamento;
    status: StatusPagamento;
};

const metodosDisponiveis: MetodoPagamento[] = [
    "PIX",
    "DINHEIRO",
    "DEBITO",
    "CREDITO",
];

const statusDisponiveis: StatusPagamento[] = [
    "PENDENTE",
    "PAGO",
    "CANCELADO",
];

const formularioVazio: FormularioPagamento = {
    budgetId: "",
    method: "PIX",
    status: "PENDENTE",
};

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

function formatarMoeda(valor: number): string {
    return formatadorMoeda.format(valor);
}

function obterMensagemErro(erro: unknown): string {
    if (erro instanceof ApiError) {
        return `Erro ${erro.status}: ${erro.message}`;
    }

    if (erro instanceof Error) {
        return erro.message;
    }

    return "Não foi possível conectar ao servidor. Verifique se o backend está funcionando.";
}

function classeStatus(status: StatusPagamento): string {
    switch (status) {
        case "PENDENTE":
            return "pagamentos-status pagamentos-status-pendente";

        case "PAGO":
            return "pagamentos-status pagamentos-status-pago";

        case "CANCELADO":
            return "pagamentos-status pagamentos-status-cancelado";
    }
}

function obterNomesClientes(orcamento: Orcamento): string {
    const nomes = Array.from(
        new Set(
            (orcamento.maintenance ?? [])
                .map((manutencao) => manutencao.client?.name)
                .filter(
                    (nome): nome is string =>
                        typeof nome === "string" && nome.trim() !== ""
                )
        )
    );

    return nomes.length > 0
        ? nomes.join(", ")
        : "Cliente não informado";
}

function Pagamentos() {
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);

    const [carregando, setCarregando] = useState(true);
    const [processando, setProcessando] = useState(false);

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const [busca, setBusca] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");

    const [modoModal, setModoModal] = useState<ModoModal>(null);

    const [pagamentoSelecionado, setPagamentoSelecionado] =
        useState<Pagamento | null>(null);

    const [formulario, setFormulario] =
        useState<FormularioPagamento>(formularioVazio);

    const referenciaModal = useRef<HTMLDivElement>(null);

    const modalAberto = modoModal !== null;

    const carregarDados = useCallback(async () => {
        setCarregando(true);

        try {
            const [dadosPagamentos, dadosOrcamentos] = await Promise.all([
                listarPagamentos(),
                listarOrcamentos(),
            ]);

            setPagamentos(dadosPagamentos);
            setOrcamentos(dadosOrcamentos);
            setErro("");
        } catch (erroRecebido) {
            setErro(obterMensagemErro(erroRecebido));
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        void carregarDados();
    }, [carregarDados]);

    useEffect(() => {
        if (!modalAberto) {
            return;
        }

        const overflowAnterior = document.body.style.overflow;

        document.body.style.overflow = "hidden";
        referenciaModal.current?.focus();

        function aoPressionarTecla(evento: KeyboardEvent) {
            if (evento.key === "Escape" && !processando) {
                setModoModal(null);
                setPagamentoSelecionado(null);
            }
        }

        document.addEventListener("keydown", aoPressionarTecla);

        return () => {
            document.body.style.overflow = overflowAnterior;

            document.removeEventListener(
                "keydown",
                aoPressionarTecla
            );
        };
    }, [modalAberto, processando]);

    const idsOrcamentosComPagamento = new Set(
        pagamentos.map((pagamento) => pagamento.budget?.id)
    );

    const orcamentosDisponiveis = orcamentos.filter(
        (orcamento) =>
            orcamento.status === "APROVADO" &&
            !idsOrcamentosComPagamento.has(orcamento.id)
    );

    const pagamentosFiltrados = pagamentos.filter((pagamento) => {
        const correspondeStatus =
            !filtroStatus || pagamento.status === filtroStatus;

        const termo = busca.trim().toLowerCase();

        if (!termo) {
            return correspondeStatus;
        }

        const correspondeNumero = String(pagamento.id).includes(termo);

        const correspondeOrcamento = String(
            pagamento.budget?.id ?? ""
        ).includes(termo);

        const correspondeCliente = obterNomesClientes(
            pagamento.budget
        )
            .toLowerCase()
            .includes(termo);

        const correspondeMetodo = (
            nomesMetodosPagamento[pagamento.method] ??
            pagamento.method
        )
            .toLowerCase()
            .includes(termo);

        return (
            correspondeStatus &&
            (
                correspondeNumero ||
                correspondeOrcamento ||
                correspondeCliente ||
                correspondeMetodo
            )
        );
    });

    function limparMensagens() {
        setErro("");
        setSucesso("");
    }

    function fecharModal() {
        if (processando) {
            return;
        }

        setModoModal(null);
        setPagamentoSelecionado(null);
    }

    function abrirCadastro() {
        limparMensagens();

        setFormulario({ ...formularioVazio });
        setPagamentoSelecionado(null);
        setModoModal("novo");
    }

    function abrirEdicao(pagamento: Pagamento) {
        limparMensagens();

        setPagamentoSelecionado(pagamento);

        setFormulario({
            budgetId: String(pagamento.budget.id),
            method: pagamento.method,
            status: pagamento.status,
        });

        setModoModal("editar");
    }

    function abrirDetalhes(pagamento: Pagamento) {
        limparMensagens();

        setPagamentoSelecionado(pagamento);
        setModoModal("detalhes");
    }

    function aoClicarFundo(
        evento: MouseEvent<HTMLDivElement>
    ) {
        if (evento.target === evento.currentTarget) {
            fecharModal();
        }
    }

    async function salvarPagamento(
        evento: FormEvent<HTMLFormElement>
    ) {
        evento.preventDefault();

        if (processando) {
            return;
        }

        limparMensagens();

        if (modoModal === "novo") {
            const idOrcamento = Number(formulario.budgetId);

            const orcamentoValido = orcamentosDisponiveis.some(
                (orcamento) => orcamento.id === idOrcamento
            );

            if (!orcamentoValido) {
                setErro(
                    "Selecione um orçamento aprovado que ainda não possua pagamento."
                );
                return;
            }
        }

        setProcessando(true);

        try {
            if (modoModal === "editar" && pagamentoSelecionado) {
                await atualizarPagamento(pagamentoSelecionado.id, {
                    method: formulario.method,
                    status: formulario.status,
                });

                setSucesso("Pagamento atualizado com sucesso!");
            } else if (modoModal === "novo") {
                await cadastrarPagamento({
                    method: formulario.method,
                    status: formulario.status,
                    budget: {
                        id: Number(formulario.budgetId),
                    },
                });

                setSucesso("Pagamento cadastrado com sucesso!");
            } else {
                return;
            }

            setModoModal(null);
            setPagamentoSelecionado(null);

            await carregarDados();
        } catch (erroRecebido) {
            setErro(obterMensagemErro(erroRecebido));
        } finally {
            setProcessando(false);
        }
    }

    async function alterarStatus(
        pagamento: Pagamento,
        novoStatus: StatusPagamento
    ) {
        if (processando || pagamento.status === novoStatus) {
            return;
        }

        const confirmado = window.confirm(
            `Deseja alterar o pagamento #${pagamento.id} para "${nomesStatusPagamento[novoStatus]}"?`
        );

        if (!confirmado) {
            return;
        }

        limparMensagens();
        setProcessando(true);

        try {
            await atualizarPagamento(pagamento.id, {
                method: pagamento.method,
                status: novoStatus,
            });

            setModoModal(null);
            setPagamentoSelecionado(null);

            setSucesso(
                novoStatus === "PAGO"
                    ? "Pagamento marcado como pago!"
                    : "Pagamento cancelado com sucesso!"
            );

            await carregarDados();
        } catch (erroRecebido) {
            setErro(obterMensagemErro(erroRecebido));
        } finally {
            setProcessando(false);
        }
    }

    async function removerPagamento(pagamento: Pagamento) {
        if (processando) {
            return;
        }

        const confirmado = window.confirm(
            `Deseja realmente excluir o pagamento #${pagamento.id}?`
        );

        if (!confirmado) {
            return;
        }

        limparMensagens();
        setProcessando(true);

        try {
            await excluirPagamento(pagamento.id);

            setModoModal(null);
            setPagamentoSelecionado(null);

            setSucesso("Pagamento excluído com sucesso!");

            await carregarDados();
        } catch (erroRecebido) {
            setErro(obterMensagemErro(erroRecebido));
        } finally {
            setProcessando(false);
        }
    }

    return (
        <div className="pagina-pagamentos">
            <section className="titulo-pagina">
                <div>
          <span className="texto-superior">
            GESTÃO FINANCEIRA
          </span>

                    <h2>Pagamentos</h2>

                    <p>
                        Acompanhe os pagamentos dos orçamentos aprovados.
                    </p>
                </div>

                <div className="acoes-pagina">
                    <button
                        className="botao botao-primario"
                        type="button"
                        onClick={abrirCadastro}
                        disabled={carregando || processando}
                    >
                        + Novo pagamento
                    </button>
                </div>
            </section>

            {erro && !modalAberto && (
                <div
                    className="pagamentos-mensagem pagamentos-mensagem-erro"
                    role="alert"
                >
                    {erro}
                </div>
            )}

            {sucesso && (
                <div
                    className="pagamentos-mensagem pagamentos-mensagem-sucesso"
                    role="status"
                >
                    {sucesso}
                </div>
            )}

            <section className="painel">
                <div className="painel-cabecalho">
                    <div>
                        <h3>Pagamentos cadastrados</h3>

                        <p>
                            Consulte, filtre e gerencie os recebimentos.
                        </p>
                    </div>

                    <span className="contador-registros">
            {pagamentosFiltrados.length}{" "}
                        {pagamentosFiltrados.length === 1
                            ? "registro"
                            : "registros"}
          </span>
                </div>

                <div className="pagamentos-filtros">
                    <div className="pagamentos-campo">
                        <label htmlFor="pagamentos-busca">
                            Buscar
                        </label>

                        <input
                            id="pagamentos-busca"
                            type="search"
                            placeholder="Pagamento, orçamento ou cliente"
                            value={busca}
                            onChange={(evento) =>
                                setBusca(evento.target.value)
                            }
                        />
                    </div>

                    <div className="pagamentos-campo">
                        <label htmlFor="pagamentos-filtro-status">
                            Status
                        </label>

                        <select
                            id="pagamentos-filtro-status"
                            value={filtroStatus}
                            onChange={(evento) =>
                                setFiltroStatus(evento.target.value)
                            }
                        >
                            <option value="">
                                Todos os status
                            </option>

                            {statusDisponiveis.map((status) => (
                                <option key={status} value={status}>
                                    {nomesStatusPagamento[status]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="botao botao-secundario"
                        type="button"
                        onClick={() => {
                            setBusca("");
                            setFiltroStatus("");
                        }}
                    >
                        Limpar filtros
                    </button>
                </div>

                {carregando ? (
                    <p className="pagamentos-estado">
                        Carregando pagamentos...
                    </p>
                ) : pagamentosFiltrados.length === 0 ? (
                    <p className="pagamentos-estado">
                        Nenhum pagamento encontrado.
                    </p>
                ) : (
                    <div className="tabela-container">
                        <table className="tabela">
                            <thead>
                            <tr>
                                <th scope="col">Nº</th>
                                <th scope="col">Orçamento</th>
                                <th scope="col">Cliente(s)</th>
                                <th scope="col">Valor</th>
                                <th scope="col">Método</th>
                                <th scope="col">Status</th>
                                <th scope="col">Ações</th>
                            </tr>
                            </thead>

                            <tbody>
                            {pagamentosFiltrados.map((pagamento) => (
                                <tr key={pagamento.id}>
                                    <td>#{pagamento.id}</td>

                                    <td>#{pagamento.budget.id}</td>

                                    <td className="celula-cliente">
                                        {obterNomesClientes(pagamento.budget)}
                                    </td>

                                    <td className="pagamentos-valor">
                                        {formatarMoeda(pagamento.budget.price)}
                                    </td>

                                    <td>
                                        {nomesMetodosPagamento[pagamento.method]}
                                    </td>

                                    <td>
                      <span
                          className={classeStatus(pagamento.status)}
                      >
                        {nomesStatusPagamento[pagamento.status]}
                      </span>
                                    </td>

                                    <td>
                                        <div className="pagamentos-acoes-tabela">
                                            <button
                                                type="button"
                                                onClick={() => abrirDetalhes(pagamento)}
                                                disabled={processando}
                                            >
                                                Ver
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => abrirEdicao(pagamento)}
                                                disabled={processando}
                                            >
                                                Editar
                                            </button>

                                            {pagamento.status === "PENDENTE" && (
                                                <button
                                                    type="button"
                                                    className="pagamentos-acao-pagar"
                                                    onClick={() =>
                                                        void alterarStatus(pagamento, "PAGO")
                                                    }
                                                    disabled={processando}
                                                >
                                                    Marcar pago
                                                </button>
                                            )}

                                            {pagamento.status !== "CANCELADO" && (
                                                <button
                                                    type="button"
                                                    className="pagamentos-acao-cancelar"
                                                    onClick={() =>
                                                        void alterarStatus(
                                                            pagamento,
                                                            "CANCELADO"
                                                        )
                                                    }
                                                    disabled={processando}
                                                >
                                                    Cancelar
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className="pagamentos-acao-excluir"
                                                onClick={() =>
                                                    void removerPagamento(pagamento)
                                                }
                                                disabled={processando}
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {modalAberto && (
                <div
                    className="pagamentos-modal-fundo"
                    onMouseDown={aoClicarFundo}
                >
                    <div
                        className="pagamentos-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="pagamentos-modal-titulo"
                        tabIndex={-1}
                        ref={referenciaModal}
                    >
                        <div className="pagamentos-modal-cabecalho">
                            <div>
                <span className="texto-superior">
                  GESTÃO FINANCEIRA
                </span>

                                <h3 id="pagamentos-modal-titulo">
                                    {modoModal === "novo"
                                        ? "Novo pagamento"
                                        : modoModal === "editar"
                                            ? "Editar pagamento"
                                            : "Detalhes do pagamento"}
                                </h3>
                            </div>

                            <button
                                type="button"
                                className="pagamentos-modal-fechar"
                                onClick={fecharModal}
                                disabled={processando}
                                aria-label="Fechar janela"
                                title="Fechar"
                            >
                                ×
                            </button>
                        </div>

                        <div className="pagamentos-modal-conteudo">
                            {erro && (
                                <div
                                    className="pagamentos-mensagem pagamentos-mensagem-erro"
                                    role="alert"
                                >
                                    {erro}
                                </div>
                            )}

                            {(modoModal === "novo" ||
                                modoModal === "editar") && (
                                <form
                                    className="pagamentos-formulario"
                                    onSubmit={salvarPagamento}
                                >
                                    {modoModal === "novo" ? (
                                        <div className="pagamentos-campo pagamentos-campo-completo">
                                            <label htmlFor="pagamento-orcamento">
                                                Orçamento aprovado
                                            </label>

                                            <select
                                                id="pagamento-orcamento"
                                                value={formulario.budgetId}
                                                onChange={(evento) =>
                                                    setFormulario((anterior) => ({
                                                        ...anterior,
                                                        budgetId: evento.target.value,
                                                    }))
                                                }
                                                disabled={processando}
                                                required
                                            >
                                                <option value="">
                                                    Selecione um orçamento
                                                </option>

                                                {orcamentosDisponiveis.map((orcamento) => (
                                                    <option
                                                        key={orcamento.id}
                                                        value={orcamento.id}
                                                    >
                                                        #{orcamento.id} —{" "}
                                                        {formatarMoeda(orcamento.price)} —{" "}
                                                        {obterNomesClientes(orcamento)}
                                                    </option>
                                                ))}
                                            </select>

                                            {orcamentosDisponiveis.length === 0 && (
                                                <div className="pagamentos-aviso">
                                                    Não há orçamentos aprovados sem
                                                    pagamento. Aprove um orçamento
                                                    primeiro ou verifique os pagamentos
                                                    já cadastrados.
                                                </div>
                                            )}

                                            <small>
                                                Cada orçamento pode ter somente um
                                                pagamento, mesmo que ele esteja cancelado.
                                            </small>
                                        </div>
                                    ) : (
                                        <div className="pagamentos-campo pagamentos-campo-completo">
                                            <label>
                                                Orçamento vinculado
                                            </label>

                                            <div className="pagamentos-campo-somente-leitura">
                                                #{pagamentoSelecionado?.budget.id} —{" "}
                                                {formatarMoeda(
                                                    pagamentoSelecionado?.budget.price ?? 0
                                                )}
                                            </div>

                                            <small>
                                                O orçamento vinculado não pode ser
                                                alterado na edição.
                                            </small>
                                        </div>
                                    )}

                                    <div className="pagamentos-campo">
                                        <label htmlFor="pagamento-metodo">
                                            Método de pagamento
                                        </label>

                                        <select
                                            id="pagamento-metodo"
                                            value={formulario.method}
                                            onChange={(evento) =>
                                                setFormulario((anterior) => ({
                                                    ...anterior,
                                                    method: evento.target
                                                        .value as MetodoPagamento,
                                                }))
                                            }
                                            disabled={processando}
                                        >
                                            {metodosDisponiveis.map((metodo) => (
                                                <option key={metodo} value={metodo}>
                                                    {nomesMetodosPagamento[metodo]}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="pagamentos-campo">
                                        <label htmlFor="pagamento-status">
                                            Status
                                        </label>

                                        <select
                                            id="pagamento-status"
                                            value={formulario.status}
                                            onChange={(evento) =>
                                                setFormulario((anterior) => ({
                                                    ...anterior,
                                                    status: evento.target
                                                        .value as StatusPagamento,
                                                }))
                                            }
                                            disabled={processando}
                                        >
                                            {statusDisponiveis.map((status) => (
                                                <option key={status} value={status}>
                                                    {nomesStatusPagamento[status]}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="pagamentos-formulario-acoes">
                                        <button
                                            className="botao botao-secundario"
                                            type="button"
                                            onClick={fecharModal}
                                            disabled={processando}
                                        >
                                            Cancelar
                                        </button>

                                        <button
                                            className="botao botao-primario"
                                            type="submit"
                                            disabled={
                                                processando ||
                                                (
                                                    modoModal === "novo" &&
                                                    orcamentosDisponiveis.length === 0
                                                )
                                            }
                                        >
                                            {processando
                                                ? "Salvando..."
                                                : "Salvar pagamento"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {modoModal === "detalhes" &&
                                pagamentoSelecionado && (
                                    <>
                                        <dl className="pagamentos-detalhes">
                                            <div>
                                                <dt>Número do pagamento</dt>
                                                <dd>#{pagamentoSelecionado.id}</dd>
                                            </div>

                                            <div>
                                                <dt>Orçamento</dt>
                                                <dd>#{pagamentoSelecionado.budget.id}</dd>
                                            </div>

                                            <div>
                                                <dt>Valor do orçamento</dt>
                                                <dd>
                                                    {formatarMoeda(
                                                        pagamentoSelecionado.budget.price
                                                    )}
                                                </dd>
                                            </div>

                                            <div>
                                                <dt>Método</dt>
                                                <dd>
                                                    {nomesMetodosPagamento[
                                                        pagamentoSelecionado.method
                                                        ]}
                                                </dd>
                                            </div>

                                            <div className="pagamentos-detalhe-completo">
                                                <dt>Status</dt>
                                                <dd>
                          <span
                              className={classeStatus(
                                  pagamentoSelecionado.status
                              )}
                          >
                            {nomesStatusPagamento[
                                pagamentoSelecionado.status
                                ]}
                          </span>
                                                </dd>
                                            </div>

                                            <div className="pagamentos-detalhe-completo">
                                                <dt>Cliente(s)</dt>
                                                <dd>
                                                    {obterNomesClientes(
                                                        pagamentoSelecionado.budget
                                                    )}
                                                </dd>
                                            </div>
                                        </dl>

                                        <div className="pagamentos-detalhes-manutencoes">
                                            <h4>
                                                Manutenções do orçamento
                                            </h4>

                                            {(pagamentoSelecionado.budget.maintenance ??
                                                []).length === 0 ? (
                                                <p>
                                                    Nenhuma manutenção vinculada.
                                                </p>
                                            ) : (
                                                <ul>
                                                    {(pagamentoSelecionado.budget.maintenance ??
                                                        []).map((manutencao) => (
                                                        <li key={manutencao.id}>
                                                            <strong>
                                                                #{manutencao.id}
                                                            </strong>

                                                            <span>
                                {manutencao.client?.name ??
                                    "Cliente não informado"}
                              </span>

                                                            <p>
                                                                {manutencao.description}
                                                            </p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        <div className="pagamentos-formulario-acoes pagamentos-detalhes-acoes">
                                            <button
                                                className="botao botao-secundario"
                                                type="button"
                                                onClick={fecharModal}
                                            >
                                                Fechar
                                            </button>

                                            <button
                                                className="botao botao-primario"
                                                type="button"
                                                onClick={() =>
                                                    abrirEdicao(pagamentoSelecionado)
                                                }
                                            >
                                                Editar pagamento
                                            </button>
                                        </div>
                                    </>
                                )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Pagamentos;
