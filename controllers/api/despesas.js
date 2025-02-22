const moment = require('moment')

// models 
const despesas = require('../../models/despesas');

exports.index = async (req, res) => {

    let query = {}

    if (Object.values(req.query).length) {

        {
            query = {
                created_at: {
                    $gte: new Date(req.query.inicio), $lte: new Date(req.query.final)
                }
            }
        }

        if (req.query.acomodacao) query.$and.push({ acomodacao: req.query.acomodacao })

    }

    try {

        const data = await despesas.aggregate([
            {
                $match: query
            },
            {
                $project: {
                    _id: 1,
                    descricao: 1,
                    acomodacao: 1,
                    valor: 1,
                    created_at: 1,
                    updated_at: 1
                }
            },
            { $sort: { acomodacao: 1 } }
        ]);

        res.json(data);

    } catch ({ message }) {
        res.status(400).json({ message })
    }
}

exports.store = async (req, res) => {

    try {

        let { nome, bairro, hospedes, proprietario, pix, comissao } = req.body;

        await despesas.create({ nome, bairro, hospedes, proprietario, pix, comissao });

        const data = await despesas.aggregate([
            { $match: {} },
            {
                $project: {
                    _id: 1,
                    descricao: 1,
                    acomodacao: 1,
                    valor: 1,
                    created_at: 1,
                    updated_at: 1
                }
            },
            { $sort: { acomodacao: 1 } }
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

        await despesas.deleteOne({ _id: req.params.id })

        const data = await despesas.aggregate([
            { $match: {} },
            {
                $project: {
                    _id: 1,
                    descricao: 1,
                    acomodacao: 1,
                    valor: 1,
                    created_at: 1,
                    updated_at: 1
                }
            },
            { $sort: { situacao: 1 } }
        ]);

        res.json(data)

    } catch ({ message }) {
        res.status(400).json({ message })
    }

}