const API_QUARTO = "http://localhost:3000/quartos";
const API_RESERVA = "http://localhost:3000/reservas";

async function listarQuartos() {
    const listaQuartos = document.getElementById("listaQuartos");
    if (!listaQuartos) return;

    try {
        const res = await fetch(`${API_BASE}/quartos/listar`);
        const quartos = await res.json();
        listaQuartos.innerHTML = "";

        quartos.forEach(quarto => {
            listaQuartos.innerHTML += `
                <tr>
                    <td><strong>${quarto.id}</strong></td>
                    <td>${quarto.tipo}</td>
                    <td>
                        <button class="btn-view" onclick="verReservas(${quarto.id}, '${quarto.tipo}')">👁️ Ver Reservas</button>
                        <button class="btn-delete" onclick="excluirQuarto(${quarto.id})">🗑️ Excluir</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Erro ao listar quartos:", err);
    }
}

// Captura o submit do formulário de cadastro de quartos
const formQuarto = document.getElementById("formQuarto");
if (formQuarto) {
    formQuarto.addEventListener("submit", async (e) => {
        e.preventDefault();

        const novoQuarto = {
            id: Number(document.getElementById("numero").value),
            tipo: document.getElementById("tipo").value
        };

        try {
            const res = await fetch(`${API_BASE}/quartos/cadastrar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novoQuarto)
            });

            if (res.ok) {
                window.location.href = "index.html";
            } else {
                alert("Erro ao cadastrar quarto. Verifique se o número já existe.");
            }
        } catch (err) {
            console.error("Erro na requisição:", err);
        }
    });
}

async function excluirQuarto(id) {
    if (confirm(`Deseja realmente excluir o quarto ${id}?`)) {
        try {
            await fetch(`${API_BASE}/quartos/excluir/${id}`, { method: "DELETE" });
            listarQuartos();
        } catch (err) {
            console.error("Erro ao excluir quarto:", err);
        }
    }
}

// Guarda o contexto do quarto selecionado e redireciona para a tela de reservas
function verReservas(id, tipo) {
    localStorage.setItem("quartoSelecionadoId", id);
    localStorage.setItem("quartoSelecionadoTipo", tipo);
    window.location.href = "reservaQuarto.html";
}


// ==========================================
// LÓGICA DE RESERVAS
// ==========================================

function inicializarTelaReservas() {
    const quartoId = localStorage.getItem("quartoSelecionadoId");
    const quartoTipo = localStorage.getItem("quartoSelecionadoTipo");

    if (!quartoId) {
        alert("Nenhum quarto foi selecionado!");
        window.location.href = "index.html";
        return;
    }

    const label = document.getElementById("labelQuartoSelecionado");
    if (label) label.innerText = `Quarto: ${quartoId} - ${quartoTipo}`;

    listarReservas(quartoId);
}

async function listarReservas(quartoId) {
    const listaReservas = document.getElementById("listaReservas");
    if (!listaReservas) return;

    try {
        // Alinhado com a sua rota GET estruturada no backend: /buscar/:id
        const res = await fetch(`${API_BASE}/quartos/buscar/${quartoId}`);
        const quartoComReservas = await res.json();
        
        listaReservas.innerHTML = "";

        // Verifica se existem reservas vinculadas ao objeto retornado do banco
        if (quartoComReservas.reservas && quartoComReservas.reservas.length > 0) {
            quartoComReservas.reservas.forEach(reserva => {
                // Formatação simples de data para visualização (AAAA-MM-DD para DD/MM/AAAA)
                const dataE = reserva.entrada.split('T')[0].split('-').reverse().join('/');
                const dataS = reserva.saida.split('T')[0].split('-').reverse().join('/');

                listaReservas.innerHTML += `
                    <tr>
                        <td>${reserva.id}</td>
                        <td>${reserva.hospede}</td>
                        <td>${dataE}</td>
                        <td>${dataS}</td>
                        <td>
                            <button class="btn-delete" onclick="excluirReserva(${reserva.id})">🗑️ Excluir</button>
                        </td>
                    </tr>
                `;
            });
        } else {
            listaReservas.innerHTML = `<tr><td colspan="5">Nenhuma reserva encontrada para este quarto.</td></tr>`;
        }
    } catch (err) {
        console.error("Erro ao listar reservas:", err);
    }
}

// Captura o submit do formulário de cadastro de reservas
const formReserva = document.getElementById("formReserva");
if (formReserva) {
    formReserva.addEventListener("submit", async (e) => {
        e.preventDefault();

        const quartoId = Number(localStorage.getItem("quartoSelecionadoId"));
        const novaReserva = {
            hospede: document.getElementById("nomeHospede").value,
            entrada: new Date(document.getElementById("dataEntrada").value).toISOString(),
            saida: new Date(document.getElementById("dataSaida").value).toISOString(),
            quartoId: quartoId
        };

        try {
            // Altera para a rota correta do seu controlador de reservas
            const res = await fetch(`${API_BASE}/reservas/cadastrar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novaReserva)
            });

            if (res.ok) {
                formReserva.reset();
                listarReservas(quartoId);
            } else {
                alert("Erro ao cadastrar a reserva.");
            }
        } catch (err) {
            console.error("Erro ao enviar reserva:", err);
        }
    });
}

async function excluirReserva(id) {
    if (confirm("Deseja realmente excluir esta reserva?")) {
        try {
            // Altera para o endpoint correspondente do seu router de exclusão de reservas
            await fetch(`${API_BASE}/reservas/excluir/${id}`, { method: "DELETE" });
            const quartoId = localStorage.getItem("quartoSelecionadoId");
            listarReservas(quartoId);
        } catch (err) {
            console.error("Erro ao excluir reserva:", err);
        }
    }
}