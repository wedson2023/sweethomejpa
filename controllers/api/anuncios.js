const moment = require('moment')

// models 
const anuncios = require('../../models/anuncios');
const reservas = require('../../models/reservas');

exports.index = async (req, res) => {

    let query = {}

    if (Object.values(req.query).length) {

        query = {
            $and: [{ nome: { $nin: [] } }]
        }

        let check_in = new Date(req.query.check_in);
        let check_out = new Date(req.query.check_out);

        const result = await reservas.aggregate([
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                { check_out: { $gte: check_in, $lte: check_out } },
                                { check_in: { $gte: check_in, $lte: check_out } }
                            ]
                        }
                    ]
                }
            }
        ]);

        if (result.length) {
            const nome = result.map(e => e.acomodacao);
            query.$and.push({ nome: { $nin: nome } })
        }

        if (req.query.bairro) query.$and.push({ bairro: req.query.bairro })
        if (req.query.hospedes) query.$and.push({ hospedes: { $gte: req.query.hospedes } })

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
                    proprietario: 1,
                    pix: 1,
                    comissao: 1,
                    url: 1,
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

        let { nome, bairro, hospedes, proprietario, pix, comissao } = req.body;

        await anuncios.create({ nome, bairro, hospedes, proprietario, pix, comissao });

        const data = await anuncios.aggregate([
            { $match: {} },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    bairro: 1,
                    hospedes: 1,
                    proprietario: 1,
                    pix: 1,
                    comissao: 1,
                    url: 1,
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
                    proprietario: 1,
                    pix: 1,
                    comissao: 1,
                    url: 1,
                }
            },
            { $sort: { situacao: 1 } }
        ]);

        res.json(data)

    } catch ({ message }) {
        res.status(400).json({ message })
    }

}