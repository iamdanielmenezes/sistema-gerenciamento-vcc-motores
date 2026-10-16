
export class ApiError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export async function verificarResposta(
    resposta: Response
): Promise<void> {
    if (resposta.ok) return;

    let mensagem = `Erro na requisição (HTTP ${resposta.status}).`;

    try {
        const dados: unknown = await resposta.json();

        if (dados && typeof dados === "object") {
            const erro = dados as Record<string, unknown>;

            if (
                typeof erro.message === "string" &&
                erro.message.trim()
            ) {
                mensagem = erro.message;
            } else if (
                typeof erro.error === "string" &&
                erro.error.trim()
            ) {
                mensagem = erro.error;
            }
        }
    } catch {
        // Mantém a mensagem padrão quando não há JSON válido.
    }

    throw new ApiError(resposta.status, mensagem);
}
