const mongoose = require('../connect');

const schema = mongoose.Schema(
    {
        nome: String,
        telefone: String,
        acomodacao: String,
        plataforma: String,
        check_in: Date,
        check_out: Date,
        hospedes: Number,
        preco: Number,
        preco_limpeza: Number,
        dias: Number,
        situacao: String,
        comissao: Number,
        limpeza: {
            type: String,
            default: 'Pendente'
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

module.exports = mongoose.model('reservas', schema);