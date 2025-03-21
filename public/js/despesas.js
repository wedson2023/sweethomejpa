const message = document.querySelector('p.message');
let count = document.querySelectorAll('tbody tr').length;

function amount(value) {
    return parseFloat(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

if (!count) {
    message.style.cssText = `
        display: block;
    `;
}

let date = document.querySelector('input[name=inicio]');
date.value = moment().startOf('month').format('YYYY-MM-DD 00:00')

date = document.querySelector('input[name=fim]');
date.value = moment().add(1, 'days').format('YYYY-MM-DD 23:59')

function fn_open_modal() {

    screen.style.opacity = 1;
    screen.style.visibility = 'visible';

    modal.style.cssText = `
        opacity: 1;
        visibility: visible;
        top: ${innerWidth <= 900 ? 0 : '50%'};
        margin-top: -${innerWidth <= 900 ? 0 : (modal.offsetHeight / 2)}px;
    `

    const cadastro_despesas = document.querySelector('.cadastro-despesas');

    cadastro_despesas?.addEventListener('submit', fn_cadastro_despesas);
}

const pesquisar_despesas = document.querySelector('.pesquisar-despesas');

pesquisar_despesas.addEventListener('submit', fn_pesquisar_despesas);

function fn_close_modal() {
    screen.style.opacity = 0;
    screen.style.visibility = 'hidden';
    modal.style.top = '60%';
    modal.style.opacity = 0;
    modal.style.visibility = 'hidden';
}

let loading = {};

document.querySelectorAll('td span.despesas').forEach(e => {

    e.addEventListener('click', () => {

        const _id = e.getAttribute('id');

        loading[_id] = false;

        if (!loading[_id]) {

            const con = confirm('Tem certeza que deseja deletar esse registro?');

            if (con) {
                loading[_id] = true
                fn_remover_despesas(_id);
                loading[_id] = false

            }

        }
    })
});

async function fn_pesquisar_despesas(e) {

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

        data = await fetch(`${uri}/api/despesas?${query}`, {
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

        document.querySelector('span.entradas').innerText = data.total.entradas;
        document.querySelector('span.saidas').innerText = data.total.saidas;
        document.querySelector('span.comissao').innerText = data.total.comissao;
        document.querySelector('span.liquido').innerText = data.total.liquido;

        fn_registros_despesas(data);

    } catch (err) {
        toast(err.message)
    }

}

async function fn_cadastro_despesas(e) {

    e.preventDefault();

    let data = {};

    for (let i = 0; i < e.target.elements.length; i++) {
        let name = e.target.elements[i].name;
        let value = e.target.elements[i].value;

        if (name)
            data[name] = value;

        e.target.elements[i].value = '';
    }

    try {

        data = await fetch(`${uri}/api/despesas`, {
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

        fn_registros_despesas(data);

        fn_close_modal();

    } catch (err) {
        toast(err.message)
    }
}

async function fn_remover_despesas(_id) {

    try {

        let data = await fetch(`${uri}/api/despesas/${_id}`, {
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

        document.querySelector('form.pesquisar-despesas select[name=acomodacao]').value = '';
        document.querySelector('form.pesquisar-despesas input[name=inicio]').value = moment().format('YYYY-MM-DD 14:00:00');
        document.querySelector('form.pesquisar-despesas input[name=fim]').value = moment().add(1, 'days').format('YYYY-MM-DD 12:00:00');

        fn_registros_despesas(data);

        fn_close_modal();

    } catch (err) {
        toast(err.message)
    }
}

function fn_registros_despesas(data) {

    let tbody = document.querySelector('tbody');
    tbody.innerHTML = "";

    document.querySelector('span.entradas').innerText = data.total.entradas;
    document.querySelector('span.saidas').innerText = data.total.saidas;
    document.querySelector('span.comissao').innerText = data.total.comissao;
    document.querySelector('span.liquido').innerText = data.total.liquido;

    let tr, td, a;

    for (let i in data.data) {

        tr = document.createElement('tr');
        td = document.createElement('td');
        a = document.createElement('a');

        let span = document.createElement('span');
        span.innerText = 'delete';
        span.setAttribute('class', 'material-icons');
        span.classList.add('despesas');
        span.setAttribute('id', data.data[i]._id);

        td.appendChild(span);
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data.data[i].descricao;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data.data[i].acomodacao;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data.data[i].valor;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = data.data[i].created_at;
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

    document.querySelectorAll('td span.despesas').forEach(e => {

        e.addEventListener('click', () => {

            const _id = e.getAttribute('id');

            loading[_id] = false;

            if (!loading[_id]) {

                const con = confirm('Tem certeza que deseja deletar esse registro?');

                if (con) {
                    loading[_id] = true
                    fn_remover_despesas(_id);
                    loading[_id] = false

                }

            }
        })
    });

}

document.querySelector('form button[type=button]').addEventListener('click', async (e) => {

    const acomodacao = document.querySelector('select[name=acomodacao]');
    const inicio = document.querySelector('input[name=inicio]');
    const fim = document.querySelector('input[name=fim]');

    if (!acomodacao.value) {
        toast('Selecione o campo acomodação.')
        return false;
    }

    const query = new URLSearchParams({ acomodacao: acomodacao.value, inicio: inicio.value, fim: fim.value }).toString();

    try {

        data = await fetch(`${uri}/api/download?${query}`, {
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

        pdf(data);

    } catch (err) {
        console.log(err);
        toast(err.message)
    }
})

function pdf(data) {

    let relatorio = document.createElement('div')
    relatorio.setAttribute('class', 'report');
    relatorio.style.cssText = `
        width: 100%;
        height: 100%;
        padding: 10px;
        background-color: #fff;
        z-index: 250;
    `;

    let img = document.createElement('img')
    img.setAttribute('src', '../images/logo.jpg');
    img.style.cssText = `
        width: 100px;
        display: block;
        margin: 15px auto;
    `;

    relatorio.appendChild(img);

    let div = document.createElement('div')
    div.style.cssText = `
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    `;

    let strong = document.createElement('strong')
    strong.innerText = data.data.titulo;
    strong.style.cssText = `
        color: #333;
    `;

    div.appendChild(strong);

    let span = document.createElement('span')
    span.innerText = data.data.data;
    span.style.cssText = `
        font-size: 0.9em;
        color: #666;
    `;

    div.appendChild(span);

    relatorio.appendChild(div);

    div.appendChild(strong);

    let title = [
        { name: 'Entradas', key: 'entradas' },
        { name: 'Saídas', key: 'saidas' },
        { name: 'Comissão', key: 'comissao' },
        { name: 'Líquido', key: 'liquido' },
    ];

    let total = document.createElement('div');
    total.style.cssText = `
        display: flex;
        justify-content: space-between;
        flex-direction: row;
        width: 100%;
        margin: 15px auto;
        user-select: none;
    `;

    for (let i in title) {

        div = document.createElement('div');
        div.style.cssText = `
            flex: 1;
            margin: 0 5px 5px 5px;
            border-left: solid 5px #305496;
            border-bottom: solid 2px #305496;
            padding: 5px;
            display: flex;
            justify-content: space-between;
        `;

        strong = document.createElement('strong');
        strong.innerText = title[i].name;
        strong.style.cssText = `
            color: #666;
        `;

        div.appendChild(strong);

        span = document.createElement('span');
        span.innerText = data.total[title[i].key];
        div.appendChild(span);

        total.appendChild(div);
    }

    relatorio.appendChild(total);

    strong = document.createElement('strong')
    strong.innerText = 'DESPESAS';
    strong.style.cssText = `
        display: block;
        color: #333;
        text-align: center;
        margin-bottom: 15px;
    `;

    relatorio.appendChild(strong);

    let despesas = document.createElement('div');

    let table = document.createElement('table');
    let thead = document.createElement('thead');

    let tr = document.createElement('tr');

    title = [
        { width: 33, name: 'DESCRIÇÃO' },
        { width: 33, name: 'VALOR' },
        { width: 33, name: 'CRIADO EM' },
    ];

    let td;

    for (let i in title) {
        td = document.createElement('td');
        td.innerText = title[i].name;
        td.setAttribute('width', `${title[i].width}%`);
        tr.appendChild(td);
    }

    thead.appendChild(tr);

    table.appendChild(thead);

    let tbody = document.createElement('tbody');

    if (data.data.despesas.length) {

        for (let i in data.data.despesas) {

            tr = document.createElement('tr');

            td = document.createElement('td');
            td.innerText = data.data.despesas[i].descricao;
            tr.appendChild(td);

            td = document.createElement('td');
            td.innerText = `R$ ${amount(data.data.despesas[i].valor)}`;
            tr.appendChild(td);

            td = document.createElement('td');
            td.innerText = data.data.despesas[i].created_at;
            tr.appendChild(td);

            tbody.appendChild(tr);

        }

    }

    table.appendChild(tbody);

    despesas.appendChild(table);

    if (!data.data.despesas.length) {

        const p = document.createElement('p');
        p.innerText = 'Nenhuma despesa encontrada.';
        p.style.cssText = `
            margin: 25px auto;
            color: #999;
            text-align: center;
            font-size: 0.9em;
        `;

        despesas.appendChild(p);

    }

    relatorio.appendChild(despesas);

    strong = document.createElement('strong')
    strong.innerText = 'RESERVAS';
    strong.style.cssText = `
        display: block;
        color: #333;
        text-align: center;
        margin: 15px 0;
    `;

    relatorio.appendChild(strong);

    let reservas = document.createElement('div');

    table = document.createElement('table');
    thead = document.createElement('thead');

    tr = document.createElement('tr');

    title = [
        { width: 20, name: 'NOME' },
        { width: 13.33, name: 'PLATAFORMA' },
        { width: 13.33, name: 'TELEFONE' },
        { width: 13.33, name: 'PREÇO' },
        { width: 13.33, name: 'CHECK-IN' },
        { width: 13.33, name: 'CHECK-OUT' },
        { width: 13.33, name: 'HOSPEDES' },
    ];

    td;

    for (let i in title) {
        td = document.createElement('td');
        td.innerText = title[i].name;
        td.setAttribute('width', `${title[i].width}%`);
        tr.appendChild(td);
    }

    thead.appendChild(tr);

    table.appendChild(thead);

    tbody = document.createElement('tbody');

    if (data.data.reservas.length) {

        for (let i in data.data.reservas) {

            tr = document.createElement('tr');

            td = document.createElement('td');
            td.innerText = data.data.reservas[i].nome;
            tr.appendChild(td);

            td = document.createElement('td');
            td.innerText = data.data.reservas[i].plataforma;
            tr.appendChild(td);

            td = document.createElement('td');
            td.innerText = data.data.reservas[i].telefone;
            tr.appendChild(td);

            td = document.createElement('td');
            td.innerText = `R$ ${amount(data.data.reservas[i].preco)}`;
            tr.appendChild(td);

            td = document.createElement('td');
            td.innerText = data.data.reservas[i].check_in;
            tr.appendChild(td);

            td = document.createElement('td');
            td.innerText = data.data.reservas[i].check_out;
            tr.appendChild(td);

            td = document.createElement('td');
            td.innerText = data.data.reservas[i].hospedes;
            tr.appendChild(td);

            tbody.appendChild(tr);

        }

    }

    table.appendChild(tbody);

    reservas.appendChild(table);

    

    if (!data.data.reservas.length) {

        const p = document.createElement('p');
        p.innerText = 'Nenhuma reserva encontrada.';
        p.style.cssText = `
            margin: 25px auto;
            color: #999;
            text-align: center;
            font-size: 0.9em;
        `;

        reservas.appendChild(p);

    }

    relatorio.appendChild(reservas);

    html2pdf(relatorio);

    delete relatorio;
    //document.body.appendChild(relatorio);

}