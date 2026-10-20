
import type { Cliente } from "../types/Client";
import { verificarResposta } from "./apiError";

const API_URL = "/client";

export type NovoCliente = Omit<Cliente, "id">;

export async function listarClientes(): Promise<Cliente[]> {
    const resposta = await fetch(API_URL);
    await verificarResposta(resposta);
    return (await resposta.json()) as Cliente[];
}

export async function buscarClientesPorNome(
    nome: string
): Promise<Cliente[]> {
    const resposta = await fetch(
        `${API_URL}?name=${encodeURIComponent(nome)}`
    );

    await verificarResposta(resposta);
    return (await resposta.json()) as Cliente[];
}

export async function buscarClientePorId(
    id: number
): Promise<Cliente> {
    const resposta = await fetch(`${API_URL}/${id}`);
    await verificarResposta(resposta);
    return (await resposta.json()) as Cliente;
}

export async function cadastrarCliente(
    cliente: NovoCliente
): Promise<Cliente> {
    const resposta = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(cliente),
    });

    await verificarResposta(resposta);
    return (await resposta.json()) as Cliente;
}

export async function atualizarCliente(
    id: number,
    cliente: NovoCliente
): Promise<Cliente> {
    const resposta = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(cliente),
    });

    await verificarResposta(resposta);
    return (await resposta.json()) as Cliente;
}

export async function excluirCliente(
    id: number
): Promise<void> {
    const resposta = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });

    await verificarResposta(resposta);
}
