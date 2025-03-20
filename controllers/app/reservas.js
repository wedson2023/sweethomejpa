const moment = require('moment')

// models 
const reservas = require('../../models/reservas');
const anuncios = require('../../models/anuncios');
const { amount } = require('../../utils');

exports.index = async (req, res) => {

    try {

        const query = { check_in: { $gte: new Date(moment().subtract(1, 'month')) } }

        let data = {};

        data.anuncios = await anuncios.aggregate([
            {
                $project: {
                    _id: 1,
                    nome: 1,
                }
            }
        ]);

        data.data = await reservas.aggregate([
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
            { $sort: { situacao: 1 } }
        ]);

        data.data = data.data.map(e => {
            e.preco = amount(e.preco);
            e.preco_limpeza = amount(e.preco_limpeza);
            return e;
        });

        res.render('reservas', data);

    } catch ({ message }) {
        res.status(400).json({ message })
    }
}
