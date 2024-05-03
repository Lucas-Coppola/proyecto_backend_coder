const socket = io();

const btnEnviar = document.getElementById('btnEnviar');

let usuario

Swal.fire({
    title: 'Identificate',
    input: 'text',
    text: 'Elegí un nombre para escribir en el chat',
    inputValidator: value => {
        return !value && 'Necesitas escribir un nombre para escribir en el chat'
    },
    allowOutsideClick: false
})
.then(result => {
    usuario = result.value
    console.log(usuario);
});

btnEnviar.addEventListener('click', e => {
    e.preventDefault();

    const inputMensajes = document.getElementById('mensajes');

    if (inputMensajes.value === '') return alert('No se puede enviar un mensaje vacío');

    socket.emit('mensaje_enviado', {usuario, mensaje: inputMensajes.value});
    inputMensajes.value = '';
});

socket.on('mensajes_enviados', data => {
    console.log(data);

    const mensajesEnviados = document.getElementById('mensajesLogs');

    let mensajes = ''
    data.forEach(m => {
        mensajes += ` <br><li> ${m.user}: ${m.message} </li><br> `
    });

    mensajesEnviados.innerHTML = mensajes;
});