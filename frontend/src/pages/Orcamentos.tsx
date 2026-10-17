
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import type { Manutencao } from "../types/Maintenance";
import type {
    Orcamento,
    StatusOrcamento,
} from "../types/Budget";
import { nomesStatusOrcamento } from "../types/Budget";
import { listarManutencoes } from "../services/MaintenanceService";
import {
    atualizarOrcamento,
    cadastrarOrcamento,
    excluirOrcamento,
    listarOrcamentos,
} from "../services/BudgetService";
import { ApiError } from "../services/apiError";
import "./Orcamentos.css";

type ModoModal = "novo" | "editar" | "detalhes" | null;

type FormularioOrcamento = {
    price: string;
    maintenanceIds: number[];
};

const statusDisponiveis: StatusOrcamento[] = [
    "AGUARDANDO_APROVACAO",
    "APROVADO",
    "CANCELADO",
];

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

    return "Não foi possível conectar ao servidor. Verifique se o backend está funcionando.";
}

function classeStatus(status: StatusOrcamento): string {
    switch (status) {
        case "AGUARDANDO_APROVACAO":
            return "orcamentos-status orcamentos-status-pendente";

        case "APROVADO":
            return "orcamentos-status orcamentos-status-aprovado";

        case "CANCELADO":
            return "orcamentos-status orcamentos-status-cancelado";
    }
}

function Orcamentos() {
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
    const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);

    const [carregando, setCarregando] = useState(true);
    const [processando, setProcessando] = useState(false);

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const [filtroStatus, setFiltroStatus] = useState("");

    const [modoModal, setModoModal] = useState<ModoModal>(null);
    const [orcamentoSelecionado, setOrcamentoSelecionado] =
        useState<Orcamento | null>(null);

    const [formulario, setFormulario] =
        useState<FormularioOrcamento>({
            price: "",
            maintenanceIds: [],
        });

    const referenciaModal = useRef<HTMLDivElement>(null);

    const modalAberto = modoModal !== null;

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErro("");

        try {
            const [dadosOrcamentos, dadosManutencoes] =
                await Promise.all([
                    listarOrcamentos(),
                    listarManutencoes(),
                ]);

            setOrcamentos(dadosOrcamentos);
            setManutencoes(dadosManutencoes);
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
        if (!modalAberto) return;

        const overflowAnterior = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        referenciaModal.current?.focus();

        function aoPressionarTecla(evento: KeyboardEvent) {
            if (evento.key === "Escape" && !processando) {
                setModoModal(null);
                setOrcamentoSelecionado(null);
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

    const orcamentosFiltrados = orcamentos.filter(
        (orcamento) =>
            !filtroStatus || orcamento.status === filtroStatus
    );

    const idsManutencoesOcupadas = new Set(
        orcamentos
            .filter((orcamento) => orcamento.status !== "CANCELADO")
            .flatMap((orcamento) =>
                orcamento.maintenance.map((manutencao) => manutencao.id)
            )
    );

    const manutencoesDisponiveis = manutencoes.filter(
        (manutencao) =>
            !idsManutencoesOcupadas.has(manutencao.id)
    );

    function limparMensagens() {
        setErro("");
        setSucesso("");
    }

    function fecharModal() {
        if (processando) return;

        setModoModal(null);
        setOrcamentoSelecionado(null);
    }

    function aoClicarFundo(
        evento: MouseEvent<HTMLDivElement>
    ) {
        if (evento.target === evento.currentTarget) {
            fecharModal();
        }
    }

    function abrirCadastro() {
        limparMensagens();

        setFormulario({
            price: "",
            maintenanceIds: [],
        });

        setOrcamentoSelecionado(null);
        setModoModal("novo");
    }

    function abrirEdicao(orcamento: Orcamento) {
        limparMensagens();

        setOrcamentoSelecionado(orcamento);

        setFormulario({
            price: String(orcamento.price),
            maintenanceIds: orcamento.maintenance.map(
                (manutencao) => manutencao.id
            ),
        });

        setModoModal("editar");
    }

    function abrirDetalhes(orcamento: Orcamento) {
        limparMensagens();

        setOrcamentoSelecionado(orcamento);
        setModoModal("detalhes");
    }

    function alternarManutencao(id: number) {
        setFormulario((anterior) => {
            const selecionada = anterior.maintenanceIds.includes(id);

            return {
                ...anterior,
                maintenanceIds: selecionada
                    ? anterior.maintenanceIds.filter(
                        (manutencaoId) => manutencaoId !== id
                    )
                    : [...anterior.maintenanceIds, id],
            };
        });
    }

    function validarFormulario(): string {
        const valor = Number(formulario.price);

        if (
            formulario.price.trim() === "" ||
            !Number.isFinite(valor) ||
            valor < 0
        ) {
            return "Informe um valor válido, maior ou igual a zero.";
        }

        if (
            modoModal === "novo" &&
            formulario.maintenanceIds.length === 0
        ) {
            return "Selecione pelo menos uma manutenção.";
        }

        return "";
    }

    async function salvarOrcamento(
        evento: FormEvent<HTMLFormElement>
    ) {
        evento.preventDefault();

        if (processando) return;

        limparMensagens();

        const erroValidacao = validarFormulario();

        if (erroValidacao) {
            setErro(erroValidacao);
            return;
        }

        setProcessando(true);

        try {
            const valor = Number(formulario.price);

            if (
                modoModal === "editar" &&
                orcamentoSelecionado
            ) {
                await atualizarOrcamento(orcamentoSelecionado.id, {
                    price: valor,
                    status: orcamentoSelecionado.status,
                });

                setSucesso("Orçamento atualizado com sucesso!");
            } else {
                await cadastrarOrcamento({
                    price: valor,
                    maintenance: formulario.maintenanceIds.map(
                        (id) => ({ id })
                    ),
                });

                setSucesso("Orçamento cadastrado com sucesso!");
            }

            setModoModal(null);
            setOrcamentoSelecionado(null);

            await carregarDados();
        } catch (erroRecebido) {
            setErro(obterMensagemErro(erroRecebido));
        } finally {
            setProcessando(false);
        }
    }

    async function alterarStatus(
        orcamento: Orcamento,
        novoStatus: StatusOrcamento
    ) {
        if (processando || orcamento.status === novoStatus) {
            return;
        }

        const confirmado = window.confirm(
            `Deseja alterar o orçamento #${orcamento.id} para "${nomesStatusOrcamento[novoStatus]}"?`
        );

        if (!confirmado) return;

        limparMensagens();
        setProcessando(true);

        try {
            await atualizarOrcamento(orcamento.id, {
                price: orcamento.price,
                status: novoStatus,
            });

            setModoModal(null);
            setOrcamentoSelecionado(null);

            setSucesso(
                novoStatus === "APROVADO"
                    ? "Orçamento aprovado com sucesso!"
                    : "Orçamento cancelado com sucesso!"
            );

            await carregarDados();
        } catch (erroRecebido) {
            setErro(obterMensagemErro(erroRecebido));
        } finally {
            setProcessando(false);
        }
    }

    async function removerOrcamento(orcamento: Orcamento) {
        if (processando) return;

        const confirmado = window.confirm(
            `Deseja realmente excluir o orçamento #${orcamento.id}?`
        );

        if (!confirmado) return;

        limparMensagens();
        setProcessando(true);

        try {
            await excluirOrcamento(orcamento.id);

            setModoModal(null);
            setOrcamentoSelecionado(null);

            setSucesso("Orçamento excluído com sucesso!");

            await carregarDados();
        } catch (erroRecebido) {
            setErro(obterMensagemErro(erroRecebido));
        } finally {
            setProcessando(false);
        }
    }

    function nomesClientes(orcamento: Orcamento): string {
        const nomes = [
            ...new Set(
                orcamento.maintenance
                    .map((manutencao) => manutencao.client?.name)
                    .filter((nome): nome is string => Boolean(nome))
            ),
        ];

        return nomes.length > 0
            ? nomes.join(", ")
            : "Não informado";
    }

    return (
        <div className="pagina-orcamentos">
            <section className="titulo-pagina">
                <div>
          <span className="texto-superior">
            GESTÃO FINANCEIRA
          </span>

                    <h2>Orçamentos</h2>

                    <p>
                        Cadastre e acompanhe os orçamentos da oficina.
                    </p>
                </div>

                <div className="acoes-pagina">
                    <button
                        className="botao botao-primario"
                        type="button"
                        onClick={abrirCadastro}
                        disabled={carregando || processando}
                    >
                        + Novo orçamento
                    </button>
                </div>
            </section>

            {erro && !modalAberto && (
                <div
                    className="orcamentos-mensagem orcamentos-mensagem-erro"
                    role="alert"
                >
                    {erro}
                </div>
            )}

            {sucesso && (
                <div
                    className="orcamentos-mensagem orcamentos-mensagem-sucesso"
                    role="status"
                >
                    {sucesso}
                </div>
            )}

            <section className="painel">
                <div className="painel-cabecalho">
                    <div>
                        <h3>Orçamentos cadastrados</h3>

                        <p>
                            Consulte valores, manutenções e aprovações.
                        </p>
                    </div>

                    <span className="contador-registros">
            {orcamentosFiltrados.length}{" "}
                        {orcamentosFiltrados.length === 1
                            ? "registro"
                            : "registros"}
          </span>
                </div>

                <div className="orcamentos-filtros">
                    <div className="orcamentos-campo">
                        <label htmlFor="orcamentos-filtro-status">
                            Status
                        </label>

                        <select
                            id="orcamentos-filtro-status"
                            value={filtroStatus}
                            onChange={(evento) =>
                                setFiltroStatus(evento.target.value)
                            }
                        >
                            <option value="">Todos os status</option>

                            {statusDisponiveis.map((status) => (
                                <option key={status} value={status}>
                                    {nomesStatusOrcamento[status]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="botao botao-secundario"
                        type="button"
                        onClick={() => setFiltroStatus("")}
                    >
                        Limpar filtro
                    </button>
                </div>

                {carregando ? (
                    <p className="orcamentos-estado">
                        Carregando orçamentos...
                    </p>
                ) : orcamentosFiltrados.length === 0 ? (
                    <p className="orcamentos-estado">
                        Nenhum orçamento encontrado.
                    </p>
                ) : (
                    <div className="tabela-container">
                        <table className="tabela">
                            <thead>
                            <tr>
                                <th scope="col">Nº</th>
                                <th scope="col">Cliente</th>
                                <th scope="col">Manutenções</th>
                                <th scope="col">Valor</th>
                                <th scope="col">Status</th>
                                <th scope="col">Ações</th>
                            </tr>
                            </thead>

                            <tbody>
                            {orcamentosFiltrados.map((orcamento) => (
                                <tr key={orcamento.id}>
                                    <td>#{orcamento.id}</td>

                                    <td className="celula-cliente">
                                        {nomesClientes(orcamento)}
                                    </td>

                                    <td>
                                        {orcamento.maintenance.length}{" "}
                                        {orcamento.maintenance.length === 1
                                            ? "manutenção"
                                            : "manutenções"}
                                    </td>

                                    <td className="orcamentos-valor">
                                        {formatarMoeda(orcamento.price)}
                                    </td>

                                    <td>
                      <span
                          className={classeStatus(
                              orcamento.status
                          )}
                      >
                        {nomesStatusOrcamento[
                            orcamento.status
                            ]}
                      </span>
                                    </td>

                                    <td>
                                        <div className="orcamentos-acoes-tabela">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    abrirDetalhes(orcamento)
                                                }
                                                disabled={processando}
                                            >
                                                Ver
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    abrirEdicao(orcamento)
                                                }
                                                disabled={processando}
                                            >
                                                Editar
                                            </button>

                                            {orcamento.status ===
                                                "AGUARDANDO_APROVACAO" && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="orcamentos-acao-aprovar"
                                                            onClick={() =>
                                                                void alterarStatus(
                                                                    orcamento,
                                                                    "APROVADO"
                                                                )
                                                            }
                                                            disabled={processando}
                                                        >
                                                            Aprovar
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="orcamentos-acao-cancelar"
                                                            onClick={() =>
                                                                void alterarStatus(
                                                                    orcamento,
                                                                    "CANCELADO"
                                                                )
                                                            }
                                                            disabled={processando}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </>
                                                )}

                                            <button
                                                type="button"
                                                className="orcamentos-acao-excluir"
                                                onClick={() =>
                                                    void removerOrcamento(orcamento)
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
                    className="orcamentos-modal-fundo"
                    onMouseDown={aoClicarFundo}
                >
                    <div
                        className="orcamentos-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="orcamentos-modal-titulo"
                        tabIndex={-1}
                        ref={referenciaModal}
                    >
                        <div className="orcamentos-modal-cabecalho">
                            <div>
                <span className="texto-superior">
                  GESTÃO FINANCEIRA
                </span>

                                <h3 id="orcamentos-modal-titulo">
                                    {modoModal === "novo"
                                        ? "Novo orçamento"
                                        : modoModal === "editar"
                                            ? "Editar orçamento"
                                            : "Detalhes do orçamento"}
                                </h3>
                            </div>

                            <button
                                type="button"
                                className="orcamentos-modal-fechar"
                                onClick={fecharModal}
                                disabled={processando}
                                aria-label="Fechar janela"
                            >
                                ×
                            </button>
                        </div>

                        <div className="orcamentos-modal-conteudo">
                            {erro && (
                                <div
                                    className="orcamentos-mensagem orcamentos-mensagem-erro"
                                    role="alert"
                                >
                                    {erro}
                                </div>
                            )}

                            {(modoModal === "novo" ||
                                modoModal === "editar") && (
                                <form
                                    className="orcamentos-formulario"
                                    onSubmit={salvarOrcamento}
                                >
                                    <div className="orcamentos-campo">
                                        <label htmlFor="orcamento-valor">
                                            Valor do orçamento (R$)
                                        </label>

                                        <input
                                            id="orcamento-valor"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formulario.price}
                                            onChange={(evento) =>
                                                setFormulario((anterior) => ({
                                                    ...anterior,
                                                    price: evento.target.value,
                                                }))
                                            }
                                            placeholder="Ex.: 350.00"
                                            disabled={processando}
                                            required
                                        />
                                    </div>

                                    {modoModal === "novo" && (
                                        <fieldset className="orcamentos-selecao">
                                            <legend>
                                                Selecione as manutenções
                                            </legend>

                                            <p>
                                                Escolha uma ou mais manutenções
                                                para este orçamento.
                                            </p>

                                            {manutencoesDisponiveis.length === 0 ? (
                                                <div className="orcamentos-aviso">
                                                    Nenhuma manutenção disponível.
                                                    Cadastre uma manutenção ou
                                                    verifique se as existentes já
                                                    possuem orçamento ativo.
                                                </div>
                                            ) : (
                                                <div className="orcamentos-lista-manutencoes">
                                                    {manutencoesDisponiveis.map(
                                                        (manutencao) => (
                                                            <label
                                                                className="orcamentos-item-manutencao"
                                                                key={manutencao.id}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formulario.maintenanceIds.includes(
                                                                        manutencao.id
                                                                    )}
                                                                    onChange={() =>
                                                                        alternarManutencao(
                                                                            manutencao.id
                                                                        )
                                                                    }
                                                                    disabled={processando}
                                                                />

                                                                <span>
                                  <strong>
                                    Manutenção #
                                      {manutencao.id}
                                  </strong>

                                  <span>
                                    {manutencao.client
                                            ?.name ??
                                        "Cliente não informado"}
                                  </span>

                                  <small>
                                    {
                                        manutencao.description
                                    }
                                  </small>
                                </span>
                                                            </label>
                                                        )
                                                    )}
                                                </div>
                                            )}

                                            <span className="orcamentos-selecionadas">
                        {
                            formulario.maintenanceIds
                                .length
                        }{" "}
                                                {formulario.maintenanceIds
                                                    .length === 1
                                                    ? "manutenção selecionada"
                                                    : "manutenções selecionadas"}
                      </span>
                                        </fieldset>
                                    )}

                                    {modoModal === "editar" &&
                                        orcamentoSelecionado && (
                                            <div className="orcamentos-aviso">
                                                As manutenções vinculadas
                                                permanecem as mesmas. Nesta
                                                edição, você pode alterar o valor
                                                do orçamento.
                                            </div>
                                        )}

                                    <div className="orcamentos-formulario-acoes">
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
                                            disabled={processando}
                                        >
                                            {processando
                                                ? "Salvando..."
                                                : "Salvar orçamento"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {modoModal === "detalhes" &&
                                orcamentoSelecionado && (
                                    <>
                                        <dl className="orcamentos-detalhes">
                                            <div>
                                                <dt>Número</dt>
                                                <dd>
                                                    #{orcamentoSelecionado.id}
                                                </dd>
                                            </div>

                                            <div>
                                                <dt>Valor</dt>
                                                <dd>
                                                    {formatarMoeda(
                                                        orcamentoSelecionado.price
                                                    )}
                                                </dd>
                                            </div>

                                            <div>
                                                <dt>Status</dt>
                                                <dd>
                                                    {nomesStatusOrcamento[
                                                        orcamentoSelecionado.status
                                                        ]}
                                                </dd>
                                            </div>

                                            <div>
                                                <dt>Cliente(s)</dt>
                                                <dd>
                                                    {nomesClientes(
                                                        orcamentoSelecionado
                                                    )}
                                                </dd>
                                            </div>
                                        </dl>

                                        <div className="orcamentos-detalhes-manutencoes">
                                            <h4>Manutenções vinculadas</h4>

                                            {orcamentoSelecionado.maintenance
                                                .length === 0 ? (
                                                <p>
                                                    Nenhuma manutenção vinculada.
                                                </p>
                                            ) : (
                                                <ul>
                                                    {orcamentoSelecionado.maintenance.map(
                                                        (manutencao) => (
                                                            <li key={manutencao.id}>
                                                                <strong>
                                                                    #{manutencao.id}
                                                                </strong>{" "}
                                                                —{" "}
                                                                {
                                                                    manutencao.description
                                                                }
                                                                <span>
                                  {manutencao.client
                                          ?.name ??
                                      "Cliente não informado"}
                                </span>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )}
                                        </div>

                                        <div className="orcamentos-formulario-acoes">
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
                                                    abrirEdicao(
                                                        orcamentoSelecionado
                                                    )
                                                }
                                            >
                                                Editar orçamento
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

export default Orcamentos;
