# Desafio Técnico Morada.ai: Caixa Eletrônico API


## Descrição
Esta API simula o funcionamento de um caixa eletrônico. Ela recebe um valor de saque desejado e retorna a quantidade de cédulas de cada valor necessárias para compor esse saque, utilizando a menor quantidade de cédulas possível. As cédulas consideradas são: 100, 50, 20, 10, 5 e 2.

## Funcionamento

Basicamente o programa funciona num servidor express/node.js recebendo um valor de Saque através de uma requisição POST e devolvendo uma saida Endpoint, no entanto, resolvi adicionar mais um Endpoint para conferência da quantidade de cédulas restantes de cada tipo (200,100, etc..), esse através de uma requisição GET. O programa conta com 3 funções Middleware, uma para tratamento de erros, uma para interpretação do arquivo json e uma para validação.

 **Endpoint para saque**:
   - **Entrada**: Valor do saque desejado.
   - **Saída**: Quantidade de cédulas de cada valor.

## Formato do Endpoint

- **URL**: `/api/saque`
- **Método**: POST
- **Entrada** (JSON):
  ```json
  {
    "valor": 380
  }
  ```
- **Saída** (JSON):
  ```json
  {
    "100": 3,
    "50": 1,
    "20": 1,
    "10": 1,
    "5": 0,
    "2": 0
  }
  ```
   **Endpoint para conferência de notas**:
   - **Entrada**: Nenhuma.
   - **Saída**: Quantidade de cédulas restantes de cada valor.

## Formato do Endpoint

- **URL**: `/api/cedulas`
- **Método**: GET
- **Entrada** (JSON):
  ```json
  ```
- **Saída** (JSON):
  ```json
  {
    "100": 20,
    "50": 30,
    "20": 40,
    "10": 50,
    "5": 100,
    "2": 200
  }
  ```

## Validações Implementadas

1. **Tratamento de Entradas Inválidas**: Garantir que o valor inserido é um número inteiro positivo.
2. **Eficiência na Distribuição de Cédulas**: Implementar uma lógica que sempre retorne a menor quantidade de cédulas possível.
3. **Erros e Exceções**: Se o valor digitado for maior do que a quantidade de notas disponíveis, se o valor digitado não for multiplo de 5 ou mútiplo de 2 (que significa que não pode ser sacado com as notas disponíveis, números terminados em 1 e 3)


## Testes para Validação de lógica

 Quantidade de Notas para os Testes
 100 = 20 notas
 50 = 30 notas
 20 = 40 notas
 10 = 50 notas
 5 = 100 notas
 2 = 200 notas

  #Entrada com números negativos

- **Requisição**:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"valor": -5}' http://localhost:3000/api/saque
  ```
- **Resposta**:
  ```json
  {
    "error":"Valor inválido, Digite um número positivo"
  }
  ```
  #Entrada com número 0
  - **Requisição**:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"valor": 0}' http://localhost:3000/api/saque
  ```
- **Resposta**:
  ```json
  {
    "error":"Valor inválido, Digite um número positivo"
  }
  ```
  #Entrada com número positivo
  - **Requisição**:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"valor": 1000}' http://localhost:3000/api/saque
  ```
- **Resposta**:
  ```json
  {
    "2":0,
    "5":0,
    "10":0,
    "20":0,
    "50":0,
    "100":10
  }
  ```
    #Entrada com número positivo novamente(para acabar as notas de 100)
  - **Requisição**:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"valor": 1000}' http://localhost:3000/api/saque
  ```
- **Resposta**:
  ```json
  {
    "2":0,
    "5":0,
    "10":0,
    "20":0,
    "50":0,
    "100":10
  }
  ```
    #Aqui foi feito uma requisição GET para saber a quantidade de cédulas disponíveis, podemos ver que não há mais notas de 100.
  - **Requisição**:
  ```bash
  curl -X GET -H "Content-Type: application/json" http://localhost:3000/api/cedulas
  ```
- **Resposta**:
  ```json
   {
    "100": 0,
    "50": 30,
    "20": 40,
    "10": 50,
    "5": 100,
    "2": 200
  }
  ```
  #Agora que as notas de 100 acabaram, a API vai passar a utilizar as outras notas mantendo a menor quantidade de cédulas possível.
  - **Requisição**:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"valor": 1000}' http://localhost:3000/api/saque
  ```
- **Resposta**:
  ```json
  {
     "100": 0,
     "50": 20,
     "20": 0,
     "10": 0,
     "5": 0,
     "2": 0
  }
  ```
  - **Requisição**:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"valor": 1000}' http://localhost:3000/api/saque
  ```
- **Resposta**:
  ```json
  {
     "100": 0,
     "50": 10,
     "20": 25,
     "10": 0,
     "5": 0,
     "2": 0
  }
  ```
  - **Requisição**:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"valor": 1000}' http://localhost:3000/api/saque
  ```
- **Resposta**:
  ```json
  {
     "100": 0,
     "50": 0,
     "20": 15,
     "10": 50,
     "5": 40,
     "2": 0
  }
  ```
  #Agora não há mais notas o suficiente para sacar o valor de 1000
  - **Requisição**:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"valor": 1000}' http://localhost:3000/api/saque
  ```
- **Resposta**:
  ```json
  {
     "error":"O valor ultrapassa a quantidade de notas disponíveis"
  }
  ```
  #Aqui foi feito o teste de envio de números que as cédulas não conseguem suprir( terminados em 1 e 3, pois não existe cédulas com valor 1)
  - **Requisição**:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"valor": 11}' http://localhost:3000/api/saque
  ```
- **Resposta**:
  ```json
  {
     "error":"Valor não pode ser atendido com as cédulas disponíveis, digite um valor múltiplo de 5 e 2"
  }
  ```
  - **Requisição**:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"valor": 13}' http://localhost:3000/api/saque
  ```
- **Resposta**:
  ```json
  {
     "error":"Valor não pode ser atendido com as cédulas disponíveis, digite um valor múltiplo de 5 e 2"
  }
  ```
  #Reiniciei o servidor node e fiz o último teste, o que foi dado no exemplo do desafio, "380"
  - **Requisição**:
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"valor": 380}' http://localhost:3000/api/saque
  ```
- **Resposta**:
  ```json
  {
     "100": 3,
     "50": 1,
     "20": 1,
     "10": 1,
     "5": 0,
     "2": 0
  }
  ```
  

## Considerações Finais

O projeto foi desenvolvido para simular um caixa eletrônico simples. A lógica foi otimizada para garantir a menor quantidade de cédulas possíveis para qualquer valor de saque permitido, utilizando diversas validações para melhor robustez do código e 
o código foi totalmente comentado, para melhor compreensão do avaliador ou colaborador.

##Principais Desafios

No projeto em si, não tive muitos problemas. Quando comecei a colocar algumas novas validações comecei a quebrar mais a cabeça, principalmente quando pensei em implementar uma Interface de Usuário e deu muitos problemas, acabei dando ênfase na API
em si do que priorizar uma UI, devido ao tempo.

## Instruções para Execução

Primeiramente o projeto foi contruido utilizando o node.js, então será necessário instalá-lo utilizando o comando npm install no diretório "caixa-eletronico", assim o npm irá instalar todas as depêndencias listadas no arquivo package.json.
Depois das depêndencias instaladas, bastar rodar no terminal o comando "node index.js" para iniciar o servidor.
Logo após, abra o bash no diretório "caixa-eletronico". Para enviar e as requisições utilize o comando :
curl -X POST -H "Content-Type: application/json" -d '{"valor": 1000}' http://localhost:3000/api/saque         //para inserir um valor para saque
curl -X GET -H "Content-Type: application/json" http://localhost:3000/api/cedulas                             //para visualizar a quantidade de notas restantes


