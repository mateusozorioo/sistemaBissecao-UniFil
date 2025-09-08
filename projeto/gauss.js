/**
 * CLASSE FRACTION - Implementa operações com frações para evitar erros de ponto flutuante
 * Esta classe é essencial para manter precisão nos cálculos do método de Gauss
 */
class Fraction {
    /**
     * Construtor da classe Fraction
     * @param {number} numerator - O numerador da fração
     * @param {number} denominator - O denominador da fração (padrão = 1)
     */
    constructor(numerator, denominator = 1) {
        // Validação: denominador não pode ser zero (divisão por zero é indefinida)
        if (denominator === 0) {
            throw new Error("Denominador não pode ser zero");
        }
        
        // Inicializa os atributos da fração
        this.num = numerator;    // numerador
        this.den = denominator;  // denominador
        this.simplify();         // simplifica automaticamente a fração
    }

    /**
     * Método estático para calcular o Máximo Divisor Comum (MDC)
     * Usa o algoritmo de Euclides para encontrar o MDC de dois números
     * @param {number} a - primeiro número
     * @param {number} b - segundo número
     * @returns {number} - o MDC de a e b
     */
    static gcd(a, b) {
        a = Math.abs(a);  // garante que 'a' seja positivo
        b = Math.abs(b);  // garante que 'b' seja positivo
        
        // Algoritmo de Euclides: enquanto b não for zero
        while (b !== 0) {
            let temp = b;     // guarda o valor de b
            b = a % b;        // b recebe o resto da divisão de a por b
            a = temp;         // a recebe o valor anterior de b
        }
        return a;  // quando b = 0, a contém o MDC
    }

    /**
     * Simplifica a fração dividindo numerador e denominador pelo MDC
     * Também garante que o denominador seja sempre positivo
     */
    simplify() {
        // Se numerador é zero, a fração é 0/1
        if (this.num === 0) {
            this.den = 1;
            return;
        }
        
        // Calcula o MDC entre numerador e denominador
        let gcd = Fraction.gcd(this.num, this.den);
        
        // Divide ambos pelo MDC para simplificar
        this.num = this.num / gcd;
        this.den = this.den / gcd;
        
        // Se denominador é negativo, move o sinal para o numerador
        // Isso padroniza a representação (ex: -3/-4 vira 3/4)
        if (this.den < 0) {
            this.num = -this.num;  // inverte sinal do numerador
            this.den = -this.den;  // torna denominador positivo
        }
    }

    /**
     * Soma esta fração com outra fração ou número
     * @param {Fraction|number} other - fração ou número a ser somado
     * @returns {Fraction} - nova fração com o resultado da soma
     */
    add(other) {
        // Se 'other' é um número, converte para fração
        if (typeof other === 'number') {
            other = new Fraction(other);
        }
        
        // Fórmula: a/b + c/d = (a*d + c*b)/(b*d)
        let newNum = this.num * other.den + other.num * this.den;  // numerador resultante
        let newDen = this.den * other.den;                        // denominador resultante
        return new Fraction(newNum, newDen);  // retorna nova fração simplificada
    }

    /**
     * Multiplica esta fração por outra fração ou número
     * @param {Fraction|number} other - fração ou número a ser multiplicado
     * @returns {Fraction} - nova fração com o resultado da multiplicação
     */
    multiply(other) {
        // Se 'other' é um número, converte para fração
        if (typeof other === 'number') {
            other = new Fraction(other);
        }
        
        // Fórmula: a/b * c/d = (a*c)/(b*d)
        return new Fraction(this.num * other.num, this.den * other.den);
    }

    /**
     * Divide esta fração por outra fração ou número
     * @param {Fraction|number} other - fração ou número divisor
     * @returns {Fraction} - nova fração com o resultado da divisão
     */
    divide(other) {
        // Se 'other' é um número, converte para fração
        if (typeof other === 'number') {
            other = new Fraction(other);
        }
        
        // Fórmula: a/b ÷ c/d = a/b * d/c = (a*d)/(b*c)
        // Multiplica pelo inverso da segunda fração
        return new Fraction(this.num * other.den, this.den * other.num);
    }

    /**
     * Retorna o negativo desta fração
     * @returns {Fraction} - nova fração com sinal oposto
     */
    negate() {
        return new Fraction(-this.num, this.den);  // nega apenas o numerador
    }

    /**
     * Verifica se a fração é igual a zero
     * @returns {boolean} - true se a fração for zero, false caso contrário
     */
    isZero() {
        return this.num === 0;  // fração é zero quando numerador é zero
    }

    /**
     * Converte a fração para string para exibição
     * @returns {string} - representação textual da fração
     */
    toString() {
        // Se denominador é 1, mostra apenas o numerador
        if (this.den === 1) {
            return this.num.toString();
        }
        // Caso contrário, mostra no formato "numerador/denominador"
        return `${this.num}/${this.den}`;
    }

    /**
     * Converte a fração para número decimal
     * @returns {number} - valor decimal da fração
     */
    toDecimal() {
        return this.num / this.den;  // divisão simples para obter decimal
    }
}

/**
 * VARIÁVEIS GLOBAIS
 */
let currentSize = 4;    // tamanho atual da matriz (padrão 4x4)
let matrix = [];        // matriz de coeficientes do sistema linear
let constants = [];     // vetor de constantes (lado direito das equações)

/**
 * Gera a interface HTML para entrada da matriz
 * Cria uma tabela dinâmica baseada no tamanho escolhido pelo usuário
 */
function generateMatrix() {
    // Lê o tamanho escolhido pelo usuário no campo de input
    currentSize = parseInt(document.getElementById('matrixSize').value);
    
    // Inicia a construção do HTML
    let html = '<div class="matrix-input">';
    html += '<h3>Digite os valores da matriz:</h3>';
    html += '<div class="matrix-table">';
    html += '<table>';
    
    // Cria o cabeçalho da tabela
    html += '<tr><th>Linha</th>';  // primeira coluna para identificar as linhas
    
    // Adiciona colunas para cada variável (A1, A2, A3, ...)
    for (let j = 0; j < currentSize; j++) {
        html += `<th>A${j+1}</th>`;  // cabeçalho das colunas das variáveis
    }
    html += '<th>Resultado</th></tr>';  // última coluna para as constantes
    
    // Cria as linhas da matriz com campos de input
    for (let i = 0; i < currentSize; i++) {
        html += `<tr><td><strong>L${i+1}</strong></td>`;  // identificador da linha
        
        // Cria campos de input para os coeficientes da linha i
        for (let j = 0; j < currentSize; j++) {
            // Valor padrão: 1 na diagonal principal, senão i+j+1
            let defaultValue = i === j ? 1 : i + j + 1;
            html += `<td><input type="number" step="any" id="a${i}${j}" value="${defaultValue}"></td>`;
        }
        
        // Campo para a constante da equação (lado direito)
        // Valor padrão: 10-i (para criar um exemplo interessante)
        html += `<td><input type="number" step="any" id="b${i}" value="${10 - i}"></td></tr>`;
    }
    
    // Fecha a tabela e a div
    html += '</table>';
    html += '</div>';
    html += '</div>';
    
    // Insere o HTML gerado na página
    document.getElementById('matrixInput').innerHTML = html;
    
    // Torna o botão de resolver visível
    document.getElementById('solveBtn').style.display = 'inline-block';
}

/**
 * Lê os valores da matriz inseridos pelo usuário nos campos de input
 * Converte os valores para objetos Fraction para manter precisão
 */
function readMatrix() {
    matrix = [];      // reinicia a matriz
    constants = [];   // reinicia o vetor de constantes
    
    // Percorre cada linha da matriz
    for (let i = 0; i < currentSize; i++) {
        matrix[i] = [];  // inicializa a linha i como array vazio
        
        // Percorre cada coluna da linha i
        for (let j = 0; j < currentSize; j++) {
            // Lê o valor do campo input correspondente
            let value = parseFloat(document.getElementById(`a${i}${j}`).value) || 0;
            // Converte para Fraction e armazena na matriz
            matrix[i][j] = new Fraction(value);
        }
        
        // Lê a constante da equação i (lado direito)
        let constValue = parseFloat(document.getElementById(`b${i}`).value) || 0;
        // Converte para Fraction e armazena no vetor de constantes
        constants[i] = new Fraction(constValue);
    }
}

/**
 * Encontra uma linha adequada para ser usada como pivô
 * Procura por um elemento não-zero na coluna currentStep a partir da linha currentStep
 * @param {Fraction[][]} matrix - matriz de coeficientes
 * @param {Fraction[]} constants - vetor de constantes
 * @param {number} currentStep - coluna/linha atual sendo processada
 * @returns {number} - índice da linha com pivô válido, ou -1 se não encontrar
 */
function findPivot(matrix, constants, currentStep) {
    // Procura da linha currentStep até a última linha
    for (let i = currentStep; i < matrix.length; i++) {
        // Se o elemento matrix[i][currentStep] não é zero, pode ser pivô
        if (!matrix[i][currentStep].isZero()) {
            return i;  // retorna o índice da linha com pivô válido
        }
    }
    return -1;  // retorna -1 se não encontrou pivô válido
}

/**
 * Troca duas linhas da matriz e do vetor de constantes
 * @param {Fraction[][]} matrix - matriz de coeficientes
 * @param {Fraction[]} constants - vetor de constantes
 * @param {number} row1 - índice da primeira linha
 * @param {number} row2 - índice da segunda linha
 * @returns {boolean} - true se houve troca, false se as linhas são iguais
 */
function swapRows(matrix, constants, row1, row2) {
    // Só troca se as linhas forem diferentes
    if (row1 !== row2) {
        // Troca as linhas da matriz usando destructuring assignment
        [matrix[row1], matrix[row2]] = [matrix[row2], matrix[row1]];
        // Troca as constantes correspondentes
        [constants[row1], constants[row2]] = [constants[row2], constants[row1]];
        return true;  // indica que houve troca
    }
    return false;  // indica que não houve troca
}

/**
 * Cria uma cópia profunda da matriz
 * Necessário porque Fraction é um objeto, então precisamos criar novas instâncias
 * @param {Fraction[][]} matrix - matriz original
 * @returns {Fraction[][]} - cópia independente da matriz
 */
function copyMatrix(matrix) {
    // Para cada linha, cria uma nova linha com novas instâncias de Fraction
    return matrix.map(row => row.map(val => new Fraction(val.num, val.den)));
}

/**
 * Cria uma cópia profunda do vetor de constantes
 * @param {Fraction[]} constants - vetor original
 * @returns {Fraction[]} - cópia independente do vetor
 */
function copyConstants(constants) {
    // Cria novas instâncias de Fraction para cada constante
    return constants.map(val => new Fraction(val.num, val.den));
}

/**
 * FUNÇÃO PRINCIPAL - Resolve o sistema linear usando eliminação de Gauss
 * Implementa o algoritmo passo a passo, salvando cada etapa para visualização
 */
function solveSystem() {
    readMatrix();  // lê a matriz da interface
    
    // Cria cópias de trabalho para não modificar as originais
    let workMatrix = copyMatrix(matrix);
    let workConstants = copyConstants(constants);
    let steps = [];  // array para armazenar cada passo da resolução
    
    // Salva o estado inicial (rodada k=0)
    steps.push({
        step: 0,                                    // número da rodada
        matrix: copyMatrix(workMatrix),             // cópia da matriz atual
        constants: copyConstants(workConstants),    // cópia das constantes atuais
        pivot: null,                               // não há pivô na rodada inicial
        multipliers: [],                           // não há multiplicadores na rodada inicial
        swapped: false,                            // não houve troca de linhas
        description: "Matriz Original"             // descrição da rodada
    });

    // Loop principal: executa currentSize-1 rodadas de eliminação
    // (uma matriz n×n precisa de n-1 rodadas para triangularização)
    for (let k = 0; k < currentSize - 1; k++) {
        // PASSO 1: Identifica o pivô da rodada k
        // O pivô é o elemento A[k][k] (diagonal principal)
        let pivotElement = workMatrix[k][k];
        
        // PASSO 2: Verifica se o pivô é zero
        let swapped = false;   // flag para indicar se houve troca
        let pivotRow = k;      // linha onde está o pivô atual
        
        // Se o pivô é zero, precisa trocar linhas
        if (pivotElement.isZero()) {
            // Procura uma linha abaixo com elemento não-zero na coluna k
            for (let i = k + 1; i < currentSize; i++) {
                if (!workMatrix[i][k].isZero()) {
                    // Encontrou linha com elemento não-zero, faz a troca
                    swapRows(workMatrix, workConstants, k, i);
                    pivotRow = i;           // salva qual linha foi trocada
                    swapped = true;         // marca que houve troca
                    pivotElement = workMatrix[k][k];  // atualiza o pivô
                    break;  // para a busca
                }
            }
            
            // Se após a busca o pivô ainda é zero, o sistema não tem solução única
            if (pivotElement.isZero()) {
                alert("Sistema não possui solução única (pivot zero encontrado)");
                return;  // interrompe a execução
            }
        }
        
        // PASSO 3: Calcula os multiplicadores para a rodada k
        let multipliers = [];
        
        // Na rodada k, processamos as linhas k+1, k+2, ..., n-1
        // Para cada linha i abaixo da linha do pivô:
        for (let i = k + 1; i < currentSize; i++) {
            // Calcula o multiplicador M(i,k) = -A[i][k] / A[k][k]
            // O sinal negativo é para zerar o elemento A[i][k]
            let multiplier = workMatrix[i][k].divide(pivotElement).negate();
            
            // Salva o multiplicador para documentação
            multipliers.push({ 
                row: i,                 // linha que será modificada
                multiplier: multiplier  // valor do multiplicador
            });
        }
        
        // PASSO 4: Preserva o estado atual antes das modificações
        // Isso é importante para aplicar corretamente a fórmula de Gauss
        let previousMatrix = copyMatrix(workMatrix);
        let previousConstants = copyConstants(workConstants);
        
        // PASSO 5: Aplica a fórmula de eliminação de Gauss
        // Fórmula: A[i][j]_novo = A[i][j]_anterior + M[i][k] * A[k][j]_anterior
        // Processa cada linha que precisa ser modificada
        for (let mult of multipliers) {
            let i = mult.row;        // índice da linha atual
            let m = mult.multiplier; // multiplicador para esta linha
            
            // Aplica a fórmula para cada elemento da linha i
            for (let j = 0; j < currentSize; j++) {
                // A[i][j]_novo = A[i][j]_anterior + A[k][j]_anterior * multiplicador
                let currentElement = previousMatrix[i][j];    // elemento atual A[i][j]
                let pivotRowElement = previousMatrix[k][j];   // elemento da linha pivô A[k][j]
                
                // Calcula o novo valor usando a fórmula de Gauss
                workMatrix[i][j] = currentElement.add(pivotRowElement.multiply(m));
            }
            
            // Aplica a mesma fórmula para as constantes (lado direito)
            let currentConstant = previousConstants[i];   // constante atual B[i]
            let pivotRowConstant = previousConstants[k];  // constante da linha pivô B[k]
            
            // Calcula a nova constante
            workConstants[i] = currentConstant.add(pivotRowConstant.multiply(m));
        }
        
        // PASSO 6: Salva o estado após a rodada k
        steps.push({
            step: k + 1,                               // número da rodada (k+1)
            matrix: copyMatrix(workMatrix),            // matriz após eliminação
            constants: copyConstants(workConstants),   // constantes após eliminação
            pivot: pivotElement,                       // elemento pivô usado
            multipliers: multipliers,                  // multiplicadores calculados
            swapped: swapped,                          // se houve troca de linhas
            pivotRow: pivotRow,                        // linha original do pivô
            currentRow: k,                             // linha atual do pivô
            description: `Rodada k = ${k + 1}, Pivô = ${pivotElement.toString()}`
        });
    }
    
    // Exibe os resultados na interface
    displayResults(steps);
}

/**
 * Exibe os resultados passo a passo na interface web
 * Cria uma visualização detalhada de cada rodada do algoritmo
 * @param {Array} steps - array com todos os passos da eliminação
 */
function displayResults(steps) {
    let html = '<h2>Resolução Passo a Passo</h2>';
    
    // Percorre cada passo salvo durante a resolução
    for (let i = 0; i < steps.length; i++) {
        let step = steps[i];  // passo atual
        html += '<div class="step">';  // container para o passo
        
        // CABEÇALHO DO PASSO
        if (i === 0) {
            // Primeiro passo: matriz original
            html += '<h3>Rodada k = 0 (Matriz Original)</h3>';
        } else {
            // Passos seguintes: mostrar descrição da rodada
            html += `<h3>${step.description}</h3>`;
            
            // Se houve troca de linhas, destacar com aviso
            if (step.swapped) {
                html += `<p style="color: #e53e3e; font-weight: bold;">⚠️ Linhas ${step.currentRow + 1} e ${step.pivotRow + 1} foram trocadas para evitar pivô zero</p>`;
            }
            
            // Mostrar a fórmula matemática aplicada
            if (step.multipliers.length > 0) {
                html += '<p style="margin: 10px 0; color: #4a5568;"><strong>Fórmula aplicada:</strong> A(i,j)(rodada k) = A(i,j)(rodada k-1) + A(k+1,j)(rodada k-1) * M(i, k+1)</p>';
            }
        }
        
        // VISUALIZAÇÃO DA MATRIZ
        html += '<div class="step-matrix">';
        html += '<table>';
        
        // Para cada linha da matriz
        for (let row = 0; row < step.matrix.length; row++) {
            html += '<tr>';
            html += `<td style="font-weight: bold;">L${row + 1}</td>`;  // identificador da linha
            html += '<td>[</td>';  // delimitador esquerdo
            
            // Para cada elemento da linha
            for (let col = 0; col < step.matrix[row].length; col++) {
                let cellClass = '';
                
                // Destaca o pivô usado na rodada
                if (i > 0 && row === step.currentRow && col === step.currentRow) {
                    cellClass = 'pivot';  // classe CSS para destacar pivô
                }
                
                // Destaca elementos que foram zerados (triangularização)
                if (step.matrix[row][col].isZero() && row > col) {
                    cellClass += ' style="color: #38a169; font-weight: bold;"';
                }
                
                // Adiciona o elemento com formatação apropriada
                html += `<td class="${cellClass}">${step.matrix[row][col].toString()}</td>`;
                
                // Adiciona '+' entre elementos (exceto o último)
                if (col < step.matrix[row].length - 1) {
                    html += '<td>+</td>';
                }
            }
            
            html += '<td>]</td>';  // delimitador direito
            html += '<td>=</td>';  // sinal de igualdade
            html += `<td>${step.constants[row].toString()}</td>`;  // constante da equação
            
            // MOSTRAR MULTIPLICADORES
            // Se não é o primeiro passo e há multiplicadores
            if (i > 0 && step.multipliers.length > 0) {
                // Procura se há multiplicador para esta linha
                let mult = step.multipliers.find(m => m.row === row);
                if (mult) {
                    // Mostra a fórmula do multiplicador
                    html += `<td class="multiplier">M${row + 1}${step.currentRow + 1} = -A(${row + 1},${step.currentRow + 1})/A(${step.currentRow + 1},${step.currentRow + 1}) = ${mult.multiplier.toString()}</td>`;
                }
            }
            
            html += '</tr>';
        }
        
        html += '</table>';
        html += '</div>';
        
        // DETALHES DOS CÁLCULOS
        // Mostra explicação detalhada dos cálculos (exceto primeira rodada)
        if (i > 0 && step.multipliers.length > 0) {
            html += '<div style="margin-top: 15px; padding: 10px; background: #edf2f7; border-radius: 5px;">';
            html += '<h4>Detalhes dos Cálculos:</h4>';
            
            // Para cada multiplicador, explica como foi usado
            for (let mult of step.multipliers) {
                html += `<p><strong>Linha ${mult.row + 1}:</strong> Elementos calculados usando A(k+1,j) da Linha ${step.currentRow + 1} (linha do pivô) com multiplicador ${mult.multiplier.toString()}</p>`;
            }
            html += '</div>';
        }
        
        html += '</div>';  // fecha o container do passo
    }
    
    // RESULTADO FINAL
    // Destaca a matriz triangular superior resultante
    let finalStep = steps[steps.length - 1];  // último passo
    html += '<div class="step" style="border-left-color: #38a169; background: #f0fff4;">';
    html += `<h3>✅ Resultado Final - Rodada k = ${finalStep.step}</h3>`;
    html += '<div class="step-matrix">';
    html += '<table>';
    
    // Mostra a matriz final com cores diferenciadas
    for (let i = 0; i < finalStep.matrix.length; i++) {
        html += '<tr>';
        html += `<td style="font-weight: bold;">L${i + 1}</td>`;
        html += '<td>[</td>';
        
        for (let j = 0; j < finalStep.matrix[i].length; j++) {
            let value = finalStep.matrix[i][j];
            let cellClass = '';
            
            // Elementos abaixo da diagonal que não foram zerados (erro)
            if (i > j && !value.isZero()) {
                cellClass = 'style="background: #fed7d7;"';  // vermelho claro
            } 
            // Elementos da diagonal principal (pivôs)
            else if (i === j && !value.isZero()) {
                cellClass = 'style="background: #c6f6d5; font-weight: bold;"';  // verde claro
            } 
            // Elementos zerados (sucesso da eliminação)
            else if (value.isZero()) {
                cellClass = 'style="color: #38a169; font-weight: bold;"';  // verde
            }
            
            html += `<td ${cellClass}>${value.toString()}</td>`;
            if (j < finalStep.matrix[i].length - 1) {
                html += '<td>+</td>';
            }
        }
        
        html += '<td>]</td>';
        html += '<td>=</td>';
        html += `<td style="font-weight: bold;">${finalStep.constants[i].toString()}</td>`;
        html += '</tr>';
    }
    
    html += '</table>';
    html += '</div>';
    
    // Mensagem de sucesso
    html += '<p style="margin-top: 15px; color: #38a169;"><strong>Matriz transformada em forma triangular superior!</strong> Todos os elementos abaixo da diagonal principal foram eliminados usando a fórmula corrigida.</p>';
    html += '</div>';
    
    // Insere todo o HTML gerado na página
    document.getElementById('results').innerHTML = html;
}

/**
 * INICIALIZAÇÃO
 * Gera a matriz inicial quando a página é carregada
 */
window.onload = function() {
    generateMatrix();  // cria interface inicial com matriz 4x4
};