// models 
const anuncios = require('../../models/anuncios');

exports.store = async (req, res) => {

    const { nome, bairro, hospedes, comissao } = req.body;

    try {
        await anuncios.create({ nome, bairro, hospedes, comissao });
    } catch (e) {
        console.log(e);
    }

    res.json({ message: 'ok' })

}