const message = document.querySelector('p.message');
let count = document.querySelectorAll('tbody tr').length;

if (!count) {
    message.style.cssText = `
        display: block;
    `;
}

let date = document.querySelector('input[name=check_in]');
date.value = moment().format('YYYY-MM-DD 14:00:00')

date = document.querySelector('input[name=check_out]');
date.value = moment().add(1, 'days').format('YYYY-MM-DD 12:00:00')

async function fn_open_modal(_id) {

    screen.style.opacity = 1;
    screen.style.visibility = 'visible';

    modal.style.cssText = `
        opacity: 1;
        visibility: visible;
        top: ${innerWidth <= 900 ? 0 : '50%'};
        margin-top: -${innerWidth <= 900 ? 0 : (modal.offsetHeight / 2)}px;
    `

    const cadastro_anuncios = document.querySelector('.cadastro-anuncios');

    if (_id) {

        data = await fetch(`${uri}/api/anuncios/${_id}`, {
            method: 'GET',
            headers: {
                authorization: `Bearer ${token}`,
            }
        })

        data = await data.json();

        cadastro_anuncios.querySelectorAll('input').forEach(e => {
            e.value = data[e.getAttribute('name')];
        });

        cadastro_anuncios.querySelectorAll('select').forEach(e => {
            e.value = data[e.getAttribute('name')];
        });

        document.querySelector('input[type=hidden]').value = _id;

    } else {

        cadastro_anuncios.querySelectorAll('input').forEach(e => {
            e.value = '';
        });

        cadastro_anuncios.querySelectorAll('select').forEach(e => {
            e.value = '';
        });

        document.querySelector('input[type=hidden]').value = '';

    }

    cadastro_anuncios?.addEventListener('submit', fn_cadastro_anuncios);
}

const pesquisar_anuncios = document.querySelector('.pesquisar-anuncios');

pesquisar_anuncios.addEventListener('submit', fn_pesquisar_anuncios);

function fn_close_modal() {
    screen.style.opacity = 0;
    screen.style.visibility = 'hidden';
    modal.style.top = '60%';
    modal.style.opacity = 0;
    modal.style.visibility = 'hidden';
}

let loading = {};

// document.querySelectorAll('td span.anuncios').forEach(e => {

//     e.addEventListener('click', () => {

//         const _id = e.getAttribute('id');

//         loading[_id] = false;

//         if (!loading[_id]) {

//             const con = confirm('Tem certeza que deseja deletar esse registro?');

//             if (con) {
//                 loading[_id] = true
//                 fn_remover_anuncios(_id);
//                 loading[_id] = false

//             }

//         }
//     })
// });



document.querySelectorAll('td span.anuncios').forEach(e => {

    e.addEventListener('click', () => {

        const _id = e.getAttribute('id');
        fn_open_modal(_id);

    })
});

document.querySelectorAll('.copy').forEach(e => {
    e.addEventListener('click', () => {
        const value = e.getAttribute('url');
        console.log(value);
        let input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.value = value;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
    })
})

async function fn_pesquisar_anuncios(e) {

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

        data = await fetch(`${uri}/api/anuncios?${query}`, {
            method: 'GET',
            headers: {
                authorization: `Bearer ${token}`,
            }
        })

        data = await data.json();

        if (data.message) {
            toast(data.message)
            return false;
        }

        fn_registros_anuncios(data);

    } catch (err) {
        toast(err.message)
    }

}

async function fn_cadastro_anuncios(e) {

    e.preventDefault();

    let data = {};

    for (let i = 0; i < e.target.elements.length; i++) {
        let name = e.target.elements[i].name;
        let value = e.target.elements[i].value;

        if (name && name != '_id') data[name] = value;

        if (name != '_id')
            e.target.elements[i].value = '';
    }

    try {

        const _id = document.querySelector('input[type=hidden]').value;

        if (_id) {

            data = await fetch(`${uri}/api/anuncios/${_id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: {
                    'Content-type': 'application/json;charset=UTF-8',
                    authorization: `Bearer ${token}`,
                }
            })

        } else {

            data = await fetch(`${uri}/api/anuncios`, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-type': 'application/json;charset=UTF-8',
                    authorization: `Bearer ${token}`,
                }
            })

        }

        data = await data.json();

        if (data.message) {
            toast(data.message)
            return false;
        }

        toast('Cadastro realizado com SUCESSO!')

        fn_registros_anuncios(data);

        fn_close_modal();

    } catch (err) {
        toast(err.message)
    }
}

async function fn_remover_anuncios(_id) {

    try {

        let data = await fetch(`${uri}/api/anuncios/${_id}`, {
            method: 'DELETE',
            headers: {
                authorization: `Bearer ${token}`,
            }
        })
        data = await data.json();

        if (data.message) {
            toast(data.message)
            return false;
        }

        document.querySelector('form.pesquisar-anuncios input[name=hospedes]').value = '';
        document.querySelector('form.pesquisar-anuncios select[name=bairro]').value = '';
        document.querySelector('form.pesquisar-anuncios input[name=check_in]').value = moment().format('YYYY-MM-DD 14:00:00');
        document.querySelector('form.pesquisar-anuncios input[name=check_out]').value = moment().add(1, 'days').format('YYYY-MM-DD 12:00:00');

        fn_registros_anuncios(data);

        fn_close_modal();

    } catch (err) {
        console.log(err);
        toast(err.message)
    }
}

function fn_registros_anuncios(data) {

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
        span.classList.add('anuncios');
        span.setAttribute('id', data[i]._id);

        td.appendChild(span);
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data[i].nome;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data[i].bairro;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data[i].hospedes;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data[i].proprietario;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data[i].pix;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = `${data[i].comissao}%`;
        tr.appendChild(td);

        td = document.createElement('td');
        td.setAttribute('title', 'Clique para copiar o link da própriedade')
        span = document.createElement('span');
        span.innerText = 'content_copy';
        span.setAttribute('class', 'material-icons');
        span.setAttribute('url', data[i].url);
        span.classList.add('copy');

        td.appendChild(span);
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

    document.querySelectorAll('td span.anuncios').forEach(e => {

        e.addEventListener('click', () => {

            const _id = e.getAttribute('id');

            loading[_id] = false;

            if (!loading[_id]) {

                const con = confirm('Tem certeza que deseja deletar esse registro?');

                if (con) {
                    loading[_id] = true
                    fn_remover_anuncios(_id);
                    loading[_id] = false

                }

            }
        })
    });

    document.querySelectorAll('.copy').forEach(e => {
        e.addEventListener('click', () => {
            const value = e.getAttribute('url');
            console.log(value);
            let input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.value = value;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            input.remove();
        })
    })

}