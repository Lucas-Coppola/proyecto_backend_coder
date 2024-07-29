console.log('funciona');

document.getElementById('recoverPasswordForm').addEventListener('submit', function (e) {

    const form = e.target;
    const formData = new FormData(form);

    console.log('Form data:', Object.fromEntries(formData.entries()));

    fetch(form.action, {
        method: 'POST',
        body: new URLSearchParams(formData),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log(response);

        if(response.status === 200) alert('Se ha actualizado la contraseña correctamente, redirigiendo');
        if(response.status === 500) alert('Link expirado, vuelva a solicitar email de recuperación');

        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
    })
    .catch(error => console.error('Error:', error));
});
