// models 
const despesas = require('../../models/despesas');

exports.index = async (req, res) => {

    try {

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
            }
        ]);

        res.render('despesas', { data });

    } catch ({ message }) {
        res.status(400).json({ message })
    }

}