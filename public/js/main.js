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

function fn_open_modal() {

    screen.style.opacity = 1;
    screen.style.visibility = 'visible';

    modal.style.cssText = `
        opacity: 1;
        visibility: visible;
        top: ${innerWidth <= 900 ? 0 : '50%'};
        margin-top: -${innerWidth <= 900 ? 0 : (modal.offsetHeight / 2)}px;
    `

    const cadastro_reservas = document.querySelector('.cadastro-reservas');
    const cadastro_anuncios = document.querySelector('.cadastro-anuncios');

    cadastro_reservas?.addEventListener('submit', fn_cadastro_reservas);
    cadastro_anuncios?.addEventListener('submit', fn_cadastro_anuncios);
}

const pesquisar_reservas = document.querySelector('.pesquisar-reservas');

pesquisar_reservas.addEventListener('submit', fn_pesquisar_reservas);

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

screen.addEventListener('click', () => {
    fn_close_menu();
    fn_close_modal();
})

let loading = {};

document.querySelectorAll('td.limpeza').forEach(e => {

    const _id = e.getAttribute('id');

    loading[_id] = false;

    e.addEventListener('click', () => {
        if (!loading[_id]) {
            loading[_id] = true
            fn_situacao_limpeza(e, _id);
        }
    })
});

document.querySelectorAll('td span.reservas').forEach(e => {

    e.addEventListener('click', () => {

        const _id = e.getAttribute('id');

        loading[_id] = false;

        if (!loading[_id]) {

            const con = confirm('Tem certeza que deseja deletar esse registro?');

            if (con) {
                loading[_id] = true
                fn_remover_reservas(_id);
                loading[_id] = false

            }

        }
    })
});

async function fn_pesquisar_reservas(e) {

    e.preventDefault();

    let data = {};

    for (let i = 0; i < e.target.elements.length; i++) {
        let name = e.target.elements[i].name;
        let value = e.target.elements[i].value;

        if (value)
            data[name] = value;
    }

    const query = new URLSearchParams(data).toString();

    try {

        data = await fetch(`http://localhost:3000/api/reservas?${query}`)

        data = await data.json();

        fn_registros_reservas(data);

    } catch (e) {
        alert(e);
    }

}

async function fn_cadastro_reservas(e) {

    e.preventDefault();

    let data = {};

    for (let i = 0; i < e.target.elements.length; i++) {
        let name = e.target.elements[i].name;
        let value = e.target.elements[i].value;

        if (name)
            data[name] = value;
    }

    try {

        data = await fetch('http://localhost:3000/cadastrar-reservas', {
            method: 'POST',
            headers: { 'Content-type': 'application/json;charset=UTF-8' },
            body: JSON.stringify(data)
        })

        data = await data.json();

        fn_registros_reservas(data);

        fn_close_modal();

    } catch (e) {
        alert(e);
    }
}

function fn_cadastro_anuncios(e) {

    e.preventDefault();

    let data = {};

    for (let i = 0; i < e.target.elements.length; i++) {
        let name = e.target.elements[i].name;
        let value = e.target.elements[i].value;

        if (name)
            data[name] = value;

    }

    fetch('http://localhost:3000/anuncios', {
        method: 'POST',
        headers: { 'Content-type': 'application/json;charset=UTF-8' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(json => {
            console.log(json)
            fn_close_modal();
        })
        .catch(err => console.log(err));
}

async function fn_remover_reservas(_id) {

    try {

        let data = await fetch(`http://localhost:3000/reservas/${_id}`, { method: 'DELETE' })
        data = await data.json();

        fn_registros_reservas(data);

        fn_close_modal();

    } catch (e) {
        alert(e);
    }
}


// function fn_remover_anuncios(e, _id) {

//     fetch(`http://localhost:3000/anuncios/${_id}`, {
//         method: 'DELETE',
//         headers: { 'Content-type': 'application/json;charset=UTF-8' }
//     })
//         .then(response => response.json())
//         .then(json => {
//             console.log(json)
//             fn_close_modal();
//         })
//         .catch(err => console.log(err));
// }

async function fn_situacao_limpeza(e, _id) {

    try {

        const limpeza = e.getAttribute('situacao');

        let data = await fetch(`http://localhost:3000/situacao-limpeza/${_id}`, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json;charset=UTF-8' },
            body: JSON.stringify({ limpeza })
        })

        data = await data.json();

        fn_registros_reservas(data);

        fn_close_modal();

    } catch (e) {
        alert(e);
    }
}

function fn_registros_reservas(data) {

    let tbody = document.querySelector('tbody');
    tbody.innerHTML = "";

    let tr, td, a;

    for (let i in data) {

        tr = document.createElement('tr');
        td = document.createElement('td');
        a = document.createElement('a');

        let span = document.createElement('span');
        span.innerText = 'delete';
        span.setAttribute('class', 'material-icons');
        span.classList.add('reservas');
        span.setAttribute('id', data[i]._id);

        td.appendChild(span);
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data[i].nome;
        tr.appendChild(td);

        td = document.createElement('td');
        a.setAttribute('href', `https://wa.me/55${data[i].telefone}`)
        a.setAttribute('target', `_blank`)
        a.setAttribute('title', `Clique para acessar o whats app do hospede.`)
        a.innerText = data[i].telefone;

        td.appendChild(a);
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data[i].acomodacao;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data[i].preco;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data[i].check_in;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data[i].check_out;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data[i].hospedes;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data[i].dias;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data[i].situacao;
        td.setAttribute('class', data[i].situacao);
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data[i].limpeza;
        td.setAttribute('id', data[i]._id);
        td.setAttribute('class', 'limpeza');
        td.setAttribute('situacao', data[i].limpeza);
        td.classList.add(data[i].limpeza);
        tr.appendChild(td);

        tbody.appendChild(tr);

    }

    document.querySelectorAll('td span.reservas').forEach(e => {

        e.addEventListener('click', () => {

            const _id = e.getAttribute('id');

            loading[_id] = false;

            if (!loading[_id]) {

                const con = confirm('Tem certeza que deseja deletar esse registro?');

                if (con) {
                    loading[_id] = true
                    fn_remover_reservas(_id);
                    loading[_id] = false

                }

            }
        })
    });

    document.querySelectorAll('td.limpeza').forEach(e => {

        const _id = e.getAttribute('id');

        loading[_id] = false;

        e.addEventListener('click', () => {
            if (!loading[_id]) {
                console.log('entrou');
                loading[_id] = true
                fn_situacao_limpeza(e, _id);
                loading[_id] = false
            }
        })
    });

}





