const mongoose = require('../connect');

const schema = mongoose.Schema({
    nome: String,
    telefone: String,
    acomodacao: String,
    preco: Number,
    check_in: Date,
    check_out: Date,
    hospedes: Number,
    dias: Number,
    situacao: String,
    limpeza: {
        type: String,
        default: 'Pendente'
    }
});

module.exports = mongoose.model('reservas', schema);