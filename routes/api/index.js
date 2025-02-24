const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const auth = require('../../controllers/api/auth')
const reservas = require('../../controllers/api/reservas')
const anuncios = require('../../controllers/api/anuncios')
const despesas = require('../../controllers/api/despesas')

// middleware that is specific to this router
router.use(async (req, res, next) => {

    if (!req.headers.authorization) res.status(401).json({ message: 'Usuário não autorizado.' });
    else {

        const token = req.headers.authorization.replace('Bearer ', '')

        if (!token) res.status(401).json({ message: 'Usuário não autorizado.' });
        else {
            const encrypt = await bcrypt.compare(token, '$2b$10$d8EqgGNK3D8O8wlE6Vou7e0NhhO5dHw5mpYxpaMOxYZq8Y0ucx.oO');
            if (!encrypt) res.status(401).json({ message: 'Usuário não autorizado.' });
        }
        
    }

    next()

})

router.post('/auth', auth.login);

router.post('/reservas', reservas.store);
router.put('/reservas/:id', reservas.update);
router.delete('/reservas/:id', reservas.destroy);
router.post('/situacao', reservas.situacao);

router.get('/anuncios', anuncios.index);
router.post('/anuncios', anuncios.store);
router.delete('/anuncios/:id', anuncios.destroy);

router.get('/despesas', despesas.index);
router.post('/despesas', despesas.store);
router.delete('/despesas/:id', despesas.destroy);
router.get('/download', despesas.download);

module.exports = router