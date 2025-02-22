const mongoose = require('../connect');

const schema = mongoose.Schema(
    {
        descricao: String,
        acomodacao: String,
        valor: Number,
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

module.exports = mongoose.model('despesas', schema);