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
        top: ${innerWidth <= 900 ? 0 : '50%'};
        margin-top: -${innerWidth <= 900 ? 0 : (modal.offsetHeight / 2)}px;
    `
    const acessar = document.querySelector('.acessar');

    // acessar.addEventListener('submit', fn_acessar);
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