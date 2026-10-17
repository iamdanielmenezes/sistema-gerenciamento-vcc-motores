
import type {
    AtualizacaoPagamento,
    NovoPagamento,
    Pagamento,
    StatusPagamento,
} from "../types/Payment";

import { verificarResposta } from "./apiError";

const API_URL = "http://localhost:8080";

export async function listarPagamentos(): Promise<Pagamento[]> {
    const resposta = await fetch(`${API_URL}/payment`);

    await verificarResposta(resposta);

    return (await resposta.json()) as Pagamento[];
}

export async function buscarPagamentoPorId(
    id: number
): Promise<Pagamento> {
    const resposta = await fetch(`${API_URL}/payment/${id}`);

    await verificarResposta(resposta);

    return (await resposta.json()) as Pagamento;
}

export async function buscarPagamentosPorStatus(
    status: StatusPagamento
): Promise<Pagamento[]> {
    const resposta = await fetch(
        `${API_URL}/payment?status=${encodeURIComponent(status)}`
    );

    await verificarResposta(resposta);

    return (await resposta.json()) as Pagamento[];
}

export async function cadastrarPagamento(
    pagamento: NovoPagamento
): Promise<Pagamento> {
    const resposta = await fetch(`${API_URL}/payment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(pagamento),
    });

    await verificarResposta(resposta);

    return (await resposta.json()) as Pagamento;
}

export async function atualizarPagamento(
    id: number,
    pagamento: AtualizacaoPagamento
): Promise<Pagamento> {
    // Consulta o pagamento atual para preservar o orçamento vinculado.
    const pagamentoAtual = await buscarPagamentoPorId(id);

    if (!pagamentoAtual.budget?.id) {
        throw new Error(
            "Não foi possível identificar o orçamento vinculado ao pagamento."
        );
    }

    // O backend exige budget no corpo da requisição devido ao @NotNull
    // da entidade Payment, mesmo que o service não altere essa relação.
    const dadosAtualizados = {
        method: pagamento.method,
        status: pagamento.status,
        budget: {
            id: pagamentoAtual.budget.id,
        },
    };

    const resposta = await fetch(`${API_URL}/payment/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosAtualizados),
    });

    await verificarResposta(resposta);

    return (await resposta.json()) as Pagamento;
}

export async function excluirPagamento(
    id: number
): Promise<void> {
    const resposta = await fetch(`${API_URL}/payment/${id}`, {
        method: "DELETE",
    });

    await verificarResposta(resposta);
}
