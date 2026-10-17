
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Cliente } from "../types/Client";
import {
    atualizarCliente,
    buscarClientesPorNome,
    cadastrarCliente,
    excluirCliente,
    listarClientes,
} from "../services/ClienteService";
import type { NovoCliente } from "../services/ClienteService";
import { ApiError } from "../services/apiError";
import Botao from "../components/Botao";
import "./Clientes.css";

type ModoFormulario = "novo" | "editar" | null;

const formularioVazio: NovoCliente = {
    name: "",
    cpf: "",
    email: "",
    phone: "",
};

function obterMensagemErro(erro: unknown): string {
    if (erro instanceof ApiError) {
        return `Erro ${erro.status}: ${erro.message}`;
    }

    return "Não foi possível conectar ao servidor. Verifique se o backend está funcionando.";
}

function formatarCpf(cpf: string): string {
    const numeros = cpf.replace(/\D/g, "");

    if (numeros.length !== 11) return cpf;

    return numeros.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        "$1.$2.$3-$4"
    );
}

function formatarTelefone(telefone: string): string {
    const numeros = telefone.replace(/\D/g, "");

    if (numeros.length !== 11) return telefone;

    return numeros.replace(
        /(\d{2})(\d{5})(\d{4})/,
        "($1) $2-$3"
    );
}

function cpfValido(cpf: string): boolean {
    const numeros = cpf.replace(/\D/g, "");

    if (!/^\d{11}$/.test(numeros) || /^(\d)\1{10}$/.test(numeros)) {
        return false;
    }

    for (let tamanho = 9; tamanho <= 10; tamanho++) {
        let soma = 0;

        for (let indice = 0; indice < tamanho; indice++) {
            soma += Number(numeros[indice]) * (tamanho + 1 - indice);
        }

        const resto = (soma * 10) % 11;
        const digito = resto === 10 ? 0 : resto;

        if (digito !== Number(numeros[tamanho])) {
            return false;
        }
    }

    return true;
}

function validarFormulario(dados: NovoCliente): string {
    const nome = dados.name.trim();
    const cpf = dados.cpf.replace(/\D/g, "");
    const telefone = dados.phone.replace(/\D/g, "");

    if (nome.length < 3 || nome.length > 100) {
        return "O nome deve ter entre 3 e 100 caracteres.";
    }

    if (!cpfValido(cpf)) {
        return "Informe um CPF válido.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) {
        return "Informe um e-mail válido.";
    }

    if (!/^\d{11}$/.test(telefone)) {
        return "O telefone deve conter DDD e 9 dígitos.";
    }

    return "";
}

function Clientes() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [processando, setProcessando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const [modoFormulario, setModoFormulario] =
        useState<ModoFormulario>(null);

    const [clienteSelecionado, setClienteSelecionado] =
        useState<Cliente | null>(null);

    const [formulario, setFormulario] =
        useState<NovoCliente>(formularioVazio);

    const [clienteEmEdicao, setClienteEmEdicao] =
        useState<number | null>(null);

    const carregarClientes = useCallback(async (nome: string) => {
        setCarregando(true);
        setErro("");

        try {
            const dados = nome.trim()
                ? await buscarClientesPorNome(nome.trim())
                : await listarClientes();

            setClientes(dados);
        } catch (erroRecebido) {
            setErro(obterMensagemErro(erroRecebido));
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        void carregarClientes("");
    }, [carregarClientes]);

    function limparMensagens() {
        setErro("");
        setSucesso("");
    }

    function abrirCadastro() {
        limparMensagens();
        setClienteSelecionado(null);
        setClienteEmEdicao(null);
        setFormulario({ ...formularioVazio });
        setModoFormulario("novo");
    }

    function abrirEdicao(cliente: Cliente) {
        limparMensagens();
        setClienteSelecionado(null);
        setClienteEmEdicao(cliente.id);

        setFormulario({
            name: cliente.name,
            cpf: cliente.cpf,
            email: cliente.email,
            phone: cliente.phone,
        });

        setModoFormulario("editar");
    }

    function abrirDetalhes(cliente: Cliente) {
        limparMensagens();
        setModoFormulario(null);
        setClienteSelecionado(cliente);
    }

    function fecharPainel() {
        setModoFormulario(null);
        setClienteSelecionado(null);
        setClienteEmEdicao(null);
    }

    function atualizarCampo(campo: keyof NovoCliente, valor: string) {
        setFormulario((anterior) => ({
            ...anterior,
            [campo]: valor,
        }));
    }

    async function pesquisarClientes(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        limparMensagens();
        await carregarClientes(busca);
    }

    async function limparPesquisa() {
        setBusca("");
        limparMensagens();
        await carregarClientes("");
    }

    async function salvarCliente(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        if (processando) return;

        limparMensagens();

        const mensagemValidacao = validarFormulario(formulario);

        if (mensagemValidacao) {
            setErro(mensagemValidacao);
            return;
        }

        const dados: NovoCliente = {
            name: formulario.name.trim(),
            cpf: formulario.cpf.replace(/\D/g, ""),
            email: formulario.email.trim(),
            phone: formulario.phone.replace(/\D/g, ""),
        };

        setProcessando(true);

        try {
            if (modoFormulario === "editar" && clienteEmEdicao !== null) {
                await atualizarCliente(clienteEmEdicao, dados);
                setSucesso("Cliente atualizado com sucesso!");
            } else {
                await cadastrarCliente(dados);
                setSucesso("Cliente cadastrado com sucesso!");
            }

            fecharPainel();
            await carregarClientes(busca);
        } catch (erroRecebido) {
            setErro(obterMensagemErro(erroRecebido));
        } finally {
            setProcessando(false);
        }
    }

    async function removerCliente(cliente: Cliente) {
        if (processando) return;

        const confirmado = window.confirm(
            `Deseja realmente excluir o cliente "${cliente.name}"?`
        );

        if (!confirmado) return;

        limparMensagens();
        setProcessando(true);

        try {
            await excluirCliente(cliente.id);
            fecharPainel();
            setSucesso("Cliente excluído com sucesso!");
            await carregarClientes(busca);
        } catch (erroRecebido) {
            setErro(obterMensagemErro(erroRecebido));
        } finally {
            setProcessando(false);
        }
    }

    return (
        <div className="pagina-clientes">
            <section className="titulo-pagina">
                <div>
                    <span className="texto-superior">CADASTROS</span>
                    <h2>Clientes</h2>
                    <p>Gerencie os clientes cadastrados na oficina.</p>
                </div>

                <div className="acoes-pagina">
                    <Botao
                        texto="+ Novo cliente"
                        aoClicar={abrirCadastro}
                        desabilitado={processando}
                    />
                </div>
            </section>

            {erro && (
                <div className="clientes-mensagem clientes-mensagem-erro" role="alert">
                    {erro}
                </div>
            )}

            {sucesso && (
                <div
                    className="clientes-mensagem clientes-mensagem-sucesso"
                    role="status"
                >
                    {sucesso}
                </div>
            )}

            <section className="painel">
                <div className="painel-cabecalho">
                    <div>
                        <h3>Clientes cadastrados</h3>
                        <p>Consulte e gerencie os registros do sistema.</p>
                    </div>

                    <span className="contador-registros">
            {clientes.length} {clientes.length === 1 ? "registro" : "registros"}
          </span>
                </div>

                <form className="clientes-pesquisa" onSubmit={pesquisarClientes}>
                    <label htmlFor="pesquisa-cliente">Buscar por nome</label>

                    <div className="clientes-pesquisa-acoes">
                        <input
                            id="pesquisa-cliente"
                            type="search"
                            placeholder="Digite o nome do cliente"
                            value={busca}
                            onChange={(evento) => setBusca(evento.target.value)}
                        />

                        <button
                            className="botao botao-primario"
                            type="submit"
                            disabled={carregando}
                        >
                            Buscar
                        </button>

                        <button
                            className="botao botao-secundario"
                            type="button"
                            onClick={() => void limparPesquisa()}
                            disabled={carregando}
                        >
                            Limpar
                        </button>
                    </div>
                </form>

                {carregando ? (
                    <p className="clientes-estado">Carregando clientes...</p>
                ) : clientes.length === 0 ? (
                    <p className="clientes-estado">
                        Nenhum cliente encontrado.
                    </p>
                ) : (
                    <div className="tabela-container">
                        <table className="tabela">
                            <thead>
                            <tr>
                                <th scope="col">Nome</th>
                                <th scope="col">CPF</th>
                                <th scope="col">E-mail</th>
                                <th scope="col">Telefone</th>
                                <th scope="col">Ações</th>
                            </tr>
                            </thead>

                            <tbody>
                            {clientes.map((cliente) => (
                                <tr key={cliente.id}>
                                    <td className="celula-cliente">{cliente.name}</td>
                                    <td>{formatarCpf(cliente.cpf)}</td>
                                    <td>{cliente.email}</td>
                                    <td>{formatarTelefone(cliente.phone)}</td>
                                    <td>
                                        <div className="clientes-acoes-tabela">
                                            <button
                                                type="button"
                                                onClick={() => abrirDetalhes(cliente)}
                                                disabled={processando}
                                            >
                                                Ver
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => abrirEdicao(cliente)}
                                                disabled={processando}
                                            >
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                className="clientes-acao-excluir"
                                                onClick={() => void removerCliente(cliente)}
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

            {modoFormulario && (
                <section className="painel clientes-painel-formulario">
                    <div className="painel-cabecalho">
                        <div>
                            <h3>
                                {modoFormulario === "novo"
                                    ? "Cadastrar cliente"
                                    : "Editar cliente"}
                            </h3>
                            <p>Preencha os dados abaixo.</p>
                        </div>
                    </div>

                    <form className="clientes-formulario" onSubmit={salvarCliente}>
                        <div className="clientes-campo clientes-campo-completo">
                            <label htmlFor="cliente-nome">Nome completo</label>
                            <input
                                id="cliente-nome"
                                type="text"
                                minLength={3}
                                maxLength={100}
                                required
                                value={formulario.name}
                                onChange={(evento) =>
                                    atualizarCampo("name", evento.target.value)
                                }
                                disabled={processando}
                            />
                        </div>

                        <div className="clientes-campo">
                            <label htmlFor="cliente-cpf">CPF</label>
                            <input
                                id="cliente-cpf"
                                type="text"
                                inputMode="numeric"
                                placeholder="000.000.000-00"
                                maxLength={14}
                                required
                                value={formulario.cpf}
                                onChange={(evento) =>
                                    atualizarCampo("cpf", evento.target.value)
                                }
                                disabled={processando}
                            />
                        </div>

                        <div className="clientes-campo">
                            <label htmlFor="cliente-telefone">Telefone</label>
                            <input
                                id="cliente-telefone"
                                type="tel"
                                placeholder="(13) 99999-9999"
                                required
                                value={formulario.phone}
                                onChange={(evento) =>
                                    atualizarCampo("phone", evento.target.value)
                                }
                                disabled={processando}
                            />
                        </div>

                        <div className="clientes-campo clientes-campo-completo">
                            <label htmlFor="cliente-email">E-mail</label>
                            <input
                                id="cliente-email"
                                type="email"
                                required
                                value={formulario.email}
                                onChange={(evento) =>
                                    atualizarCampo("email", evento.target.value)
                                }
                                disabled={processando}
                            />
                        </div>

                        <div className="clientes-formulario-acoes">
                            <button
                                className="botao botao-secundario"
                                type="button"
                                onClick={fecharPainel}
                                disabled={processando}
                            >
                                Cancelar
                            </button>

                            <button
                                className="botao botao-primario"
                                type="submit"
                                disabled={processando}
                            >
                                {processando ? "Salvando..." : "Salvar cliente"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {clienteSelecionado && (
                <section className="painel clientes-painel-detalhes">
                    <div className="painel-cabecalho">
                        <div>
                            <h3>Detalhes do cliente</h3>
                            <p>Informações cadastradas no sistema.</p>
                        </div>
                    </div>

                    <dl className="clientes-detalhes">
                        <div>
                            <dt>Código</dt>
                            <dd>#{clienteSelecionado.id}</dd>
                        </div>

                        <div>
                            <dt>Nome</dt>
                            <dd>{clienteSelecionado.name}</dd>
                        </div>

                        <div>
                            <dt>CPF</dt>
                            <dd>{formatarCpf(clienteSelecionado.cpf)}</dd>
                        </div>

                        <div>
                            <dt>E-mail</dt>
                            <dd>{clienteSelecionado.email}</dd>
                        </div>

                        <div>
                            <dt>Telefone</dt>
                            <dd>{formatarTelefone(clienteSelecionado.phone)}</dd>
                        </div>
                    </dl>

                    <div className="clientes-formulario-acoes">
                        <button
                            className="botao botao-secundario"
                            type="button"
                            onClick={fecharPainel}
                        >
                            Fechar
                        </button>

                        <button
                            className="botao botao-primario"
                            type="button"
                            onClick={() => abrirEdicao(clienteSelecionado)}
                        >
                            Editar cliente
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}

export default Clientes;
