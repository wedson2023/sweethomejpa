const token = localStorage.getItem('token');

if (token) location.href = '/app/reservas'

const screen = document.querySelector('.screen');

const modal = document.querySelector('.modal');
const open_modal = document.querySelector('.open-modal');
const close_modal = document.querySelector('.close-modal');

function fn_open_modal() {

    screen.style.opacity = 1;
    screen.style.visibility = 'visible';

    modal.style.cssText = `
        opacity: 1;
        visibility: visible;
        top: 50%;
        margin-top: -${modal.offsetHeight / 2}px;
    `
    const acessar = document.querySelector('form');

    acessar.addEventListener('submit', fn_acessar);
}

function fn_close_modal() {
    screen.style.opacity = 0;
    screen.style.visibility = 'hidden';
    modal.style.top = '60%';
    modal.style.opacity = 0;
    modal.style.visibility = 'hidden';
}

open_modal.addEventListener('click', fn_open_modal)
close_modal.addEventListener('click', fn_close_modal)

screen.addEventListener('click', () => {
    fn_close_modal();
})

async function fn_acessar(e) {

    e.preventDefault();

    let data = {
        login: document.querySelector('input[name=login]').value,
        password: document.querySelector('input[name=password').value,
    }

    try {

        data = await fetch(`${location.origin}/api/auth`, {
            method: 'POST',
            headers: { 'Content-type': 'application/json;charset=UTF-8' },
            body: JSON.stringify(data)
        })

        data = await data.json();

        if (data.message === 'Usuário não autorizado.') {
            toast(data.message)
            return false;
        }

        toast(data.message)

        localStorage.setItem('token', data.token);

        location.href = '/app/reservas';

        fn_close_modal();

    } catch (err) {
        toast(err.message)
    }
}