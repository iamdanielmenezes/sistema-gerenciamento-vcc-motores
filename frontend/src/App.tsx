import "./App.css";

function App() {
    return (
        <div className="layout">
            <aside className="menu-lateral">
                <h2>VCC Motores</h2>
                <nav>
                    <p>Dashboard</p>
                    <p>Clientes</p>
                    <p>Manutenções</p>
                    <p>Orçamentos</p>
                    <p>Pagamentos</p>
                </nav>
            </aside>

            <div className="area-principal">
                <header className="cabecalho">
                    <h1>Sistema de gerenciamento</h1>
                </header>

                <main className="conteudo">
                    <h2>Dashboard</h2>
                    <p>Bem-vindo ao sistema VCC Motores.</p>
                </main>
            </div>
        </div>
    );
}

export default App;
