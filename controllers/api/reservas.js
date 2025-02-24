const moment = require('moment')

// models 
const reservas = require('../../models/reservas');
const anuncios = require('../../models/anuncios');

exports.index = async (req, res) => {

    let query = {}

    if (Object.values(req.query).length) {

        query = {
            $and: [
                { check_in: { $gte: new Date(moment().subtract(1, 'month')) } },
                {
                    check_in: {
                        $gte: new Date(req.query.start), $lte: new Date(req.query.end)
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
                    preco: 1,
                    check_in: { $dateToString: { format: "%d/%m %H:%M", date: "$check_in" } },
                    check_out: { $dateToString: { format: "%d/%m %H:%M", date: "$check_out" } },
                    hospedes: 1,
                    dias: 1,
                    situacao: 1,
                    limpeza: 1,
                }
            }
        ]);

        res.json(data);

    } catch ({ message }) {
        res.status(400).json({ message })
    }
}

exports.store = async (req, res) => {

    try {

        let { nome, telefone, acomodacao, preco, check_in, check_out, hospedes } = req.body;

        telefone = telefone.replace(/[ /() -]/gi, "");

        check_out = moment(check_out)

        const dias = check_out.diff(moment(check_in), 'days'); 

        check_in = new Date(check_in);
        check_out = new Date(check_out);
        const now = new Date();

        if (check_in >= check_out) throw new Error('A data de check-in não pode ser maior ou igual ao check-out.');

        let situacao;

        if (check_out <= now) situacao = 'Estádia encerrada';
        else if (check_in <= now) situacao = 'Estádia em andamento';
        else {
            situacao = moment(check_in).diff(moment(), 'days') + ' dias';
        }

        const result = await reservas.aggregate([
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

        const { comissao } = await anuncios.findOne({ nome: acomodacao });        

        await reservas.create({ nome, telefone, acomodacao, preco, check_in, check_out, hospedes, dias, situacao, comissao: comissao / 100 }); 

        const query = { check_in: { $gte: new Date(moment().subtract(1, 'month')) } }

        const data = await reservas.aggregate([
            { $match: query },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    telefone: 1,
                    acomodacao: 1,
                    preco: 1,
                    check_in: { $dateToString: { format: "%d/%m %H:%M", date: "$check_in" } },
                    check_out: { $dateToString: { format: "%d/%m %H:%M", date: "$check_out" } },
                    hospedes: 1,
                    dias: 1,
                    situacao: 1,
                    limpeza: 1,
                }
            },
            { $sort: { situacao: 1 } }
        ]);

        res.json(data)

    } catch ({ message }) {
        res.status(400).json({ message })
    }

}

exports.update = async (req, res) => {
    try {

        const limpeza = req.body.limpeza === 'Feita' ? 'Pendente' : 'Feita';

        await reservas.updateOne({ _id: req.params.id }, { limpeza })

        const data = await reservas.aggregate([
            { $match: {} },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    telefone: 1,
                    acomodacao: 1,
                    preco: 1,
                    check_in: { $dateToString: { format: "%d/%m %H:%M", date: "$check_in" } },
                    check_out: { $dateToString: { format: "%d/%m %H:%M", date: "$check_out" } },
                    hospedes: 1,
                    dias: 1,
                    situacao: 1,
                    limpeza: 1,
                }
            },
            { $sort: { situacao: 1 } }
        ]);

        res.json(data)

    } catch ({ message }) {
        res.status(400).json({ message })
    }
}

exports.destroy = async (req, res) => {

    try {

        await reservas.deleteOne({ _id: req.params.id })

        const data = await reservas.aggregate([
            { $match: {} },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    telefone: 1,
                    acomodacao: 1,
                    preco: 1,
                    check_in: { $dateToString: { format: "%d/%m %H:%M", date: "$check_in" } },
                    check_out: { $dateToString: { format: "%d/%m %H:%M", date: "$check_out" } },
                    hospedes: 1,
                    dias: 1,
                    situacao: 1,
                    limpeza: 1,
                }
            },
            { $sort: { situacao: 1 } }
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
                    preco: 1,
                    check_in_formatado: { $dateToString: { format: "%d/%m %H:%M", date: "$check_in" } },
                    check_out_formatado: { $dateToString: { format: "%d/%m %H:%M", date: "$check_out" } },
                    check_in: 1,
                    check_out: 1,
                    hospedes: 1,
                    dias: 1,
                    situacao: 1,
                    limpeza: 1,
                }
            }
        ]);

        for (let i in data) {

            const check_in = new Date(data[i].check_in);
            const check_out = new Date(data[i].check_out);
            const now = new Date();

            let object;

            if (check_out <= now) object = { situacao: 'Estádia encerrada' };
            else if (check_in <= now) object = { situacao: 'Estádia em andamento' };
            else {
                object = { situacao: moment(data[i].check_in).diff(moment(), 'days') + ' dias' };
            }

            await reservas.updateOne({ _id: data[i]._id }, object)

        }

        res.json({ data })

    } catch ({ message }) {
        res.status(400).json({ message })
    }

}