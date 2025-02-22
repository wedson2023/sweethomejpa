const mongoose = require('../connect');

const schema = mongoose.Schema(
    {
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
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

module.exports = mongoose.model('reservas', schema);