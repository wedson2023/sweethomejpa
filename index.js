const express = require('express')
const handlebars = require('express-handlebars');
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path');

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'))

app.use(express.static('public'))

app.use(cors())

const app_routes = require('./routes/app');
const api_routes = require('./routes/api');

app.get('/', (req, res) => {
    res.render('login', { layout: false });
});

app.use('/app/', app_routes);
app.use('/api/', api_routes);

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`)
})