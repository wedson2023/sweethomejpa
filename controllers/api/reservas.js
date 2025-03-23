const moment = require('moment')

// models 
const reservas = require('../../models/reservas');
const anuncios = require('../../models/anuncios');
const despesas = require('../../models/despesas');

exports.index = async (req, res) => {

    let query = {}

    if (Object.values(req.query).length) {

        query = {
            $and: [
                { check_in: { $gte: new Date(moment().subtract(1, 'month')) } },
                {
                    check_in: {
                        $gte: new Date(req.query.inicio), $lte: new Date(req.query.fim)
                    }
                }
            ]
        }

        if (req.query.acomodacao) query.$and.push({ acomodacao: req.query.acomodacao })
        if (req.query.nome) query.$and.push({ nome: { $regex: req.query.nome, $options: 'i' } })
    }

    try {

        const data = await reservas.aggregate([
            {
                $match: query
            },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    telefone: 1,
                    acomodacao: 1,
                    plataforma: 1,
                    check_in: { $dateToString: { format: "%d/%m %H:%M", date: "$check_in" } },
                    check_out: { $dateToString: { format: "%d/%m %H:%M", date: "$check_out" } },
                    preco: 1,
                    preco_limpeza: 1,
                    hospedes: 1,
                    dias: 1,
                    situacao: 1,
                    limpeza: 1,
                }
            },
            { $sort: { situacao: 1, check_in: -1 } }
        ]);

        res.json(data);

    } catch ({ message }) {
        res.status(400).json({ message })
    }
}

exports.store = async (req, res) => {

    try {

        let { nome, telefone, acomodacao, plataforma, check_in, check_out, preco, preco_limpeza, hospedes } = req.body;

        telefone = telefone.replace(/\D/g, '');

        check_out = moment(check_out)

        const dias = check_out.diff(moment(check_in), 'days') + 1;

        check_in = new Date(check_in);
        check_out = new Date(check_out);
        const now = new Date();

        if (check_in >= check_out) throw new Error('A data de check-in não pode ser maior ou igual ao check-out.');

        let result = await reservas.aggregate([
            {
                $match: {
                    $and: [
                        { acomodacao: { $eq: acomodacao } },
                        {
                            $or: [
                                { check_out: { $gte: check_in, $lte: check_out } },
                                { check_in: { $gte: check_in, $lte: check_out } }
                            ]
                        }
                    ]
                }
            },
            { $count: "count" }
        ]);

        if (result.length) throw new Error('Já existe uma reserva para esse apartamento para essa data.');

        result = await reservas.aggregate([
            {
                $match: {
                    $and: [
                        { acomodacao: { $eq: acomodacao } },
                        { $or: [{ situacao: 'Estádia encerrada' }, { situacao: 'Estádia em andamento' }] }
                    ]
                }
            },
            { $sort: { check_out: -1 } },
            { $limit: 1 },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    acomodacao: 1,
                    situacao: 1,
                    limpeza: 1,
                }
            },
        ]);

        let situacao, limpeza;

        if (result.length) limpeza = result[0].limpeza;

        if (check_out <= now) situacao = 'Estádia encerrada';
        else if (check_in <= now) {
            limpeza = 'Pendente';
            situacao = 'Estádia em andamento';
        }
        else {
            situacao = moment(check_in).diff(moment(), 'days') + ' dia(s)';
        }

        const { comissao } = await anuncios.findOne({ nome: acomodacao });

        const { _id } = await reservas.create({ nome, telefone, acomodacao, plataforma, check_in, check_out, preco, preco_limpeza, hospedes, dias, situacao, comissao: comissao / 100, limpeza });

        await despesas.create({ descricao: 'Limpeza', acomodacao, valor: 90, reservas: _id });

        const query = { check_in: { $gte: new Date(moment().subtract(1, 'month')) } }

        const data = await reservas.aggregate([
            { $match: query },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    telefone: 1,
                    acomodacao: 1,
                    plataforma: 1,
                    check_in: { $dateToString: { format: "%d/%m %H:%M", date: "$check_in" } },
                    check_out: { $dateToString: { format: "%d/%m %H:%M", date: "$check_out" } },
                    preco: 1,
                    preco_limpeza: 1,
                    hospedes: 1,
                    dias: 1,
                    situacao: 1,
                    limpeza: 1,
                }
            },
            { $sort: { situacao: 1, check_in: -1 } }
        ]);

        res.json(data)

    } catch ({ message }) {
        res.status(400).json({ message })
    }

}

exports.update = async (req, res) => {

    try {

        const { acomodacao, limpeza, situacao, check_in } = await reservas.findOne({ _id: req.params.id })

        if (situacao != 'Estádia encerrada' && situacao != 'Estádia em andamento') throw new Error('Só é possível alterar o status de limpeza quando a estádia está encerrada ou em andamento.');

        await reservas.updateOne({ _id: req.params.id }, { limpeza: (limpeza === 'Feita' ? 'Pendente' : 'Feita') })

        await reservas.updateMany({ check_in: { $gte: check_in }, acomodacao, situacao: { $ne: 'Estádia em andamento' }, _id: { $ne: req.params.id } }, { limpeza: (limpeza === 'Feita' ? 'Pendente' : 'Feita') })

        const data = await reservas.aggregate([
            { $match: {} },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    telefone: 1,
                    acomodacao: 1,
                    plataforma: 1,
                    check_in: { $dateToString: { format: "%d/%m %H:%M", date: "$check_in" } },
                    check_out: { $dateToString: { format: "%d/%m %H:%M", date: "$check_out" } },
                    preco: 1,
                    preco_limpeza: 1,
                    hospedes: 1,
                    dias: 1,
                    situacao: 1,
                    limpeza: 1,
                }
            },
            { $sort: { situacao: 1, check_in: -1 } }
        ]);

        res.json(data)

    } catch ({ message }) {
        res.status(400).json({ message })
    }
}

exports.destroy = async (req, res) => {

    try {

        await despesas.deleteOne({ reservas: req.params.id })
        await reservas.deleteOne({ _id: req.params.id })

        const data = await reservas.aggregate([
            { $match: {} },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    telefone: 1,
                    acomodacao: 1,
                    plataforma: 1,
                    check_in: { $dateToString: { format: "%d/%m %H:%M", date: "$check_in" } },
                    check_out: { $dateToString: { format: "%d/%m %H:%M", date: "$check_out" } },
                    preco: 1,
                    preco_limpeza: 1,
                    hospedes: 1,
                    dias: 1,
                    situacao: 1,
                    limpeza: 1,
                }
            },
            { $sort: { situacao: 1, check_in: -1 } }
        ]);

        res.json(data)

    } catch ({ message }) {
        res.status(400).json({ message })
    }

}

exports.situacao = async (req, res) => {

    try {

        const data = await reservas.aggregate([
            { $match: { situacao: { $ne: 'Estádia encerrada' } } },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    telefone: 1,
                    acomodacao: 1,
                    plataforma: 1,
                    check_in_formatado: { $dateToString: { format: "%d/%m %H:%M", date: "$check_in" } },
                    check_out_formatado: { $dateToString: { format: "%d/%m %H:%M", date: "$check_out" } },
                    preco: 1,
                    preco_limpeza: 1,
                    check_in: 1,
                    check_out: 1,
                    hospedes: 1,
                    dias: 1,
                    situacao: 1,
                    limpeza: 1,
                }
            },
            { $sort: { situacao: 1, check_in: -1 } }
        ]);

        for (let i in data) {

            const check_in = new Date(data[i].check_in);
            const check_out = new Date(data[i].check_out);
            const now = new Date();

            let object;

            if (check_out <= now) {
                object = { situacao: 'Estádia encerrada' };
            }
            else if (check_in <= now) {
                object = { situacao: 'Estádia em andamento', limpeza: 'Pendente' };
                await reservas.updateMany({ check_in: { $gt: data[i].check_in }, acomodacao: data[i].acomodacao }, { limpeza: 'Pendente' })
            } else {
                object = { situacao: moment(data[i].check_in).diff(moment(), 'days') + ' dias' };
            }

            await reservas.updateOne({ _id: data[i]._id }, object)

        }

        res.json({ data })

    } catch ({ message }) {
        res.status(400).json({ message })
    }

}