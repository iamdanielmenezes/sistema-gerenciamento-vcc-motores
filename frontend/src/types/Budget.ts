
import type { Manutencao } from "./Maintenance";

export type StatusOrcamento =
    | "AGUARDANDO_APROVACAO"
    | "CANCELADO"
    | "APROVADO";

export interface Orcamento {
    id: number;
    price: number;
    status: StatusOrcamento;
    maintenance: Manutencao[];
}

export type NovoOrcamento = {
    price: number;
    maintenance: {
        id: number;
    }[];
};

export type AtualizacaoOrcamento = {
    price: number;
    status: StatusOrcamento;
};

export const nomesStatusOrcamento: Record<
    StatusOrcamento,
    string
> = {
    AGUARDANDO_APROVACAO: "Aguardando aprovação",
    CANCELADO: "Cancelado",
    APROVADO: "Aprovado",
};
