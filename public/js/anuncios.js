function fn_open_modal() {

    screen.style.opacity = 1;
    screen.style.visibility = 'visible';

    modal.style.cssText = `
        opacity: 1;
        visibility: visible;
        top: ${innerWidth <= 900 ? 0 : '50%'};
        margin-top: -${innerWidth <= 900 ? 0 : (modal.offsetHeight / 2)}px;
    `

    const cadastro_anuncios = document.querySelector('.cadastro-anuncios');

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

        data = await fetch(`http://localhost:3000/api/anuncios?${query}`)

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

        if (name)
            data[name] = value;
    }

    try {

        data = await fetch('http://localhost:3000/api/anuncios', {
            method: 'POST',
            headers: { 'Content-type': 'application/json;charset=UTF-8' },
            body: JSON.stringify(data)
        })

        data = await data.json();

        if (data.message) {
            toast(data.message)
            return false;
        }

        fn_registros_anuncios(data);

        fn_close_modal();

    } catch (err) {
        toast(err.message)
    }
}

async function fn_remover_anuncios(_id) {

    try {

        let data = await fetch(`http://localhost:3000/api/anuncios/${_id}`, { method: 'DELETE' })
        data = await data.json();

        if (data.message) {
            toast(data.message)
            return false;
        }

        fn_registros_anuncios(data);

        fn_close_modal();

    } catch (err) {
        toast(err.message)
    }
}

async function fn_situacao_limpeza(e, _id) {

    try {

        const limpeza = e.getAttribute('situacao');

        let data = await fetch(`http://localhost:3000/api/anuncios/${_id}`, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json;charset=UTF-8' },
            body: JSON.stringify({ limpeza })
        })

        data = await data.json();

        if (data.message) {
            toast(data.message)
            return false;
        }

        fn_registros_anuncios(data);

        fn_close_modal();

    } catch (err) {
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