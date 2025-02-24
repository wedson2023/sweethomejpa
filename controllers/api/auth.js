const bcrypt = require('bcrypt');

exports.login = async (req, res) => {

    const { login, password } = req.body;

    const encrypt = await bcrypt.compare(password, '$2b$10$gUJP3d.KzL8os./DJBbOwe6AwTClU4Wfk/Mu6Zty6L6HUEU8oOAAG');

    if(!login == 'adriana' || !encrypt) res.status(401).json({ message: 'Usuário não autorizado.' });
    else res.json({ message: 'Usuário autorizado.', token: '$2b$10$d8EqgGNK3D8O8wlE6Vou7e0NhhO5dHw5mpYxpaMOxYZq8Y0ucx.oO' });

} 