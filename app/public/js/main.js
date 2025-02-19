const { innerWidth } = window;

const screen = document.querySelector('.screen');

const cadastro_reserva = document.querySelector('.cadastro-reserva');

const menu = document.querySelector('.menu');
const open_menu = document.querySelector('.open-menu');
const close_menu = document.querySelector('.close-menu');

const modal = document.querySelector('.modal');
const open_modal = document.querySelector('.open-modal');
const close_modal = document.querySelector('.close-modal');

function fn_open_menu() {
    menu.style.right = 0;
    screen.style.opacity = 1;
    screen.style.visibility = 'visible';
}

function fn_close_menu() {
    menu.style.right = '-250px';
    screen.style.opacity = 0;
    screen.style.visibility = 'hidden';
}

function fn_open_modal() {

    screen.style.opacity = 1;
    screen.style.visibility = 'visible';

    modal.style.cssText = `
        opacity: 1;
        visibility: visible;
        top: ${innerWidth <= 900 ? 0 : '50%'};
        margin-top: -${innerWidth <= 900 ? 0 : (modal.offsetHeight / 2)}px;
    `
}

function fn_close_modal() {
    screen.style.opacity = 0;
    screen.style.visibility = 'hidden';
    modal.style.top = '60%';
    modal.style.opacity = 0;
    modal.style.visibility = 'hidden';
}

open_menu.addEventListener('click', fn_open_menu)
open_modal.addEventListener('click', fn_open_modal)

close_menu.addEventListener('click', fn_close_menu)
close_modal.addEventListener('click', fn_close_modal)

cadastro_reserva.addEventListener('submit', fn_cadastro_reserva);

screen.addEventListener('click', () => {
    fn_close_menu();
    fn_close_modal();
})

function fn_cadastro_reserva(e) {

    e.preventDefault();

    let data = {};

    for (let i = 0; i < e.target.elements.length; i++) {
        let name = e.target.elements[i].name;
        let value = e.target.elements[i].value;

        if (name)
            data[name] = value;

    }

    fetch('http://localhost:3000/cadastrar', {
        method: 'POST',
        headers: { 'Content-type': 'application/json;charset=UTF-8' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(json => {
            console.log(json)
            close_modal();
        })
        .catch(err => console.log(err));
}



