const moment = require('moment')

// models 
const despesas = require('../../models/despesas');
const reservas = require('../../models/reservas');

const { amount } = require('../../utils');

exports.index = async (req, res) => {

    let Qdata = {}
    let Qreserva = {}

    if (Object.values(req.query).length) {


        Qdata = {
            $and: [
                {
                    created_at: {
                        $gte: new Date(req.query.inicio), $lte: new Date(req.query.fim)
                    }
                }
            ]
        }

        if (req.query.acomodacao) Qdata.$and.push({ acomodacao: req.query.acomodacao })


        Qreserva = {
            $and: [
                {
                    check_in: {
                        $gte: new Date(req.query.inicio), $lte: new Date(req.query.fim)
                    }
                }
            ]
        }

        if (req.query.acomodacao) Qreserva.$and.push({ acomodacao: req.query.acomodacao })

    } else {

        const inicio = moment().startOf('month').format('YYYY-MM-DD 00:00:00');
        const fim = moment().format('YYYY-MM-DD 23:59:59');

        Qdata = {
            created_at: {
                $gte: new Date(inicio), $lte: new Date(fim)
            }
        }

        Qreserva = {
            check_in: {
                $gte: new Date(inicio), $lte: new Date(fim)
            }
        }

    }

    try {

        let data = await despesas.aggregate([
            {
                $match: Qdata
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
                $match: Qdata
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
                $match: Qreserva
            },
            {
                $group: {
                    _id: null,
                    preco: { $sum: "$preco" },
                    comissao: { $sum: { $multiply: ["$preco", "$comissao"] } }
                }
            }
        ]);

        data =
        {
            data,
            total: {
                entradas: `R$ ${amount(entradas[0].preco)}`,
                saidas: `R$ ${amount(saidas[0].valor)}`,
                comissao: `R$ ${amount(entradas[0].comissao)}`,
                liquido: `R$ ${amount(entradas[0].preco - (saidas[0].valor + entradas[0].comissao))}`
            }
        }

        res.json(data);

    } catch ({ message }) {
        res.status(400).json({ message })
    }
}

exports.store = async (req, res) => {

    try {

        let { descricao, acomodacao, valor } = req.body;

        await despesas.create({ descricao, acomodacao, valor }); let data = {}

        const inicio = moment().startOf('month').format('YYYY-MM-DD 00:00');
        const fim = moment().add(1, 'days').format('YYYY-MM-DD 23:59');

        data.despesas = await despesas.aggregate([
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

        data.reservas = await reservas.aggregate([
            {
                $match: {
                    check_in: {
                        $gte: new Date(inicio), $lte: new Date(fim)
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    telefone: 1,
                    acomodacao: 1,
                    preco: 1,
                    check_in: { $dateToString: { format: "%d/%m %H:%M", date: "$check_in" } },
                    check_out: { $dateToString: { format: "%d/%m %H:%M", date: "$check_out" } },
                    hospedes: 1,
                    dias: 1,
                    situacao: 1,
                    limpeza: 1,
                }
            }
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

        data.titulo = `Relátorio do anúncio ${req.query.acomodacao}`;
        data.data = `${moment(req.query.inicio).format('DD/MM HH:mm')} á ${moment(req.query.fim).format('DD/MM HH:mm')}`;

        data = {
            data,
            total: {
                entradas: `R$ ${amount(entradas[0]?.preco || 0)}`,
                saidas: `R$ ${amount(saidas[0]?.valor || 0)}`,
                comissao: `R$ ${amount(entradas[0]?.comissao || 0)}`,
                liquido: `R$ ${amount((entradas[0]?.preco || 0) - ((saidas[0]?.valor || 0) + (entradas[0]?.comissao || 0)))}`
            }
        }

        res.json(data);

    } catch ({ message }) {
        res.status(400).json({ message })
    }

}

exports.update = async (req, res) => {

}

exports.destroy = async (req, res) => {

    try {

        await despesas.deleteOne({ _id: req.params.id })

        let data = {}

        const inicio = moment().startOf('month').format('YYYY-MM-DD 00:00');
        const fim = moment().add(1, 'days').format('YYYY-MM-DD 23:59');

        data.despesas = await despesas.aggregate([
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

        data.reservas = await reservas.aggregate([
            {
                $match: {
                    check_in: {
                        $gte: new Date(inicio), $lte: new Date(fim)
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    telefone: 1,
                    acomodacao: 1,
                    preco: 1,
                    check_in: { $dateToString: { format: "%d/%m %H:%M", date: "$check_in" } },
                    check_out: { $dateToString: { format: "%d/%m %H:%M", date: "$check_out" } },
                    hospedes: 1,
                    dias: 1,
                    situacao: 1,
                    limpeza: 1,
                }
            }
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

        data.titulo = `Relátorio do anúncio ${req.query.acomodacao}`;
        data.data = `${moment(req.query.inicio).format('DD/MM HH:mm')} á ${moment(req.query.fim).format('DD/MM HH:mm')}`;

        data = {
            data,
            total: {
                entradas: `R$ ${amount(entradas[0]?.preco || 0)}`,
                saidas: `R$ ${amount(saidas[0]?.valor || 0)}`,
                comissao: `R$ ${amount(entradas[0]?.comissao || 0)}`,
                liquido: `R$ ${amount((entradas[0]?.preco || 0) - ((saidas[0]?.valor || 0) + (entradas[0]?.comissao || 0)))}`
            }
        }

        res.json(data)

    } catch ({ message }) {
        res.status(400).json({ message })
    }

}

exports.download = async (req, res) => {

    let data = {}
    let Qdata = {}
    let Qreserva = {}

    if (Object.values(req.query).length) {


        Qdata = {
            $and: [
                {
                    created_at: {
                        $gte: new Date(req.query.inicio), $lte: new Date(req.query.fim)
                    }
                }
            ]
        }

        if (req.query.acomodacao) Qdata.$and.push({ acomodacao: req.query.acomodacao })


        Qreserva = {
            $and: [
                {
                    check_in: {
                        $gte: new Date(req.query.inicio), $lte: new Date(req.query.fim)
                    }
                }
            ]
        }

        if (req.query.acomodacao) Qreserva.$and.push({ acomodacao: req.query.acomodacao })

    } else {

        const inicio = moment().startOf('month').format('YYYY-MM-DD 00:00:00');
        const fim = moment().format('YYYY-MM-DD 23:59:59');

        Qdata = {
            created_at: {
                $gte: new Date(inicio), $lte: new Date(fim)
            }
        }

        Qreserva = {
            check_in: {
                $gte: new Date(inicio), $lte: new Date(fim)
            }
        }

    }

    try {

        data.despesas = await despesas.aggregate([
            {
                $match: Qdata
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

        data.reservas = await reservas.aggregate([
            {
                $match: Qreserva
            },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    telefone: 1,
                    acomodacao: 1,
                    preco: 1,
                    check_in: { $dateToString: { format: "%d/%m %H:%M", date: "$check_in" } },
                    check_out: { $dateToString: { format: "%d/%m %H:%M", date: "$check_out" } },
                    hospedes: 1,
                    dias: 1,
                    situacao: 1,
                    limpeza: 1,
                }
            }
        ]);

        const saidas = await despesas.aggregate([
            {
                $match: Qdata
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
                $match: Qreserva
            },
            {
                $group: {
                    _id: null,
                    preco: { $sum: "$preco" },
                    comissao: { $sum: { $multiply: ["$preco", "$comissao"] } }
                }
            }
        ]);

        data.titulo = `Relátorio do anúncio ${req.query.acomodacao}`,
            data.data = `${moment(req.query.inicio).format('DD/MM HH:mm')} á ${moment(req.query.fim).format('DD/MM HH:mm')}`,

            data =
            {
                data,
                total: {
                    entradas: `R$ ${amount(entradas[0]?.preco || 0)}`,
                    saidas: `R$ ${amount(saidas[0]?.valor || 0)}`,
                    comissao: `R$ ${amount(entradas[0]?.comissao || 0)}`,
                    liquido: `R$ ${amount((entradas[0]?.preco || 0) - ((saidas[0]?.valor || 0) + (entradas[0]?.comissao || 0)))}`
                }
            }

        res.json(data);

    } catch ({ message }) {
        res.status(400).json({ message })
    }
}