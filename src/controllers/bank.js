let { contas, saques, depositos, transferencias } = require('../bancodedados');
const { format } = require('date-fns');

let idNewBankAccount = 1;

const dateAndTime = () => {
    const date = new Date();

    return (format(date, "yyyy-MM-dd k:m:ss"));
};

const confirmData = (res, nome, cpf, data_nascimento, telefone, email, senha) => {

    if (!nome) return res.status(400).json({ mensagem: "o nome é obrigatório" });
    if (!cpf) return res.status(400).json({ mensagem: "o CPF é obrigatório" });
    if (!data_nascimento) return res.status(400).json({ mensagem: "a data de nascimento é obrigatório" });
    if (!telefone) return res.status(400).json({ mensagem: "o número de telefone é obrigatório" });
    if (!email) return res.status(400).json({ mensagem: "o email é obrigatório" });
    if (!senha) return res.status(400).json({ mensagem: "o senha é obrigatório" });
};

const listAccountBank = (req, res) => {

    return res.status(200).json({ contas });
};

const creatingBankAccount = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    confirmData(res, nome, cpf, data_nascimento, telefone, email, senha);

    const foundCPF = contas.find(conta => conta.usuario.cpf === cpf);

    if (foundCPF) return res.status(400).json({ mensagem: "CPF já existente, por favor cadastrar outro cpf" });

    const foundEmail = contas.find(conta => conta.usuario.email === email);

    if (foundEmail) return res.status(400).json({ mensagem: "Email já existente, por favor cadastrar outro email" });

    const newBankAccount = {
        numero: idNewBankAccount,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    };

    contas.push(newBankAccount);

    idNewBankAccount++;

    return res.status(201).json({ message: "cadastro feito" });
};

const updateBankAccount = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    confirmData(res, nome, cpf, data_nascimento, telefone, email, senha);

    const account = contas.find(conta => conta.numero === Number(req.params.numeroConta));

    if (!account) return res.status(404).json({ message: "conta não encontrada" });

    account.usuario = {
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha
    };

    return res.status(204).send();
};

const deleteBankAccaount = (req, res) => {

    const account = contas.find(conta => conta.numero === Number(req.params.numeroConta));

    if (!account) return res.status(404).json({ message: "conta não encontrada" });

    if (account.saldo !== 0) return res.status(400).json({ message: "A conta só pode ser removida se o saldo for zero!" });

    contas = contas.filter(conta => conta.numero !== Number(req.params.numeroConta));

    return res.status(204).send();
};

const depositInBankAccount = (req, res) => {
    const { numeroConta } = req.params;
    const { valor } = req.body;

    if (!numeroConta) return res.status(404).json({ message: "número da conta é obrigatório" });
    if (!valor) return res.status(404).json({ message: "valor a depositar é obrigatório" });
    if (valor < 0) return res.status(404).json({ message: "valor a depositar tem que ser positivo" });

    let account = contas.find(conta => conta.numero === Number(numeroConta));

    if (!account) return res.status(404).json({ message: "conta não encontrada" });


    account.saldo += valor;

    depositos = [{
        data: dateAndTime(),
        conta: account.numero,
        deposito: valor
    }];

    return res.status(201).json({ message: "depósito feito!" });
};

const withdrawBankAccount = (req, res) => {
    const { numeroConta } = req.params;
    const { senha, valorSacar } = req.body;

    if (!numeroConta) return res.status(404).json({ message: "número da conta é obrigatório" });
    if (!senha) return res.status(400).json({ mensagem: "o senha é obrigatório" });
    if (!valorSacar) return res.status(400).json({ mensagem: "o valor a sacar é obrigatório" });

    let account = contas.find(conta => conta.numero === Number(numeroConta));

    if (!account) return res.status(404).json({ message: "conta não encontrada" });
    if (senha !== Number(account.usuario.senha)) return res.status(404).json({ message: "senha inválida" });
    if (account.saldo < valorSacar) return res.status(404).json({ message: "saldo insuficiente para sacar" });

    account.saldo -= valorSacar;

    saques = [{
        data: dateAndTime(),
        conta: account.numero,
        saque: valorSacar,
    }];

    return res.status(200).json();
};

const bankAccountTransfer = (req, res) => {
    const { numeroContaOrigem, senhaOrigem, numeroContaDestino, valorTransferir } = req.body;

    if (!numeroContaOrigem) return res.status(404).json({ message: "é obrigatório número da conta de origem" });
    if (!senhaOrigem) return res.status(404).json({ message: "é obrigatório a senha de origem" });
    if (!numeroContaDestino) return res.status(404).json({ message: "é obrigatório número da conta de destino" });
    if (!valorTransferir) return res.status(404).json({ message: "é obrigatório o valor a transferir" });

    let originAccount = contas.find(conta => conta.numero === Number(numeroContaOrigem));

    if (!originAccount) return res.status(404).json({ message: "conta de origem não encontrada" });

    let targetAccount = contas.find(conta => conta.numero === Number(numeroContaDestino));

    if (!targetAccount) return res.status(404).json({ message: "conta de destino não encontrada" });

    if (originAccount.usuario.senha !== senhaOrigem) return res.status(404).json({ message: "senha inválida" });
    if (originAccount.saldo < Number(valorTransferir)) return res.status(404).json({ message: "saldo insuficiente" });;

    originAccount.saldo -= valorTransferir;
    targetAccount.saldo += Number(valorTransferir);

    transferencias = [{
        data: dateAndTime(),
        numero_conta_origem: numeroContaOrigem,
        numero_conta_destino: numeroContaDestino,
        valorTranferência: valorTransferir,
    }];

    return res.status(201).json();
};

const bankAccountBalance = (req, res) => {
    const { numeroConta, senha } = req.params;

    if (!numeroConta) return res.status(404).json({ message: "número da conta é obrigatório" });
    if (!senha) return res.status(400).json({ mensagem: "o senha é obrigatório" });

    let account = contas.find(conta => conta.numero === Number(req.params.numeroConta));

    if (!account) return res.status(404).json({ message: "conta não encontrada" });
    if (Number(senha) !== Number(account.usuario.senha)) return res.status(404).json({ message: "senha inválida" });

    let accountActual = {
        conta: account.numero,
        nome: account.usuario.nome,
        saldo: account.saldo
    };

    return res.status(201).json(accountActual);
};

const bankStatement = (req, res) => {
    const { numeroConta, senha } = req.params;

    if (!numeroConta) return res.status(404).json({ message: "número da conta é obrigatório" });
    if (!senha) return res.status(400).json({ mensagem: "o senha é obrigatório" });

    let account = contas.find(conta => conta.numero === Number(req.params.numeroConta));

    if (!account) return res.status(404).json({ message: "conta não encontrada" });
    if (Number(senha) !== Number(account.usuario.senha)) return res.status(404).json({ message: "senha inválida" });

    let statementActual = {
        conta: account.numero,
        nome: account.usuario.nome,
        saldo: account.saldo,
        saques,
        depositos,
        transferencias
    }


    return res.status(201).json(statementActual);
};

module.exports = {
    listAccountBank,
    creatingBankAccount,
    updateBankAccount,
    deleteBankAccaount,
    depositInBankAccount,
    withdrawBankAccount,
    bankAccountTransfer,
    bankAccountBalance,
    bankStatement
};