
export class ApiError extends Error {
    public status: number;

    constructor(status: number, message: string) {
        super(message);

        this.name = "ApiError";
        this.status = status;

        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export async function verificarResposta(
    resposta: Response
): Promise<void> {
    if (resposta.ok) {
        return;
    }

    let mensagem = `Erro ${resposta.status}: ${resposta.statusText}`;

    try {
        const dados: unknown = await resposta.json();

        if (
            typeof dados === "object" &&
            dados !== null &&
            "message" in dados &&
            typeof dados.message === "string"
        ) {
            mensagem = dados.message;
        } else if (
            typeof dados === "object" &&
            dados !== null &&
            "error" in dados &&
            typeof dados.error === "string"
        ) {
            mensagem = dados.error;
        }
    } catch {
        // Mantém a mensagem padrão quando a resposta não é JSON.
    }

    throw new ApiError(resposta.status, mensagem);
}
