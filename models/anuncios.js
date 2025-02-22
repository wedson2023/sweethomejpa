const mongoose = require('../connect');

const schema = mongoose.Schema(
    {
        nome: String,
        bairro: String,
        hospedes: String,
        proprietario: String,
        pix: String,
        comissao: Number,
        url: String,
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

module.exports = mongoose.model('anuncios', schema);