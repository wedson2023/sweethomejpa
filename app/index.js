const express = require('express')
const handlebars = require('express-handlebars');
const cors = require('cors')
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

mongoose.connect('mongodb://localhost/sweethomejpa')
    .then(() => console.log('Banco de dados mongo rodando.'))
    .catch(e => console.log(e.message));

app.get('/', (req, res) => {
    res.render('home');
});

const { Schema } = mongoose;

const schema = new Schema({
    nome: String,
    telefone: String,
    acomodacao: String,
    preco: Number,
    check_in: Date,
    check_out: Date,
    hospedes: Number
});

const Reservas = mongoose.model('reservas', schema);

app.get('/reservas', async (req, res) => {

    try {

        const reservas = await Reservas.aggregate([
            { $match: {} },
            {
                $project: {
                    _id: 0,
                    nome: 1,
                    telefone: 1,
                    acomodacao: 1,
                    preco: 1,
                    check_in: { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$check_in" } },
                    check_out: { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$check_out" } },
                    hospedes: 1,
                }
            }
        ]);
        
        res.json(reservas)
    } catch (e) {
        console.log(e);
    }
})

app.post('/cadastrar', async (req, res) => {

    const { nome, telefone, acomodacao, preco, check_in, check_out, hospedes } = req.body;

    try {
        await Reservas.create({ nome, telefone, acomodacao, preco, check_in, check_out, hospedes });
    } catch (e) {
        console.log(e);
    }

    res.json({ message: 'ok' })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})