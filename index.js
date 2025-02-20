const express = require('express')
const handlebars = require('express-handlebars');
const cors = require('cors')
const moment = require('moment')
const bodyParser = require('body-parser')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static('public'))

app.use(cors())

const mongoose = require('mongoose')
const { Types } = mongoose;

const { Schema } = mongoose;

mongoose.connect('mongodb://localhost/sweethomejpa')
    .then(() => console.log('Banco de dados mongo rodando.'))
    .catch(e => console.log(e.message));

app.get('/', (req, res) => {
    res.render('reservas');
});

let schema = new Schema({
    nome: String,
    bairro: String,
    hospedes: String,
    comissao: Number
});

const Anuncios = mongoose.model('anuncios', schema);

app.get('/anuncios', async (req, res) => {

    try {

        const data = await Anuncios.aggregate([
            { $match: {} },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    bairro: 1,
                    hospedes: 1,
                    comissao: 1,
                }
            }
        ]);

        res.render('anuncios', { data });

    } catch (e) {
        console.log(e);
    }
});

app.post('/cadastrar-anuncios', async (req, res) => {

    const { nome, bairro, hospedes, comissao } = req.body;

    try {
        await Anuncios.create({ nome, bairro, hospedes, comissao });
    } catch (e) {
        console.log(e);
    }

    res.json({ message: 'ok' })
})

schema = new Schema({
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

const Reservas = mongoose.model('reservas', schema);

app.get('/api/reservas', async (req, res) => {

    let query = {}

    if (Object.values(req.query).length) {

        query = {
            $and: [
                {
                    check_in: {
                        $gte: new Date(req.query.start), $lte: new Date(req.query.end)
                    }
                }
            ]
        }

        if (req.query.acomodacao) query.$and.push({ acomodacao: req.query.acomodacao })
        if (req.query.nome) query.$and.push({ nome: { $regex: req.query.nome, $options: 'i' } })
    }

    try {

        const data = await Reservas.aggregate([
            {
                $match: query
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

        res.json(data);

    } catch (e) {
        console.log(e);
    }
})

app.get('/adm/reservas', async (req, res) => {

    const { nome, acomodacao, check_in, check_out } = req.query;

    console.log(nome, acomodacao, check_in, check_out);

    try {

        const data = await Reservas.aggregate([
            { $match: {} },
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
            },
            { $sort: { situacao: 1 } }
        ]);

        res.render('reservas', { data });

    } catch (e) {
        console.log(e);
    }
})

app.post('/cadastrar-reservas', async (req, res) => {

    let { nome, telefone, acomodacao, preco, check_in, check_out, hospedes } = req.body;

    check_in = moment(check_in);
    check_out = moment(check_out);

    const dias = check_out.diff(check_in, 'days');

    const now = moment();

    const situacao = check_in.diff(now, 'days') + ' dia(s)';

    try {
        await Reservas.create({ nome, telefone, acomodacao, preco, check_in, check_out, hospedes, dias, situacao });

        const data = await Reservas.aggregate([
            { $match: {} },
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
            },
            { $sort: { situacao: 1 } }
        ]);

        res.json(data)

    } catch (e) {
        console.log(e);
    }
})

app.post('/reservas', async (req, res) => {

    try {

        const data = await Reservas.aggregate([
            { $match: { situacao: { $ne: 'Estádia encerrada' } } },
            {
                $project: {
                    _id: 1,
                    nome: 1,
                    telefone: 1,
                    acomodacao: 1,
                    preco: 1,
                    check_in_formatado: { $dateToString: { format: "%d/%m %H:%M", date: "$check_in" } },
                    check_out_formatado: { $dateToString: { format: "%d/%m %H:%M", date: "$check_out" } },
                    check_in: 1,
                    check_out: 1,
                    hospedes: 1,
                    dias: 1,
                    situacao: 1,
                    limpeza: 1,
                }
            }
        ]);

        for (let i in data) {

            const check_in = moment(data[i].check_in).format('YYYY-MM-DD H:mm:ss');
            const check_out = moment(data[i].check_out).format('YYYY-MM-DD H:mm:ss');
            const now = moment().format('YYYY-MM-DD H:mm:ss');

            let object;

            if (check_out <= now) object = { situacao: 'Estádia encerrada' };
            else if (check_in <= now) object = { situacao: 'Estádia em andamento' };
            else {
                object = { situacao: moment(data[i].check_in).diff(moment(), 'days') + ' dias' };
            }

            await Reservas.updateOne({ _id: data[i]._id }, object)

        }

        res.json({ data })

    } catch (e) {
        console.log(e);
    }
})

app.delete('/reservas/:id', async (req, res) => {
    try {

        await Reservas.deleteOne(({ _id: new Types.ObjectId(req.params.id) }))

        const data = await Reservas.aggregate([
            { $match: {} },
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
            },
            { $sort: { situacao: 1 } }
        ]);

        res.json(data)

    } catch (e) {
        console.log(e);
    }
})


app.put('/situacao-limpeza/:id', async (req, res) => {

    try {

        const limpeza = req.body.limpeza === 'Feita' ? 'Pendente' : 'Feita';

        await Reservas.updateOne({ _id: new Types.ObjectId(req.params.id) }, { limpeza })

        const data = await Reservas.aggregate([
            { $match: {} },
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
            },
            { $sort: { situacao: 1 } }
        ]);

        res.json(data)

    } catch (e) {
        console.log(e);
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})