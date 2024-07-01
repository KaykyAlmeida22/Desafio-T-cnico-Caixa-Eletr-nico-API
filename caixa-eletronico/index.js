// Importa o módulo express para criar um servidor web
const express = require('express');
// Importa o módulo body-parser para lidar com dados JSON no corpo das requisições
const bodyParser = require('body-parser');

// Cria uma instância do aplicativo Express
const app = express();
// Define a porta na qual o servidor vai escutar
const PORT = 3000;

// Middleware para interpretar JSON no corpo das requisições
app.use(bodyParser.json());

// Middleware de validação para verificar se o valor do saque é válido
function validarSaque(req, res, next) {
  const { valor } = req.body; // Obtém o valor do corpo da requisição

  // Verifica se o valor é um número inteiro positivo
  if (!Number.isInteger(valor) || valor <= 0) {
    return res.status(400).json({ error: 'Valor inválido, Digite um número positivo' });
  }

  // Verifica se o valor é múltiplo de 5 e de 2
  if (valor % 5 !== 0 || valor % 2 !== 0) {
    return res.status(400).json({ error: 'Valor não pode ser atendido com as cédulas disponíveis, digite um valor múltiplo de 5 e 2' });
  }

  next(); // Passa para o próximo middleware ou rota
}

// Middleware de tratamento de erros para capturar e responder a erros internos do servidor
function errorHandler(err, req, res, next) {
  console.error(err.stack); // Loga o erro no console
  res.status(500).json({ error: 'Ocorreu um erro interno no servidor' }); // Retorna uma resposta de erro
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
  const resultado = {}; // Objeto para armazenar o resultado
  let restante = valor; // Valor restante a ser sacado
  const cedulasUsadas = {}; // Objeto para armazenar as cédulas usadas

  // Calcula o total de dinheiro disponível
  const totalDisponivel = CEDULAS.reduce((acc, cedula) => {
    return acc + (cedula * QUANTIDADE_CEDULAS[cedula]);
  }, 0);

  // Verifica se o valor do saque é maior que o total disponível
  if (valor > totalDisponivel) {
    throw new Error('O valor ultrapassa a quantidade de notas disponíveis');
  }

  // Percorre o array de cédulas
  for (let cedula of CEDULAS) {
    const quantidadeNecessaria = Math.floor(restante / cedula); // Calcula a quantidade necessária de cédulas
    const quantidadeDisponivel = QUANTIDADE_CEDULAS[cedula]; // Obtém a quantidade disponível de cédulas

    // Verifica se a quantidade necessária é maior que a disponível
    if (quantidadeNecessaria > quantidadeDisponivel) {
      cedulasUsadas[cedula] = quantidadeDisponivel; // Usa todas as cédulas disponíveis
      restante -= quantidadeDisponivel * cedula; // Subtrai do valor restante
    } else {
      cedulasUsadas[cedula] = quantidadeNecessaria; // Usa a quantidade necessária de cédulas
      restante -= quantidadeNecessaria * cedula; // Subtrai do valor restante
    }
  }

  // Se ainda restar valor, lança um erro
  if (restante > 0) {
    throw new Error('Valor não pode ser atendido com as cédulas disponíveis, digite um valor múltiplo de 5 e 2');
  }

  // Atualiza a quantidade de cédulas disponíveis
  for (let cedula of CEDULAS) {
    QUANTIDADE_CEDULAS[cedula] -= cedulasUsadas[cedula];
  }

  return cedulasUsadas; // Retorna o objeto com as cédulas usadas
}

// Endpoint para realizar o saque
app.post('/api/saque', validarSaque, (req, res, next) => {
  const { valor } = req.body; // Obtém o valor do corpo da requisição

  try {
    const resultado = calcularSaque(valor); // Calcula o saque
    res.json(resultado); // Retorna o resultado como resposta
  } catch (error) {
    next(error); // Passa o erro para o middleware de tratamento de erros
  }
});

// Endpoint para ver as quantidades de notas disponíveis
app.get('/api/cedulas', (req, res) => {
  res.json(QUANTIDADE_CEDULAS); // Retorna as quantidades de cédulas disponíveis
});

// Middleware de tratamento de erros para capturar e responder a erros específicos
app.use((err, req, res, next) => {
  // Verifica se o erro é um dos erros específicos
  if (err.message === 'O valor ultrapassa a quantidade de notas disponíveis' ||
      err.message === 'Valor não pode ser atendido com as cédulas disponíveis, digite um valor múltiplo de 5 e 2') {
    res.status(400).json({ error: err.message }); // Retorna uma resposta de erro específico
  } else {
    errorHandler(err, req, res, next); // Passa o erro para o middleware de tratamento de erros interno
  }
});

// Inicia o servidor na porta especificada
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`); // Loga a mensagem indicando que o servidor está rodando
});
