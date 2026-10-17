
import type {
    AtualizacaoOrcamento,
    NovoOrcamento,
    Orcamento,
    StatusOrcamento,
} from "../types/Budget";
import { verificarResposta } from "./apiError";

const API_URL = "http://localhost:8080";

export async function listarOrcamentos(): Promise<Orcamento[]> {
    const resposta = await fetch(`${API_URL}/budget`);

    await verificarResposta(resposta);

    return (await resposta.json()) as Orcamento[];
}

export async function buscarOrcamentoPorId(
    id: number
): Promise<Orcamento> {
    const resposta = await fetch(`${API_URL}/budget/${id}`);

    await verificarResposta(resposta);

    return (await resposta.json()) as Orcamento;
}

export async function buscarOrcamentosPorStatus(
    status: StatusOrcamento
): Promise<Orcamento[]> {
    const resposta = await fetch(
        `${API_URL}/budget?status=${encodeURIComponent(status)}`
    );

    await verificarResposta(resposta);

    return (await resposta.json()) as Orcamento[];
}

export async function cadastrarOrcamento(
    orcamento: NovoOrcamento
): Promise<Orcamento> {
    const resposta = await fetch(`${API_URL}/budget`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(orcamento),
    });

    await verificarResposta(resposta);

    return (await resposta.json()) as Orcamento;
}

export async function atualizarOrcamento(
    id: number,
    orcamento: AtualizacaoOrcamento
): Promise<Orcamento> {
    const resposta = await fetch(`${API_URL}/budget/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(orcamento),
    });

    await verificarResposta(resposta);

    return (await resposta.json()) as Orcamento;
}

export async function excluirOrcamento(
    id: number
): Promise<void> {
    const resposta = await fetch(`${API_URL}/budget/${id}`, {
        method: "DELETE",
    });

    await verificarResposta(resposta);
}
