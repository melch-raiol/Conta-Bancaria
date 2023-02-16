const express = require('express');
const {
    listAccountBank,
    creatingBankAccount,
    updateBankAccount,
    deleteBankAccaount,
    depositInBankAccount,
    withdrawBankAccount,
    bankAccountTransfer,
    bankAccountBalance,
    bankStatement
} = require('./controllers/bank');

const route = express();

route.get('/contas', listAccountBank);
route.post('/contas', creatingBankAccount);
route.put('/contas/:numeroConta', updateBankAccount);
route.delete('/contas/:numeroConta', deleteBankAccaount);
route.post('/transacoes/depositar/:numeroConta', depositInBankAccount);
route.post('/transacoes/sacar/:numeroConta', withdrawBankAccount);
route.post('/transacoes/transferir', bankAccountTransfer);
route.get('/contas/saldo/:numeroConta/:senha', bankAccountBalance);
route.get('/contas/extrato/:numeroConta/:senha', bankStatement);

module.exports = route;