
import type { Orcamento } from "./Budget";

export type MetodoPagamento =
    | "DEBITO"
    | "CREDITO"
    | "DINHEIRO"
    | "PIX";

export type StatusPagamento =
    | "PENDENTE"
    | "PAGO"
    | "CANCELADO";

export interface Pagamento {
    id: number;
    method: MetodoPagamento;
    status: StatusPagamento;
    budget: Orcamento;
}

export type NovoPagamento = {
    method: MetodoPagamento;
    status: StatusPagamento;
    budget: {
        id: number;
    };
};

export type AtualizacaoPagamento = {
    method: MetodoPagamento;
    status: StatusPagamento;
};

export const nomesMetodosPagamento: Record<
    MetodoPagamento,
    string
> = {
    DEBITO: "Débito",
    CREDITO: "Crédito",
    DINHEIRO: "Dinheiro",
    PIX: "Pix",
};

export const nomesStatusPagamento: Record<
    StatusPagamento,
    string
> = {
    PENDENTE: "Pendente",
    PAGO: "Pago",
    CANCELADO: "Cancelado",
};
