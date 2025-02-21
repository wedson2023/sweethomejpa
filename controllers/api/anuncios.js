const moment = require('moment')

// models 
const anuncios = require('../../models/anuncios');

exports.index = async (req, res) => {

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

        const data = await anuncios.aggregate([
            {
                $match: query
            },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    bairro: 1,
                    hospedes: 1,
                    comissao: 1
                }
            },
            { $sort: { nome: 1 } }
        ]);

        res.json(data);

    } catch ({ message }) {
        res.status(400).json({ message })
    }
}

exports.store = async (req, res) => {

    try {

        let { nome, bairro, hospedes, comissao } = req.body;

        await anuncios.create({ nome, bairro, hospedes, comissao });

        const data = await anuncios.aggregate([
            { $match: {} },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    bairro: 1,
                    hospedes: 1,
                    comissao: 1
                }
            },
            { $sort: { nome: 1 } }
        ]);

        res.json(data)

    } catch ({ message }) {
        res.status(400).json({ message })
    }

}

exports.update = async (req, res) => {

}

exports.destroy = async (req, res) => {

    try {

        await anuncios.deleteOne({ _id: req.params.id })

        const data = await anuncios.aggregate([
            { $match: {} },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    bairro: 1,
                    hospedes: 1,
                    comissao: 1
                }
            },
            { $sort: { situacao: 1 } }
        ]);

        res.json(data)

    } catch ({ message }) {
        res.status(400).json({ message })
    }

}