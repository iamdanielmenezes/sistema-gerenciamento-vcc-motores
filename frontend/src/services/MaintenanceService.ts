
import type {
    AtualizacaoManutencao,
    Manutencao,
    NovaManutencao,
    StatusManutencao,
} from "../types/Maintenance";
import { verificarResposta } from "./apiError";

const API_URL = "/maintenance";

export async function listarManutencoes(): Promise<Manutencao[]> {
    const resposta = await fetch(API_URL);

    await verificarResposta(resposta);

    return (await resposta.json()) as Manutencao[];
}

export async function buscarManutencaoPorId(
    id: number
): Promise<Manutencao> {
    const resposta = await fetch(`${API_URL}/${id}`);

    await verificarResposta(resposta);

    return (await resposta.json()) as Manutencao;
}

export async function buscarManutencoesPorCliente(
    clienteId: number
): Promise<Manutencao[]> {
    const resposta = await fetch(
        `${API_URL}?clientId=${clienteId}`
    );

    await verificarResposta(resposta);

    return (await resposta.json()) as Manutencao[];
}

export async function buscarManutencoesPorStatus(
    status: StatusManutencao
): Promise<Manutencao[]> {
    const resposta = await fetch(
        `${API_URL}?status=${encodeURIComponent(status)}`
    );

    await verificarResposta(resposta);

    return (await resposta.json()) as Manutencao[];
}

export async function cadastrarManutencao(
    manutencao: NovaManutencao
): Promise<Manutencao> {
    const resposta = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(manutencao),
    });

    await verificarResposta(resposta);

    return (await resposta.json()) as Manutencao;
}

export async function atualizarManutencao(
    id: number,
    manutencao: AtualizacaoManutencao
): Promise<Manutencao> {
    const resposta = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(manutencao),
    });

    await verificarResposta(resposta);

    return (await resposta.json()) as Manutencao;
}

export async function excluirManutencao(
    id: number
): Promise<void> {
    const resposta = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });

    await verificarResposta(resposta);
}
