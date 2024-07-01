const express = require('express');
const bodyParser = require('body-parser');


const app = express();
const PORT = 3000;

// Middleware para interpretar JSON
app.use(bodyParser.json());

// Middleware de validação
function validarSaque(req, res, next) {
  const { valor } = req.body;

  if (!Number.isInteger(valor) || valor <= 0) {
    return res.status(400).json({ error: 'Valor inválido, Digite um número positivo' });
  }

  if (valor % 5 !== 0 || valor % 2 !== 0) {
    return res.status(400).json({ error: 'Valor não pode ser atendido com as cédulas disponíveis, digite um valor múltiplo de 5 e 2' });
  }

  next();
}

// Middleware de tratamento de erros
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocorreu um erro interno no servidor' });
}

// Array das cédulas disponíveis em ordem decrescente
const CEDULAS = [100, 50, 20, 10, 5, 2];

// Quantidade de cédulas disponíveis para cada valor
const QUANTIDADE_CEDULAS = {
  100: 20,
  50: 30,
  20: 40,
  10: 50,
  5: 100,
  2: 200
};

/**
 * Função para calcular a menor quantidade de cédulas necessárias para um saque.
 * @param {number} valor - Valor do saque desejado.
 * @returns {object} Objeto contendo a quantidade de cada cédula necessária.
 * @throws {Error} Se o valor não puder ser atendido com as cédulas disponíveis.
 */
function calcularSaque(valor) {
  const resultado = {};
  let restante = valor;
  const cedulasUsadas = {};

  const totalDisponivel = CEDULAS.reduce((acc, cedula) => {
    return acc + (cedula * QUANTIDADE_CEDULAS[cedula]);
  }, 0);

  if (valor > totalDisponivel) {
    throw new Error('O valor ultrapassa a quantidade de notas disponíveis');
  }

  for (let cedula of CEDULAS) {
    const quantidadeNecessaria = Math.floor(restante / cedula);
    const quantidadeDisponivel = QUANTIDADE_CEDULAS[cedula];

    if (quantidadeNecessaria > quantidadeDisponivel) {
      cedulasUsadas[cedula] = quantidadeDisponivel;
      restante -= quantidadeDisponivel * cedula;
    } else {
      cedulasUsadas[cedula] = quantidadeNecessaria;
      restante -= quantidadeNecessaria * cedula;
    }
  }

  if (restante > 0) {
    throw new Error('Valor não pode ser atendido com as cédulas disponíveis, digite um valor múltiplo de 5 e 2');
  }

  for (let cedula of CEDULAS) {
    QUANTIDADE_CEDULAS[cedula] -= cedulasUsadas[cedula];
  }

  return cedulasUsadas;
}

// Endpoint para realizar o saque
app.post('/api/saque', validarSaque, (req, res, next) => {
  const { valor } = req.body;

  try {
    const resultado = calcularSaque(valor);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
});

// Endpoint para ver as quantidades de notas disponíveis
app.get('/api/cedulas', (req, res) => {
  res.json(QUANTIDADE_CEDULAS);
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  if (err.message === 'O valor ultrapassa a quantidade de notas disponíveis' ||
      err.message === 'Valor não pode ser atendido com as cédulas disponíveis, digite um valor múltiplo de 5 e 2') {
    res.status(400).json({ error: err.message });
  } else {
    errorHandler(err, req, res, next);
  }
});

// Iniciando o servidor na porta especificada
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
