const message = document.querySelector('p.message');
let count = document.querySelectorAll('tbody tr').length;

if (!count) {
    message.style.cssText = `
        display: block;
    `;
}

let date = document.querySelector('input[name=inicio]');
date.value = moment().format('YYYY-MM-DD 00:00')

date = document.querySelector('input[name=fim]');
date.value = moment().add(1, 'days').format('YYYY-MM-DD 00:00')

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

    cadastro_reservas?.addEventListener('submit', fn_cadastro_reservas);

    let date = document.querySelector('input[name=check_in]');
    date.value = moment().format('YYYY-MM-DD 14:00:00')

    date = document.querySelector('input[name=check_out]');
    date.value = moment().add(1, 'days').format('YYYY-MM-DD 12:00:00')
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

        data = await fetch(`${uri}/api/reservas?${query}`, {
            headers: {
                authorization: `Bearer ${token}`,
            }
        })

        data = await data.json();

        if (data.message) {
            toast(data.message)
            return false;
        }

        fn_registros_reservas(data);

    } catch (err) {
        toast(err.message)
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

        console.log(`${uri}/api/reservas`);

        data = await fetch(`${uri}/api/reservas`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json;charset=UTF-8',
                authorization: `Bearer ${token}`,
            }
        })

        data = await data.json();

        if (data.message) {
            toast(data.message)
            return false;
        }

        toast('Cadastro realizado com SUCESSO!')

        for (let i = 0; i < e.target.elements.length; i++) {
            if (name === 'check_in') {
                e.target.elements[i].value = moment().format('YYYY-MM-DD 14:00:00');
            } else if (name === 'check_out') {
                e.target.elements[i].value = moment().add(1, 'days').format('YYYY-MM-DD 12:00:00');
            } else e.target.elements[i].value = '';
        }


        fn_registros_reservas(data);

        fn_close_modal();

    } catch (err) {
        toast(err.message)
    }
}

async function fn_remover_reservas(_id) {

    try {

        let data = await fetch(`${uri}/api/reservas/${_id}`,
            {
                method: 'DELETE',
                headers: {
                    authorization: `Bearer ${token}`,
                },
            }
        )

        data = await data.json();

        if (data.message) {
            toast(data.message)
            return false;
        }

        document.querySelector('form.pesquisar-reservas input[name=nome]').value = '';
        document.querySelector('form.pesquisar-reservas select[name=acomodacao]').value = '';

        fn_registros_reservas(data);

        fn_close_modal();

    } catch (err) {
        console.log(err);
        toast(err.message)
    }
}

async function fn_situacao_limpeza(e, _id) {

    try {

        const limpeza = e.getAttribute('situacao');

        let data = await fetch(`${uri}/api/reservas/${_id}`, {
            method: 'PUT',
            body: JSON.stringify({ limpeza }),
            headers: {
                'Content-type': 'application/json;charset=UTF-8',
                authorization: `Bearer ${token}`,
            }
        })

        data = await data.json();

        if (data.message) {
            toast(data.message)
            return false;
        }

        fn_registros_reservas(data);

        fn_close_modal();

    } catch (err) {
        toast(err.message)
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
        td.setAttribute('class', 'acomodacao');
        td.innerText = data[i].acomodacao;
        tr.appendChild(td);

        td = document.createElement('td');
        a.setAttribute('href', `https://wa.me/55${data[i].telefone}`)
        a.setAttribute('target', `_blank`)
        a.setAttribute('title', `Clique para acessar o whats app do hospede.`)
        a.innerText = data[i].telefone;

        td.appendChild(a);
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data[i].check_in;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data[i].check_out;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = parseFloat(data[i].preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = parseFloat(data[i].preco_limpeza || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

    count = document.querySelectorAll('tbody tr').length;

    if (!count) {
        message.style.cssText = `
            display: block;
        `;
    } else {
        message.style.cssText = `
            display: none;
        `;
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
                loading[_id] = true
                fn_situacao_limpeza(e, _id);
                loading[_id] = false
            }
        })
    });

}

