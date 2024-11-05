let vehiculos  = []; 

function cargarDatos() {
    document.getElementById("spinner").style.display = "block"; 
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://examenesutn.vercel.app/api/VehiculoAutoCamion", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            document.getElementById("spinner").style.display = "none"; 
            if (xhr.status == 200) {
                vehiculos = JSON.parse(xhr.responseText); 
                mostrarDatos(vehiculos);
            } else {
                alert("No se pudo cargar la información.");
            }
        }
    };
    xhr.send();
}

function mostrarDatos(vehiculos) {
    var cuerpoTabla = document.getElementById('cuerpo-tabla');
    cuerpoTabla.innerHTML = '';
    vehiculos.forEach(function(vehiculo) {
        var fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${vehiculo.id}</td>
            <td>${vehiculo.modelo}</td>
            <td>${vehiculo.anoFabricacion}</td>
            <td>${vehiculo.velMax}</td>
            <td>${vehiculo.cantidadPuertas !== undefined ? vehiculo.cantidadPuertas : 'N/A'}</td>
            <td>${vehiculo.asientos !== undefined ? vehiculo.asientos : 'N/A'}</td>
            <td>${vehiculo.carga !== undefined ? vehiculo.carga : 'N/A'}</td>
            <td>${vehiculo.autonomia !== undefined ? vehiculo.autonomia : 'N/A'}</td>
            <td><button onclick="modificar(${vehiculo.id})">Modificar</button></td>
            <td><button onclick="iniciarEliminacion(${vehiculo.id})">Eliminar</button></td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

function abrirFormulario() {
    document.getElementById("formulario-abm").style.display = "block";
    document.getElementById("formulario-lista").style.display = "none";
    document.getElementById("accion-titulo").innerText = "Alta";
    document.getElementById('agregar').style.display = "none"

    document.getElementById('modelo').value = '';
    document.getElementById('anoFabricacion').value = '';
    document.getElementById('velMax').value = '';
    document.getElementById('cantidadPuertas').value = '';
    document.getElementById('asientos').value = '';
    document.getElementById('carga').value = '';
    document.getElementById('autonomia').value = '';

    document.getElementById("auto-fields").style.display = "none";
    document.getElementById("camion-fields").style.display = "none";

    document.getElementById('aceptar').onclick = () => guardarElemento();

}

function cerrarFormulario() {
        document.getElementById("formulario-abm").style.display = "none"; 
        document.getElementById("formulario-lista").style.display = "block"; 
        console.log("uso");
}



function mostrarCamposSegunTipo() {
    const tipo = document.getElementById("tipo").value;
    document.getElementById("auto-fields").style.display = "none";
    document.getElementById("camion-fields").style.display = "none";

    if (tipo === "auto") {
        document.getElementById("auto-fields").style.display = "block";
    } else if (tipo === "camion") {
        document.getElementById("camion-fields").style.display = "block";
    }
}

function guardarElemento() {
    document.getElementById("spinner").style.display = "block";
    const modelo = document.getElementById('modelo').value;
    const anoFabricacion = parseInt(document.getElementById('anoFabricacion').value);
    const velMax = parseInt(document.getElementById('velMax').value);
    const tipo = document.getElementById('tipo').value;
    console.log(tipo);

    let nuevoVehiculo = {
        modelo: modelo,
        anoFabricacion: anoFabricacion,
        velMax: velMax
    };

    if (tipo === 'auto') {
        nuevoVehiculo.cantidadPuertas = parseInt(document.getElementById('cantidadPuertas').value);
        nuevoVehiculo.asientos = parseInt(document.getElementById('asientos').value);
    } else if (tipo === 'camion') {
        nuevoVehiculo.carga = parseInt(document.getElementById('carga').value);
        nuevoVehiculo.autonomia = parseInt(document.getElementById('autonomia').value);
    }
    console.log(tipo);
    if (tipo === "auto" && validarAuto(nuevoVehiculo)){
        return;
    }
    if (tipo === "camion" && validarCamion(nuevoVehiculo)){
        return;
    }

    if (!validarAuto(nuevoVehiculo) || !validarCamion(nuevoVehiculo)){
        fetch("https://examenesutn.vercel.app/api/VehiculoAutoCamion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoVehiculo)
        })
        .then(response => {
            if (response.ok) {
                return response.json();  
            } else {
                throw new Error("No se pudo realizar la operación");
            }
        })
        .then(data => {
            nuevoVehiculo.id = data.id; 
            vehiculos.push(nuevoVehiculo); 
            mostrarDatos(vehiculos);   
            document.getElementById("spinner").style.display = "none";
            cerrarFormulario(); 
            alert("Agregado exitosamente")
        })
        .catch(error => {
            alert(error.message);
        });
    }
    
}

function modificar(id) {
    document.getElementById('formulario-lista').style.display = 'none';
    document.getElementById('formulario-abm').style.display = 'block';

    document.getElementById('accion-titulo').textContent = 'Modificar';

    const vehiculo = vehiculos.find(v => v.id === id);

    if (vehiculo) {
        document.getElementById('modelo').value = vehiculo.modelo;
        document.getElementById('anoFabricacion').value = vehiculo.anoFabricacion;
        document.getElementById('velMax').value = vehiculo.velMax;
        
        
        const cantidadPuertas = vehiculo.cantidadPuertas
        const asientos = vehiculo.asientos
        const carga = vehiculo.carga
        const autonomia = vehiculo.autonomia
        if (cantidadPuertas && asientos) {
            document.getElementById('tipo').value = "auto";
            document.getElementById("auto-fields").style.display = "block";
            document.getElementById('cantidadPuertas').value = vehiculo.cantidadPuertas;
            document.getElementById('asientos').value = vehiculo.asientos;
        } else if (carga && autonomia) {
            document.getElementById('tipo').value = "camion";
            document.getElementById("camion-fields").style.display = "block";
            document.getElementById('carga').value = vehiculo.carga;
            document.getElementById('autonomia').value = vehiculo.autonomia;
        }


        document.getElementById('aceptar').onclick = () => guardarModificacionVehiculo(vehiculo.id);
    }
}
async function guardarModificacionVehiculo(id) {
    document.getElementById('spinner').style.display = 'block';

    const modelo = document.getElementById('modelo').value;
    const anoFabricacion = parseInt(document.getElementById('anoFabricacion').value);
    const velMax = parseFloat(document.getElementById('velMax').value);
    const tipo = document.getElementById('tipo').value;

    let vehiculoModificado = { id, modelo, anoFabricacion, velMax };

    if (tipo === 'auto') {
        vehiculoModificado.cantidadPuertas = parseInt(document.getElementById('cantidadPuertas').value);
        vehiculoModificado.asientos = parseInt(document.getElementById('asientos').value);
    } else if (tipo === 'camion') {
        vehiculoModificado.carga = parseFloat(document.getElementById('carga').value);
        vehiculoModificado.autonomia = parseFloat(document.getElementById('autonomia').value);
    }
    document.getElementById("spinner").style.display = "block"; 
    try {
        const response = await fetch(`https://examenesutn.vercel.app/api/VehiculoAutoCamion`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vehiculoModificado) 
        });

        if (response.status === 200) {
            const index = vehiculos.findIndex(v => v.id === id);
            vehiculos[index] = vehiculoModificado; 
            mostrarDatos(vehiculos); 
            cerrarFormulario();
            document.getElementById('spinner').style.display = 'none';
            alert("Modificación exitosa.");
        } else {
            alert("No se pudo realizar la modificación.");
            cerrarFormulario();
            document.getElementById('spinner').style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Ocurrió un error al realizar la modificación.");
        cerrarFormulario();
        document.getElementById('spinner').style.display = 'none';
    }
}

function iniciarEliminacion(id) {
    document.getElementById("formulario-lista").style.display = "none";
    
    const formularioABM = document.getElementById("formulario-abm");
    formularioABM.style.display = "block";
    formularioABM.style.margin = "auto";  
    
    document.getElementById("accion-titulo").innerText = "Eliminar";
    document.getElementById("btnConfirmarEliminacion").style.display = "inline";
    
    const vehiculo = vehiculos.find(p => p.id === id);

    if (vehiculo) {
        document.getElementById('modelo').value = vehiculo.modelo;
        document.getElementById('anoFabricacion').value = vehiculo.anoFabricacion;
        document.getElementById('velMax').value = vehiculo.velMax;
        document.getElementById('btnConfirmarEliminacion').onclick = () => confirmarEliminacion(vehiculo.id);
        
        const cantidadPuertas = vehiculo.cantidadPuertas
        const asientos = vehiculo.asientos
        const carga = vehiculo.carga
        const autonomia = vehiculo.autonomia
        if (cantidadPuertas && asientos) {
            document.getElementById('tipo').value = "auto";
            document.getElementById("auto-fields").style.display = "block";
            document.getElementById('cantidadPuertas').value = vehiculo.cantidadPuertas;
            document.getElementById('asientos').value = vehiculo.asientos;
        } else if (carga && autonomia) {
            document.getElementById('tipo').value = "camion";
            document.getElementById("cliente-fields").style.display = "block";
            document.getElementById('carga').value = vehiculo.carga;
            document.getElementById('autonomia').value = vehiculo.autonomia;
        }
    }
}

async function confirmarEliminacion(id) {
    document.getElementById("spinner").style.display = "block";

    try {
        const respuesta = await fetch('https://examenesutn.vercel.app/api/VehiculoAutoCamion', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id })
        });

        if (respuesta.ok) {
            vehiculos = vehiculos.filter(v => v.id !== id);
            mostrarDatos(vehiculos);
            cerrarFormulario();
            alert("Vehículo eliminado con éxito.");
        } else {
            alert("No se pudo realizar la operación.");
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Error en la solicitud. Por favor, intente de nuevo.");
    } finally {
        document.getElementById("spinner").style.display = "none";
    }
}

cargarDatos();


function validarAuto(auto) {
    let entrar;
    if (!auto.modelo ) {
        entrar = true;
        alert("Modelo debe ser un texto y no puede estar vacío.");
    }
    if (!auto.anoFabricacion ||  auto.anoFabricacion < 1886 || auto.anoFabricacion > new Date().getFullYear()) {
        alert("Año de fabricación debe ser un número válido entre 1886 y el año actual.");
        entrar = true;
    }
    if (!auto.velMax ||  auto.velMax <= 0) {
        alert("La velocidad máxima debe ser un número mayor que cero.");
        entrar = true;
    }
    if (!auto.cantidadPuertas ||  auto.cantidadPuertas <= 0) {
        alert("La cantidad de puertas debe ser un número mayor que cero.");
        entrar = true;
    }
    if (!auto.asientos ||  auto.asientos <= 0) {
        alert("La cantidad de asientos debe ser un número mayor que cero.");
        entrar = true;
    }
    return entrar; 
}
function validarCamion(camion) {
    let entrar;
    if (!camion.modelo ) {
        entrar = true;
        alert("Modelo debe ser un texto y no puede estar vacío.");
    }
    if (!camion.anoFabricacion ||  camion.anoFabricacion < 1886 || camion.anoFabricacion > new Date().getFullYear()) {
        alert("Año de fabricación debe ser un número válido entre 1886 y el año actual.");
        entrar = true;
    }
    if (!camion.velMax ||  camion.velMax <= 0) {
        alert("La velocidad máxima debe ser un número mayor que cero.");
        entrar = true;
    }
    if (!camion.carga ||  camion.carga < 0) {
        alert("La carga debe ser un número positivo.");
        entrar = true;
    }
    if (!camion.autonomia ||  camion.autonomia <= 0) {
        alert("La autonomía debe ser un número mayor que cero.");
        entrar = true;
    }
    return entrar;
}


window.abrirFormulario = abrirFormulario;
window.mostrarCamposSegunTipo = mostrarCamposSegunTipo;
window.cerrarFormulario = cerrarFormulario;
window.guardarElemento = guardarElemento;
window.modificar = modificar;
window.guardarModificacionVehiculo = guardarModificacionVehiculo;
window.iniciarEliminacion = iniciarEliminacion;
window.confirmarEliminacion = confirmarEliminacion;
