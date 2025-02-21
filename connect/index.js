const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/sweethomejpa')
    .then(() => console.log('Banco de dados mongo rodando.'))
    .catch(e => console.log(e.message));

module.exports = mongoose;