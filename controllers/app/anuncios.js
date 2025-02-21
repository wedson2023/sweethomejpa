// models 
const anuncios = require('../../models/anuncios');

exports.index = async (req, res) => {

    try {

        const data = await anuncios.aggregate([
            { $match: {} },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    bairro: 1,
                    hospedes: 1,
                    comissao: 1,
                }
            }
        ]);

        res.render('anuncios', { data });

    } catch (e) {
        console.log(e);
    }

}