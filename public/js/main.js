const { innerWidth } = window;

const screen = document.querySelector('.screen');

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

open_menu.addEventListener('click', fn_open_menu)
open_modal.addEventListener('click', fn_open_modal)

close_menu.addEventListener('click', fn_close_menu)
close_modal.addEventListener('click', fn_close_modal)

screen.addEventListener('click', () => {
    fn_close_menu();
    fn_close_modal();
})

document.querySelector('.logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    location.href = '/'
})