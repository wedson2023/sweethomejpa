const moment = require('moment')

// models 
const reservas = require('../../models/reservas');

exports.index = async (req, res) => {

    console.log(moment().subtract(1, 'days').format('YYYY-MM-DD hh:mm:ss'))

    try {

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

        res.render('reservas', { data });

    } catch (e) {
        console.log(e);
    }

}
