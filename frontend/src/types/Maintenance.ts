
import type { Cliente } from "./Client";

export type StatusManutencao =
    | "ORCADO"
    | "EM_MANUTENCAO"
    | "FINALIZADO";

export interface Manutencao {
    id: number;
    date: string;
    description: string;
    status: StatusManutencao;
    client: Cliente;
}

export type NovaManutencao = {
    date: string;
    description: string;
    client: {
        id: number;
    };
};

export type AtualizacaoManutencao = {
    date: string;
    description: string;
    status: StatusManutencao;
    client: {
        id: number;
    };
};

export const nomesStatusManutencao: Record<
    StatusManutencao,
    string
> = {
    ORCADO: "Orçado",
    EM_MANUTENCAO: "Em manutenção",
    FINALIZADO: "Finalizado",
};
