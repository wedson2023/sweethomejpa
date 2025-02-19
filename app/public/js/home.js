window.onload = async (e) => {

    let data = await fetch('http://localhost:3000/reservas')

    data = await data.json();

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    let tr = document.createElement('tr');

    const title = ['NOME', 'TELEFONE', 'ESPAÇO', 'VALOR ESTÁDIA', 'CHECK-IN', 'CHECK-OUT', 'HOSPEDES', 'DIAS', 'ÍNICIO ESTÁDIA', 'FIM ESTÁDIA', 'LIMPEZA'];

    let td;

    title.forEach(v => {
        td = document.createElement('td');
        td.innerText = v;
        tr.appendChild(td);
    })

    thead.appendChild(tr);

    for (let i in data) {

        tr = document.createElement('tr');

        Object.values(data[i]).forEach((v) => {
            td = document.createElement('td');
            td.innerText = v;
            tr.appendChild(td);
        })

        td = document.createElement('td');
        td.innerText = 0;
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = 'Estádia em andamento';
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = '1 dias';
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerText = 'Feita';
        tr.appendChild(td);

        tbody.appendChild(tr);
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    document.body.append(table);
}