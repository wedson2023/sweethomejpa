const mongoose = require('../connect');

const schema = mongoose.Schema({
    nome: String,
    bairro: String,
    hospedes: String,
    comissao: Number
});

module.exports = mongoose.model('anuncios', schema);