import {
    db,
    storage,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "./firebase.js";

let tareas = [];

window.guardarTarea = guardarTarea;
window.abrirDetalle = abrirDetalle;
window.guardarEdicion = guardarEdicion;
window.agregarComentario = agregarComentario;
window.confirmarEliminar = confirmarEliminar;
window.eliminarTarea = eliminarTarea;
window.exportarExcel = exportarExcel;
window.exportarPDF = exportarPDF;
window.exportarBackup = exportarBackup;
window.toggleDarkMode = toggleDarkMode;

async function cargarTareas() {

    tareas = [];

    const snapshot =
        await getDocs(
            collection(db, "tareas")
        );

    snapshot.forEach(docSnap => {

        tareas.push({

            firebaseId: docSnap.id,

            ...docSnap.data()
        });

    });

    render();
}

async function subirAdjuntos() {

    const input =
        document.getElementById("archivo");

    const archivos = [];

    if (!input.files.length)
        return archivos;

    for (const file of input.files) {

        const nombreUnico =
            Date.now() +
            "_" +
            file.name;

        const storageRef =
            ref(
                storage,
                "adjuntos/" + nombreUnico
            );

        await uploadBytes(
            storageRef,
            file
        );

        const url =
            await getDownloadURL(
                storageRef
            );

        archivos.push({

            nombre: file.name,

            url,

            ruta:
                "adjuntos/" +
                nombreUnico
        });
    }

    return archivos;
}

async function guardarTarea() {

    const adjuntos =
        await subirAdjuntos();

    const tarea = {

        id: Date.now(),

        fechaCreacion:
            new Date()
                .toLocaleString(),

        fijada:
            document.getElementById(
                "fijada"
            ).checked,

        categoria:
            document.getElementById(
                "categoria"
            ).value,

        esperandoRespuesta:
            document.getElementById(
                "esperandoRespuesta"
            ).value,

        proveedor:
            document.getElementById(
                "proveedor"
            ).value,

        pedidoPor:
            document.getElementById(
                "pedidoPor"
            ).value,

        descripcion:
            document.getElementById(
                "descripcion"
            ).value,

        prioridad:
            document.getElementById(
                "prioridad"
            ).value,

        fechaInicio:
            document.getElementById(
                "fechaInicio"
            ).value,

        fechaNecesidad:
            document.getElementById(
                "fechaNecesidad"
            ).value,

        fechaCumplimiento: "",

        estado: "Pendiente",

        comentarios: [],

        recurrente:
            document.getElementById(
                "recurrente"
            ).value,

        adjuntos
    };

    await addDoc(
        collection(
            db,
            "tareas"
        ),
        tarea
    );

    bootstrap.Modal.getInstance(
        document.getElementById(
            "modalNueva"
        )
    )?.hide();

    limpiar();

    await cargarTareas();
}

function limpiar() {

    [
        "proveedor",
        "pedidoPor",
        "descripcion",
        "fechaInicio",
        "fechaNecesidad"
    ].forEach(id => {

        const el =
            document.getElementById(id);

        if (el)
            el.value = "";

    });

    document.getElementById(
        "archivo"
    ).value = "";

    document.getElementById(
        "fijada"
    ).checked = false;
}

function calcularDias(fecha) {

    if (!fecha)
        return "-";

    const inicio =
        new Date(fecha);

    const hoy =
        new Date();

    return Math.floor(

        (hoy - inicio)

        /

        (1000 * 60 * 60 * 24)

    );
}

function render() {

    const tabla =
        document.getElementById(
            "tablaTareas"
        );

    if (!tabla)
        return;

    tabla.innerHTML = "";

    const buscar =
        document.getElementById(
            "buscar"
        )?.value
            .toLowerCase() || "";

    const filtroEstado =
        document.getElementById(
            "filtroEstado"
        )?.value || "";

    const filtroCategoria =
        document.getElementById(
            "filtroCategoria"
        )?.value || "";

    const filtroPrioridad =
        document.getElementById(
            "filtroPrioridad"
        )?.value || "";

    let pendientes = 0;
    let proceso = 0;
    let vencidas = 0;
    let finalizadas = 0;

    tareas.sort(
        (a, b) =>
            (b.fijada ? 1 : 0)
            -
            (a.fijada ? 1 : 0)
    );

    tareas.forEach(t => {

        const textoBusqueda = `

            ${t.descripcion || ""}
            ${t.pedidoPor || ""}
            ${t.proveedor || ""}
            ${t.categoria || ""}

        `.toLowerCase();

        if (
            buscar &&
            !textoBusqueda.includes(
                buscar
            )
        ) {
            return;
        }

        if (
            filtroEstado &&
            t.estado !== filtroEstado
        ) {
            return;
        }

        if (
            filtroCategoria &&
            t.categoria !== filtroCategoria
        ) {
            return;
        }

        if (
            filtroPrioridad &&
            t.prioridad !== filtroPrioridad
        ) {
            return;
        }

        if (
            t.estado ===
            "Pendiente"
        ) {
            pendientes++;
        }

        if (
            t.estado ===
            "En proceso"
        ) {
            proceso++;
        }

        if (
            t.estado ===
            "Finalizada"
        ) {
            finalizadas++;
        }

        let claseFecha = "";

        if (
            t.fechaNecesidad &&
            t.estado !== "Finalizada"
        ) {

            const hoy =
                new Date();

            const necesidad =
                new Date(
                    t.fechaNecesidad
                );

            const diff =
                Math.ceil(
                    (
                        necesidad - hoy
                    )
                    /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                );

            if (diff < 0) {

                claseFecha =
                    "vencida";

                vencidas++;
            }

            if (diff === 0) {

                claseFecha =
                    "vence-hoy";
            }
        }

        tabla.innerHTML += `

        <tr
            class="
                prioridad-${(
                    t.prioridad || ""
                ).toLowerCase()}
                ${claseFecha}
            "
        >

            <td>

                ${
                    t.fijada
                    ? "📌"
                    : ""
                }

                ${t.id}

            </td>

            <td>

                <span
                    class="badge bg-secondary"
                >

                    ${t.estado}

                </span>

            </td>

            <td>

                ${t.prioridad}

            </td>

            <td>

                ${t.categoria || "-"}

            </td>

            <td>

                ${
                    t.esperandoRespuesta
                    || "-"
                }

            </td>

            <td>

                ${
                    t.proveedor
                    || "-"
                }

            </td>

            <td>

                ${
                    t.pedidoPor
                    || "-"
                }

            </td>

            <td>

                ${t.descripcion}

            </td>

            <td>

                ${
                    t.fechaNecesidad
                    || "-"
                }

            </td>

            <td>

                ${calcularDias(
                    t.fechaInicio
                )}

            </td>

            <td>

                <button
                    class="btn btn-sm btn-primary"
                    onclick="
                        abrirDetalle(
                            ${t.id}
                        )
                    "
                >

                    Ver

                </button>

            </td>

        </tr>
        `;
    });

    document.getElementById(
        "cantPendientes"
    ).innerText =
        pendientes;

    document.getElementById(
        "cantProceso"
    ).innerText =
        proceso;

    document.getElementById(
        "cantVencidas"
    ).innerText =
        vencidas;

    document.getElementById(
        "cantFinalizadas"
    ).innerText =
        finalizadas;
}

function abrirDetalle(id) {

    const t =
        tareas.find(
            x => x.id === id
        );

    if (!t)
        return;

    let comentariosHTML = "";

    (
        t.comentarios || []
    ).forEach(c => {

        comentariosHTML += `

        <div
            class="comment"
        >

            <small>

                ${c.fecha}

            </small>

            <div>

                ${c.texto}

            </div>

        </div>

        `;
    });

    let adjuntosHTML = "";

    (
        t.adjuntos || []
    ).forEach(a => {

        adjuntosHTML += `

        <a
            href="${a.url}"
            target="_blank"
            class="
                btn
                btn-outline-secondary
                btn-sm
                me-2
                mb-2
            "
        >

            📎 ${a.nombre}

        </a>

        `;
    });

    document.getElementById(
        "detalleContenido"
    ).innerHTML = `<div class="row">

    <div class="col-md-6">

        <p>
            <b>Creada:</b>
            ${t.fechaCreacion || "-"}
        </p>

        <p>
            <b>Estado:</b>
            ${t.estado}
        </p>

        <p>
            <b>Fecha cumplimiento:</b>
            ${t.fechaCumplimiento || "-"}
        </p>

        <p>
            <b>Categoría:</b>
            ${t.categoria || "-"}
        </p>

        <p>
            <b>Proveedor:</b>
            ${t.proveedor || "-"}
        </p>

        <p>
            <b>Pedido por:</b>
            ${t.pedidoPor || "-"}
        </p>

        <p>
            <b>Descripción:</b>
            ${t.descripcion || "-"}
        </p>

        <label>Estado</label>

        <select
            id="editEstado"
            class="form-select mb-3">

            <option ${t.estado === "Pendiente" ? "selected" : ""}>
                Pendiente
            </option>

            <option ${t.estado === "En proceso" ? "selected" : ""}>
                En proceso
            </option>

            <option ${t.estado === "Esperando proveedor" ? "selected" : ""}>
                Esperando proveedor
            </option>

            <option ${t.estado === "Finalizada" ? "selected" : ""}>
                Finalizada
            </option>

        </select>

        <div class="form-check mb-3">

            <input
                type="checkbox"
                class="form-check-input"
                id="editFijada"
                ${t.fijada ? "checked" : ""}>

            <label class="form-check-label">
                Fijar tarea
            </label>

        </div>

        <button
            class="btn btn-success mb-3"
            onclick="guardarEdicion(${t.id})">

            Guardar cambios

        </button>

        <hr>

        <h5>Adjuntos</h5>

        ${adjuntosHTML || "Sin adjuntos"}

        <hr>

        <button
            class="btn btn-danger"
            onclick="confirmarEliminar(${t.id})">

            Eliminar

        </button>

    </div>

    <div class="col-md-6">

        <h5>Comentarios</h5>

        ${comentariosHTML}

        <textarea
            id="nuevoComentario"
            rows="3"
            class="form-control">
        </textarea>

        <button
            class="btn btn-primary mt-2"
            onclick="agregarComentario(${t.id})">

            Agregar comentario

        </button>

    </div>

</div>
`;

    new bootstrap.Modal(
        document.getElementById(
            "modalDetalle"
        )
    ).show();
}

async function guardarEdicion(id) {

    const tarea =
        tareas.find(
            t => t.id === id
        );

    if (!tarea)
        return;

    const nuevoEstado =
        document.getElementById(
            "editEstado"
        ).value;

    if (
        nuevoEstado === "Finalizada"
        &&
        !tarea.fechaCumplimiento
    ) {

        tarea.fechaCumplimiento =
            new Date()
                .toLocaleString();
    }

    tarea.estado =
        nuevoEstado;

    tarea.fijada =
        document.getElementById(
            "editFijada"
        ).checked;

    await updateDoc(

        doc(
            db,
            "tareas",
            tarea.firebaseId
        ),

        {
            estado:
                tarea.estado,

            fijada:
                tarea.fijada,

            fechaCumplimiento:
                tarea.fechaCumplimiento
        }

    );

    await cargarTareas();

    abrirDetalle(id);
}

async function agregarComentario(id) {

    const texto =
        document.getElementById(
            "nuevoComentario"
        ).value.trim();

    if (!texto)
        return;

    const tarea =
        tareas.find(
            t => t.id === id
        );

    tarea.comentarios.push({

        fecha:
            new Date()
                .toLocaleString(),

        texto
    });

    await updateDoc(

        doc(
            db,
            "tareas",
            tarea.firebaseId
        ),

        {
            comentarios:
                tarea.comentarios
        }

    );

    await cargarTareas();

    abrirDetalle(id);
}

function confirmarEliminar(id) {

    if (
        !confirm(
            "¿Eliminar tarea?"
        )
    ) {
        return;
    }

    eliminarTarea(id);
}

async function eliminarTarea(id) {

    const tarea =
        tareas.find(
            t => t.id === id
        );

    if (!tarea)
        return;

    if (tarea.adjuntos) {

        for (
            const archivo
            of tarea.adjuntos
        ) {

            try {

                await deleteObject(

                    ref(
                        storage,
                        archivo.ruta
                    )

                );

            } catch {

            }
        }
    }

    await deleteDoc(

        doc(
            db,
            "tareas",
            tarea.firebaseId
        )

    );

    bootstrap.Modal.getInstance(
        document.getElementById(
            "modalDetalle"
        )
    )?.hide();

    await cargarTareas();
}

function exportarBackup() {

    const blob =
        new Blob(

            [
                JSON.stringify(
                    tareas,
                    null,
                    2
                )
            ],

            {
                type:
                    "application/json"
            }

        );

    const a =
        document.createElement("a");

    a.href =
        URL.createObjectURL(
            blob
        );

    a.download =
        "backup_tareas.json";

    a.click();
}

function exportarPDF() {

    window.print();
}

function exportarExcel() {

    const datos =
        tareas.map(t => ({

            ID: t.id,

            Estado: t.estado,

            Prioridad:
                t.prioridad,

            Categoria:
                t.categoria,

            Proveedor:
                t.proveedor,

            PedidoPor:
                t.pedidoPor,

            Descripcion:
                t.descripcion,

            Inicio:
                t.fechaInicio,

            Necesidad:
                t.fechaNecesidad,

            Cumplimiento:
                t.fechaCumplimiento

        }));

    const ws =
        XLSX.utils
            .json_to_sheet(
                datos
            );

    const wb =
        XLSX.utils
            .book_new();

    XLSX.utils
        .book_append_sheet(
            wb,
            ws,
            "Tareas"
        );

    XLSX.writeFile(
        wb,
        "tareas.xlsx"
    );
}

function toggleDarkMode() {

    document.body
        .classList
        .toggle("dark");
}

document
.getElementById("buscar")
?.addEventListener(
    "keyup",
    render
);

document
.getElementById("filtroEstado")
?.addEventListener(
    "change",
    render
);

document
.getElementById("filtroCategoria")
?.addEventListener(
    "change",
    render
);

document
.getElementById("filtroPrioridad")
?.addEventListener(
    "change",
    render
);

window.guardarTarea = guardarTarea;
window.abrirDetalle = abrirDetalle;
window.guardarEdicion = guardarEdicion;
window.agregarComentario = agregarComentario;
window.confirmarEliminar = confirmarEliminar;
window.eliminarTarea = eliminarTarea;

window.exportarExcel = exportarExcel;
window.exportarPDF = exportarPDF;
window.exportarBackup = exportarBackup;
window.toggleDarkMode = toggleDarkMode;

cargarTareas();