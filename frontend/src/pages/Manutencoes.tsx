
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import type { Cliente } from "../types/Client";
import type {
    Manutencao,
    StatusManutencao,
} from "../types/Maintenance";
import { nomesStatusManutencao } from "../types/Maintenance";
import { listarClientes } from "../services/ClienteService";
import {
    atualizarManutencao,
    cadastrarManutencao,
    excluirManutencao,
    listarManutencoes,
} from "../services/MaintenanceService";
import { ApiError } from "../services/apiError";
import "./Manutencoes.css";

type ModoFormulario = "novo" | "editar" | null;

type FormularioManutencao = {
    clientId: string;
    date: string;
    description: string;
    status: StatusManutencao;
};

const formularioVazio: FormularioManutencao = {
    clientId: "",
    date: "",
    description: "",
    status: "ORCADO",
};

const statusDisponiveis: StatusManutencao[] = [
    "ORCADO",
    "EM_MANUTENCAO",
    "FINALIZADO",
];

function obterMensagemErro(erro: unknown): string {
    if (erro instanceof ApiError) {
        return `Erro ${erro.status}: ${erro.message}`;
    }

    return "Não foi possível conectar ao servidor. Verifique se o backend está funcionando.";
}

function dataParaFormulario(data: string): string {
    const partes = data.match(
        /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/
    );

    if (!partes) return "";

    const [, dia, mes, ano, hora, minuto] = partes;

    return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
}

function dataParaApi(data: string): string {
    const partes = data.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
    );

    if (!partes) return "";

    const [, ano, mes, dia, hora, minuto] = partes;

    return `${dia}/${mes}/${ano} ${hora}:${minuto}:00`;
}

function dataAtualFormulario(): string {
    const agora = new Date();

    const numero = (valor: number) =>
        String(valor).padStart(2, "0");

    return (
        `${agora.getFullYear()}-` +
        `${numero(agora.getMonth() + 1)}-` +
        `${numero(agora.getDate())}T` +
        `${numero(agora.getHours())}:` +
        `${numero(agora.getMinutes())}`
    );
}

function classeStatus(status: StatusManutencao): string {
    switch (status) {
        case "ORCADO":
            return "manutencoes-status manutencoes-status-orcado";

        case "EM_MANUTENCAO":
            return "manutencoes-status manutencoes-status-andamento";

        case "FINALIZADO":
            return "manutencoes-status manutencoes-status-finalizado";
    }
}

function Manutencoes() {
    const [manutencoes, setManutencoes] =
        useState<Manutencao[]>([]);

    const [clientes, setClientes] = useState<Cliente[]>([]);

    const [carregando, setCarregando] = useState(true);
    const [processando, setProcessando] = useState(false);

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const [filtroCliente, setFiltroCliente] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");

    const [modoFormulario, setModoFormulario] =
        useState<ModoFormulario>(null);

    const [manutencaoEmEdicao, setManutencaoEmEdicao] =
        useState<Manutencao | null>(null);

    const [manutencaoSelecionada, setManutencaoSelecionada] =
        useState<Manutencao | null>(null);

    const [formulario, setFormulario] =
        useState<FormularioManutencao>(formularioVazio);

    const referenciaModal = useRef<HTMLDivElement>(null);

    const modalAberto =
        modoFormulario !== null ||
        manutencaoSelecionada !== null;

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErro("");

        try {
            const [dadosManutencoes, dadosClientes] =
                await Promise.all([
                    listarManutencoes(),
                    listarClientes(),
                ]);

            setManutencoes(dadosManutencoes);
            setClientes(dadosClientes);
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
                setModoFormulario(null);
                setManutencaoEmEdicao(null);
                setManutencaoSelecionada(null);
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

    const manutencoesFiltradas = manutencoes.filter(
        (manutencao) => {
            const correspondeCliente =
                !filtroCliente ||
                manutencao.client?.id === Number(filtroCliente);

            const correspondeStatus =
                !filtroStatus ||
                manutencao.status === filtroStatus;

            return correspondeCliente && correspondeStatus;
        }
    );

    function limparMensagens() {
        setErro("");
        setSucesso("");
    }

    function fecharModal() {
        if (processando) return;

        setModoFormulario(null);
        setManutencaoEmEdicao(null);
        setManutencaoSelecionada(null);
    }

    function abrirCadastro() {
        limparMensagens();

        setManutencaoSelecionada(null);
        setManutencaoEmEdicao(null);

        setFormulario({
            ...formularioVazio,
            date: dataAtualFormulario(),
        });

        setModoFormulario("novo");
    }

    function abrirEdicao(manutencao: Manutencao) {
        limparMensagens();

        setManutencaoSelecionada(null);
        setManutencaoEmEdicao(manutencao);

        setFormulario({
            clientId: String(manutencao.client?.id ?? ""),
            date: dataParaFormulario(manutencao.date),
            description: manutencao.description,
            status: manutencao.status,
        });

        setModoFormulario("editar");
    }

    function abrirDetalhes(manutencao: Manutencao) {
        limparMensagens();

        setModoFormulario(null);
        setManutencaoEmEdicao(null);
        setManutencaoSelecionada(manutencao);
    }

    function aoClicarFundo(
        evento: MouseEvent<HTMLDivElement>
    ) {
        if (evento.target === evento.currentTarget) {
            fecharModal();
        }
    }

    function atualizarCampo(
        campo: keyof FormularioManutencao,
        valor: string
    ) {
        setFormulario((anterior) => ({
            ...anterior,
            [campo]: valor,
        }));
    }

    function validarFormulario(): string {
        if (!formulario.clientId) {
            return "Selecione um cliente.";
        }

        if (
            !formulario.date ||
            !dataParaApi(formulario.date)
        ) {
            return "Informe uma data e hora válidas.";
        }

        const descricao = formulario.description.trim();

        if (
            descricao.length < 5 ||
            descricao.length > 500
        ) {
            return "A descrição deve ter entre 5 e 500 caracteres.";
        }

        return "";
    }

    async function salvarManutencao(
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
            const dados = {
                date: dataParaApi(formulario.date),
                description: formulario.description.trim(),
            };

            if (
                modoFormulario === "editar" &&
                manutencaoEmEdicao
            ) {
                await atualizarManutencao(
                    manutencaoEmEdicao.id,
                    {
                        ...dados,
                        status: formulario.status,
                        client: {
                            id: Number(formulario.clientId),
                        },
                    }
                );

                setSucesso("Manutenção atualizada com sucesso!");
            } else {
                await cadastrarManutencao({
                    ...dados,
                    client: {
                        id: Number(formulario.clientId),
                    },
                });

                setSucesso("Manutenção cadastrada com sucesso!");
            }

            setModoFormulario(null);
            setManutencaoEmEdicao(null);
            setManutencaoSelecionada(null);

            await carregarDados();
        } catch (erroRecebido) {
            setErro(obterMensagemErro(erroRecebido));
        } finally {
            setProcessando(false);
        }
    }

    async function alterarStatus(
        manutencao: Manutencao,
        novoStatus: StatusManutencao
    ) {
        if (
            processando ||
            manutencao.status === novoStatus
        ) {
            return;
        }

        const confirmado = window.confirm(
            `Alterar a manutenção #${manutencao.id} para "${nomesStatusManutencao[novoStatus]}"?`
        );

        if (!confirmado) return;

        limparMensagens();
        setProcessando(true);

        try {
            await atualizarManutencao(
                manutencao.id,
                {
                    date: manutencao.date,
                    description: manutencao.description,
                    status: novoStatus,
                    client: {
                        id: manutencao.client.id,
                    },
                }
            );

            setModoFormulario(null);
            setManutencaoEmEdicao(null);
            setManutencaoSelecionada(null);

            setSucesso("Status atualizado com sucesso!");

            await carregarDados();
        } catch (erroRecebido) {
            setErro(obterMensagemErro(erroRecebido));
        } finally {
            setProcessando(false);
        }
    }

    async function removerManutencao(
        manutencao: Manutencao
    ) {
        if (processando) return;

        const confirmado = window.confirm(
            `Deseja realmente excluir a manutenção #${manutencao.id}?`
        );

        if (!confirmado) return;

        limparMensagens();
        setProcessando(true);

        try {
            await excluirManutencao(manutencao.id);

            setModoFormulario(null);
            setManutencaoEmEdicao(null);
            setManutencaoSelecionada(null);

            setSucesso("Manutenção excluída com sucesso!");

            await carregarDados();
        } catch (erroRecebido) {
            setErro(obterMensagemErro(erroRecebido));
        } finally {
            setProcessando(false);
        }
    }

    function proximoStatus(
        status: StatusManutencao
    ): StatusManutencao | null {
        if (status === "ORCADO") {
            return "EM_MANUTENCAO";
        }

        if (status === "EM_MANUTENCAO") {
            return "FINALIZADO";
        }

        return null;
    }

    return (
        <div className="pagina-manutencoes">
            <section className="titulo-pagina">
                <div>
          <span className="texto-superior">
            GESTÃO DE SERVIÇOS
          </span>

                    <h2>Manutenções</h2>

                    <p>
                        Gerencie os serviços realizados pela oficina.
                    </p>
                </div>

                <div className="acoes-pagina">
                    <button
                        className="botao botao-primario"
                        type="button"
                        onClick={abrirCadastro}
                        disabled={processando || carregando}
                    >
                        + Nova manutenção
                    </button>
                </div>
            </section>

            {erro && !modalAberto && (
                <div
                    className="manutencoes-mensagem manutencoes-mensagem-erro"
                    role="alert"
                >
                    {erro}
                </div>
            )}

            {sucesso && (
                <div
                    className="manutencoes-mensagem manutencoes-mensagem-sucesso"
                    role="status"
                >
                    {sucesso}
                </div>
            )}

            <section className="painel">
                <div className="painel-cabecalho">
                    <div>
                        <h3>Manutenções cadastradas</h3>

                        <p>
                            Consulte, filtre e acompanhe os serviços.
                        </p>
                    </div>

                    <span className="contador-registros">
            {manutencoesFiltradas.length}{" "}
                        {manutencoesFiltradas.length === 1
                            ? "registro"
                            : "registros"}
          </span>
                </div>

                <div className="manutencoes-filtros">
                    <div className="manutencoes-campo">
                        <label htmlFor="filtro-cliente">
                            Cliente
                        </label>

                        <select
                            id="filtro-cliente"
                            value={filtroCliente}
                            onChange={(evento) =>
                                setFiltroCliente(evento.target.value)
                            }
                        >
                            <option value="">
                                Todos os clientes
                            </option>

                            {clientes.map((cliente) => (
                                <option
                                    key={cliente.id}
                                    value={cliente.id}
                                >
                                    {cliente.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="manutencoes-campo">
                        <label htmlFor="filtro-status">
                            Status
                        </label>

                        <select
                            id="filtro-status"
                            value={filtroStatus}
                            onChange={(evento) =>
                                setFiltroStatus(evento.target.value)
                            }
                        >
                            <option value="">
                                Todos os status
                            </option>

                            {statusDisponiveis.map((status) => (
                                <option
                                    key={status}
                                    value={status}
                                >
                                    {nomesStatusManutencao[status]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="botao botao-secundario"
                        type="button"
                        onClick={() => {
                            setFiltroCliente("");
                            setFiltroStatus("");
                        }}
                    >
                        Limpar filtros
                    </button>
                </div>

                {carregando ? (
                    <p className="manutencoes-estado">
                        Carregando manutenções...
                    </p>
                ) : manutencoesFiltradas.length === 0 ? (
                    <p className="manutencoes-estado">
                        Nenhuma manutenção encontrada.
                    </p>
                ) : (
                    <div className="tabela-container">
                        <table className="tabela">
                            <thead>
                            <tr>
                                <th scope="col">Nº</th>
                                <th scope="col">Cliente</th>
                                <th scope="col">Descrição</th>
                                <th scope="col">Data</th>
                                <th scope="col">Status</th>
                                <th scope="col">Ações</th>
                            </tr>
                            </thead>

                            <tbody>
                            {manutencoesFiltradas.map(
                                (manutencao) => {
                                    const seguinte = proximoStatus(
                                        manutencao.status
                                    );

                                    return (
                                        <tr key={manutencao.id}>
                                            <td>#{manutencao.id}</td>

                                            <td className="celula-cliente">
                                                {manutencao.client?.name ??
                                                    "Não informado"}
                                            </td>

                                            <td className="manutencoes-descricao">
                                                {manutencao.description}
                                            </td>

                                            <td>{manutencao.date}</td>

                                            <td>
                          <span
                              className={classeStatus(
                                  manutencao.status
                              )}
                          >
                            {nomesStatusManutencao[
                                    manutencao.status
                                    ] ??
                                manutencao.status}
                          </span>
                                            </td>

                                            <td>
                                                <div className="manutencoes-acoes-tabela">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            abrirDetalhes(manutencao)
                                                        }
                                                        disabled={processando}
                                                    >
                                                        Ver
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            abrirEdicao(manutencao)
                                                        }
                                                        disabled={
                                                            processando ||
                                                            manutencao.status ===
                                                            "FINALIZADO"
                                                        }
                                                    >
                                                        Editar
                                                    </button>

                                                    {seguinte && (
                                                        <button
                                                            type="button"
                                                            className="manutencoes-acao-avancar"
                                                            onClick={() =>
                                                                void alterarStatus(
                                                                    manutencao,
                                                                    seguinte
                                                                )
                                                            }
                                                            disabled={processando}
                                                        >
                                                            Avançar status
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className="manutencoes-acao-excluir"
                                                        onClick={() =>
                                                            void removerManutencao(
                                                                manutencao
                                                            )
                                                        }
                                                        disabled={processando}
                                                    >
                                                        Excluir
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {modalAberto && (
                <div
                    className="manutencoes-modal-fundo"
                    onMouseDown={aoClicarFundo}
                >
                    <div
                        className="manutencoes-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="manutencoes-modal-titulo"
                        tabIndex={-1}
                        ref={referenciaModal}
                    >
                        <div className="manutencoes-modal-cabecalho">
                            <div>
                <span className="texto-superior">
                  GESTÃO DE SERVIÇOS
                </span>

                                <h3 id="manutencoes-modal-titulo">
                                    {modoFormulario === "novo"
                                        ? "Nova manutenção"
                                        : modoFormulario === "editar"
                                            ? "Editar manutenção"
                                            : "Detalhes da manutenção"}
                                </h3>
                            </div>

                            <button
                                type="button"
                                className="manutencoes-modal-fechar"
                                onClick={fecharModal}
                                disabled={processando}
                                aria-label="Fechar janela"
                                title="Fechar"
                            >
                                ×
                            </button>
                        </div>

                        <div className="manutencoes-modal-conteudo">
                            {erro && (
                                <div
                                    className="manutencoes-mensagem manutencoes-mensagem-erro"
                                    role="alert"
                                >
                                    {erro}
                                </div>
                            )}

                            {modoFormulario && (
                                <form
                                    className="manutencoes-formulario"
                                    onSubmit={salvarManutencao}
                                >
                                    <div className="manutencoes-campo">
                                        <label htmlFor="manutencao-cliente">
                                            Cliente
                                        </label>

                                        <select
                                            id="manutencao-cliente"
                                            value={formulario.clientId}
                                            onChange={(evento) =>
                                                atualizarCampo(
                                                    "clientId",
                                                    evento.target.value
                                                )
                                            }
                                            disabled={
                                                processando ||
                                                modoFormulario === "editar"
                                            }
                                            required
                                        >
                                            <option value="">
                                                Selecione um cliente
                                            </option>

                                            {clientes.map((cliente) => (
                                                <option
                                                    key={cliente.id}
                                                    value={cliente.id}
                                                >
                                                    {cliente.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="manutencoes-campo">
                                        <label htmlFor="manutencao-data">
                                            Data e hora
                                        </label>

                                        <input
                                            id="manutencao-data"
                                            type="datetime-local"
                                            value={formulario.date}
                                            onChange={(evento) =>
                                                atualizarCampo(
                                                    "date",
                                                    evento.target.value
                                                )
                                            }
                                            disabled={processando}
                                            required
                                        />
                                    </div>

                                    <div className="manutencoes-campo manutencoes-campo-completo">
                                        <label htmlFor="manutencao-descricao">
                                            Descrição do serviço
                                        </label>

                                        <textarea
                                            id="manutencao-descricao"
                                            rows={4}
                                            minLength={5}
                                            maxLength={500}
                                            value={formulario.description}
                                            onChange={(evento) =>
                                                atualizarCampo(
                                                    "description",
                                                    evento.target.value
                                                )
                                            }
                                            disabled={processando}
                                            placeholder="Descreva o serviço a ser realizado"
                                            required
                                        />

                                        <small>
                                            {formulario.description.length}
                                            /500 caracteres
                                        </small>
                                    </div>

                                    {modoFormulario === "editar" &&
                                        manutencaoEmEdicao && (
                                            <div className="manutencoes-campo">
                                                <label htmlFor="manutencao-status">
                                                    Status
                                                </label>

                                                <select
                                                    id="manutencao-status"
                                                    value={formulario.status}
                                                    onChange={(evento) =>
                                                        atualizarCampo(
                                                            "status",
                                                            evento.target.value
                                                        )
                                                    }
                                                    disabled={processando}
                                                >
                                                    {statusDisponiveis
                                                        .filter((status) => {
                                                            if (
                                                                manutencaoEmEdicao.status ===
                                                                "ORCADO"
                                                            ) {
                                                                return (
                                                                    status === "ORCADO" ||
                                                                    status ===
                                                                    "EM_MANUTENCAO"
                                                                );
                                                            }

                                                            if (
                                                                manutencaoEmEdicao.status ===
                                                                "EM_MANUTENCAO"
                                                            ) {
                                                                return (
                                                                    status ===
                                                                    "EM_MANUTENCAO" ||
                                                                    status === "FINALIZADO"
                                                                );
                                                            }

                                                            return (
                                                                status === "FINALIZADO"
                                                            );
                                                        })
                                                        .map((status) => (
                                                            <option
                                                                key={status}
                                                                value={status}
                                                            >
                                                                {nomesStatusManutencao[
                                                                    status
                                                                    ]}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        )}

                                    <div className="manutencoes-formulario-acoes">
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
                                                : "Salvar manutenção"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {manutencaoSelecionada && (
                                <>
                                    <dl className="manutencoes-detalhes">
                                        <div>
                                            <dt>Número</dt>
                                            <dd>
                                                #{manutencaoSelecionada.id}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>Cliente</dt>
                                            <dd>
                                                {manutencaoSelecionada.client
                                                    ?.name ?? "Não informado"}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>Data e hora</dt>
                                            <dd>
                                                {manutencaoSelecionada.date}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt>Status</dt>
                                            <dd>
                                                {nomesStatusManutencao[
                                                        manutencaoSelecionada.status
                                                        ] ??
                                                    manutencaoSelecionada.status}
                                            </dd>
                                        </div>

                                        <div className="manutencoes-detalhe-completo">
                                            <dt>Descrição</dt>
                                            <dd>
                                                {
                                                    manutencaoSelecionada.description
                                                }
                                            </dd>
                                        </div>
                                    </dl>

                                    <div className="manutencoes-formulario-acoes manutencoes-detalhes-acoes">
                                        <button
                                            className="botao botao-secundario"
                                            type="button"
                                            onClick={fecharModal}
                                        >
                                            Fechar
                                        </button>

                                        {manutencaoSelecionada.status !==
                                            "FINALIZADO" && (
                                                <button
                                                    className="botao botao-primario"
                                                    type="button"
                                                    onClick={() =>
                                                        abrirEdicao(
                                                            manutencaoSelecionada
                                                        )
                                                    }
                                                >
                                                    Editar manutenção
                                                </button>
                                            )}
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

export default Manutencoes;
