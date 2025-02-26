const moment = require('moment')

// models 
const reservas = require('../../models/reservas');
const anuncios = require('../../models/anuncios');

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

        res.render('reservas', data);

    } catch ({ message }) {
        res.status(400).json({ message })
    }
}
