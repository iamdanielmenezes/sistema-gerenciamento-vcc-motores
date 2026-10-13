type BotaoProps = {
    texto: string;
    aoClicar?: () => void;
    tipo?: "button" | "submit" | "reset";
    variante?: "primario" | "secundario";
    desabilitado?: boolean;
};

function Botao({
                   texto,
                   aoClicar,
                   tipo = "button",
                   variante = "primario",
                   desabilitado = false,
               }: BotaoProps) {
    return (
        <button
            type={tipo}
            className={`botao botao-${variante}`}
            onClick={aoClicar}
            disabled={desabilitado}
        >
            {texto}
        </button>
    );
}

export default Botao;
