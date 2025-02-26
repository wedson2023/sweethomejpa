const moment = require('moment')

// models 
const despesas = require('../../models/despesas');
const reservas = require('../../models/reservas');
const anuncios = require('../../models/anuncios');

const { amount } = require('../../utils');

exports.index = async (req, res) => {

    const inicio = moment().startOf('month').format('YYYY-MM-DD 00:00');
    const fim = moment().add(1, 'days').format('YYYY-MM-DD 23:59');

    try {

        let data = {}

        data.anuncios = await anuncios.aggregate([
            {
                $project: {
                    _id: 1,
                    nome: 1,
                }
            }
        ]);

        data.data = await despesas.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: new Date(inicio), $lte: new Date(fim)
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    descricao: 1,
                    acomodacao: 1,
                    valor: 1,
                    created_at: { $dateToString: { format: "%d/%m %H:%M", date: "$created_at" } },
                    updated_at: 1
                }
            },
            { $sort: { acomodacao: 1 } }
        ]);

        const saidas = await despesas.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: new Date(inicio), $lte: new Date(fim)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    valor: { $sum: "$valor" }
                }
            }
        ]);

        const entradas = await reservas.aggregate([
            {
                $match: {
                    check_in: {
                        $gte: new Date(inicio), $lte: new Date(fim)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    preco: { $sum: "$preco" },
                    comissao: { $sum: { $multiply: ["$preco", "$comissao"] } }
                }
            }
        ]);

        data.total = {
            entradas: `R$ ${amount(entradas[0]?.preco || 0)}`,
            saidas: `R$ ${amount(saidas[0]?.valor || 0)}`,
            comissao: `R$ ${amount(entradas[0]?.comissao || 0)}`,
            liquido: `R$ ${amount((entradas[0]?.preco || 0) - ((saidas[0]?.valor || 0) + (entradas[0]?.comissao || 0)))}`
        }

        res.render('despesas', data);

    } catch ({ message }) {
        res.status(400).json({ message })
    }
}