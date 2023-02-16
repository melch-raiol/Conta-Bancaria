const validatePassword = (req, res, next) => {
    const { senha_banco } = req.query;

    if (senha_banco !== 'Cubos123Bank') return res.status(401).json({ message: "senha do banco é inválida!" });

    next();
};

module.exports = validatePassword;