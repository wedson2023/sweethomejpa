const mongoose = require('../connect');

const schema = mongoose.Schema({
    nome: String,
    bairro: String,
    hospedes: String,
    proprietario: String,
    pix: String,
    comissao: Number,
    url: String,
});

module.exports = mongoose.model('anuncios', schema);