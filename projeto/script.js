class Fraction {
    constructor(numerator, denominator = 1) {
        if (denominator === 0) {
            throw new Error("Denominador não pode ser zero");
        }
        
        this.num = numerator;
        this.den = denominator;
        this.simplify();
    }

    static gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b !== 0) {
            let temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    simplify() {
        if (this.num === 0) {
            this.den = 1;
            return;
        }
        
        let gcd = Fraction.gcd(this.num, this.den);
        this.num = this.num / gcd;
        this.den = this.den / gcd;
        
        if (this.den < 0) {
            this.num = -this.num;
            this.den = -this.den;
        }
    }

    add(other) {
        if (typeof other === 'number') {
            other = new Fraction(other);
        }
        
        let newNum = this.num * other.den + other.num * this.den;
        let newDen = this.den * other.den;
        return new Fraction(newNum, newDen);
    }

    multiply(other) {
        if (typeof other === 'number') {
            other = new Fraction(other);
        }
        
        return new Fraction(this.num * other.num, this.den * other.den);
    }

    divide(other) {
        if (typeof other === 'number') {
            other = new Fraction(other);
        }
        
        return new Fraction(this.num * other.den, this.den * other.num);
    }

    negate() {
        return new Fraction(-this.num, this.den);
    }

    isZero() {
        return this.num === 0;
    }

    toString() {
        if (this.den === 1) {
            return this.num.toString();
        }
        return `${this.num}/${this.den}`;
    }

    toDecimal() {
        return this.num / this.den;
    }
}

let currentSize = 4;
let matrix = [];
let constants = [];

function generateMatrix() {
    currentSize = parseInt(document.getElementById('matrixSize').value);
    
    let html = '<div class="matrix-input">';
    html += '<h3>Digite os valores da matriz:</h3>';
    html += '<div class="matrix-table">';
    html += '<table>';
    
    // Cabeçalho
    html += '<tr><th>Linha</th>';
    for (let j = 0; j < currentSize; j++) {
        html += `<th>A${j+1}</th>`;
    }
    html += '<th>Resultado</th></tr>';
    
    // Linhas da matriz
    for (let i = 0; i < currentSize; i++) {
        html += `<tr><td><strong>L${i+1}</strong></td>`;
        for (let j = 0; j < currentSize; j++) {
            html += `<td><input type="number" step="any" id="a${i}${j}" value="${i === j ? 1 : i + j + 1}"></td>`;
        }
        html += `<td><input type="number" step="any" id="b${i}" value="${10 - i}"></td></tr>`;
    }
    
    html += '</table>';
    html += '</div>';
    html += '</div>';
    
    document.getElementById('matrixInput').innerHTML = html;
    document.getElementById('solveBtn').style.display = 'inline-block';
}

function readMatrix() {
    matrix = [];
    constants = [];
    
    for (let i = 0; i < currentSize; i++) {
        matrix[i] = [];
        for (let j = 0; j < currentSize; j++) {
            let value = parseFloat(document.getElementById(`a${i}${j}`).value) || 0;
            matrix[i][j] = new Fraction(value);
        }
        let constValue = parseFloat(document.getElementById(`b${i}`).value) || 0;
        constants[i] = new Fraction(constValue);
    }
}

function findPivot(matrix, constants, currentStep) {
    for (let i = currentStep; i < matrix.length; i++) {
        if (!matrix[i][currentStep].isZero()) {
            return i;
        }
    }
    return -1;
}

function swapRows(matrix, constants, row1, row2) {
    if (row1 !== row2) {
        [matrix[row1], matrix[row2]] = [matrix[row2], matrix[row1]];
        [constants[row1], constants[row2]] = [constants[row2], constants[row1]];
        return true;
    }
    return false;
}

function copyMatrix(matrix) {
    return matrix.map(row => row.map(val => new Fraction(val.num, val.den)));
}

function copyConstants(constants) {
    return constants.map(val => new Fraction(val.num, val.den));
}

function solveSystem() {
    readMatrix();
    
    let workMatrix = copyMatrix(matrix);
    let workConstants = copyConstants(constants);
    let steps = [];
    
    // Etapa inicial (rodada k=0)
    steps.push({
        step: 0,
        matrix: copyMatrix(workMatrix),
        constants: copyConstants(workConstants),
        pivot: null,
        multipliers: [],
        swapped: false,
        description: "Matriz Original"
    });

    for (let k = 0; k < currentSize - 1; k++) {
        // Determinar o pivô da rodada k (elemento A[k][k])
        let pivotElement = workMatrix[k][k];
        
        // Verificar se precisa trocar linhas
        let swapped = false;
        let pivotRow = k;
        
        if (pivotElement.isZero()) {
            // Procurar linha com elemento não-zero na posição k
            for (let i = k + 1; i < currentSize; i++) {
                if (!workMatrix[i][k].isZero()) {
                    swapRows(workMatrix, workConstants, k, i);
                    pivotRow = i;
                    swapped = true;
                    pivotElement = workMatrix[k][k];
                    break;
                }
            }
            
            if (pivotElement.isZero()) {
                alert("Sistema não possui solução única (pivot zero encontrado)");
                return;
            }
        }
        
        let multipliers = [];
        
        // Calcular multiplicadores para as linhas que serão processadas
        // Na rodada k, processamos linhas k+1, k+2, ..., n-1
        for (let i = k + 1; i < currentSize; i++) {
            // M(i, k+1) = -A(i, k+1) / A(k+1, k+1)
            // Em termos de índices base 0: M(i, k) = -A[i][k] / A[k][k]
            let multiplier = workMatrix[i][k].divide(pivotElement).negate();
            multipliers.push({ row: i, multiplier: multiplier });
        }
        
        // Criar uma cópia da matriz atual para preservar os valores da rodada k-1
        let previousMatrix = copyMatrix(workMatrix);
        let previousConstants = copyConstants(workConstants);
        
        // Aplicar a fórmula CORRIGIDA: A(i,j)(rodada k) = A(i,j)(rodada k-1) + A(k+1,j)(rodada k-1) * M(i, k+1)
        // Processar apenas as linhas k+1 em diante
        for (let mult of multipliers) {
            let i = mult.row; // linha atual
            let m = mult.multiplier;
            
            // Para cada elemento da linha i
            for (let j = 0; j < currentSize; j++) {
                // A(i,j)(rodada k) = A(i,j)(rodada k-1) + A(k,j)(rodada k-1) * M
                let currentElement = previousMatrix[i][j]; // A(i,j) da rodada k-1
                let pivotRowElement = previousMatrix[k][j]; // A(k,j) da rodada k-1 (linha do pivô)
                workMatrix[i][j] = currentElement.add(pivotRowElement.multiply(m));
            }
            
            // Aplicar também para as constantes
            let currentConstant = previousConstants[i]; // B(i) da rodada k-1
            let pivotRowConstant = previousConstants[k]; // B(k) da rodada k-1 (linha do pivô)
            workConstants[i] = currentConstant.add(pivotRowConstant.multiply(m));
        }
        
        steps.push({
            step: k + 1,
            matrix: copyMatrix(workMatrix),
            constants: copyConstants(workConstants),
            pivot: pivotElement,
            multipliers: multipliers,
            swapped: swapped,
            pivotRow: pivotRow,
            currentRow: k,
            description: `Rodada k = ${k + 1}, Pivô = ${pivotElement.toString()}`
        });
    }
    
    displayResults(steps);
}

function displayResults(steps) {
    let html = '<h2>Resolução Passo a Passo</h2>';
    
    for (let i = 0; i < steps.length; i++) {
        let step = steps[i];
        html += '<div class="step">';
        
        if (i === 0) {
            html += '<h3>Rodada k = 0 (Matriz Original)</h3>';
        } else {
            html += `<h3>${step.description}</h3>`;
            
            if (step.swapped) {
                html += `<p style="color: #e53e3e; font-weight: bold;">⚠️ Linhas ${step.currentRow + 1} e ${step.pivotRow + 1} foram trocadas para evitar pivô zero</p>`;
            }
            
            // Mostrar a fórmula corrigida
            if (step.multipliers.length > 0) {
                html += '<p style="margin: 10px 0; color: #4a5568;"><strong>Fórmula aplicada:</strong> A(i,j)(rodada k) = A(i,j)(rodada k-1) + A(k+1,j)(rodada k-1) * M(i, k+1)</p>';
            }
        }
        
        html += '<div class="step-matrix">';
        html += '<table>';
        
        for (let row = 0; row < step.matrix.length; row++) {
            html += '<tr>';
            html += `<td style="font-weight: bold;">L${row + 1}</td>`;
            html += '<td>[</td>';
            
            for (let col = 0; col < step.matrix[row].length; col++) {
                let cellClass = '';
                // Destacar o pivô
                if (i > 0 && row === step.currentRow && col === step.currentRow) {
                    cellClass = 'pivot';
                }
                // Destacar elementos zerados
                if (step.matrix[row][col].isZero() && row > col) {
                    cellClass += ' style="color: #38a169; font-weight: bold;"';
                }
                
                html += `<td class="${cellClass}">${step.matrix[row][col].toString()}</td>`;
                if (col < step.matrix[row].length - 1) {
                    html += '<td>+</td>';
                }
            }
            
            html += '<td>]</td>';
            html += '<td>=</td>';
            html += `<td>${step.constants[row].toString()}</td>`;
            
            // Mostrar multiplicadores
            if (i > 0 && step.multipliers.length > 0) {
                let mult = step.multipliers.find(m => m.row === row);
                if (mult) {
                    html += `<td class="multiplier">M${row + 1}${step.currentRow + 1} = -A(${row + 1},${step.currentRow + 1})/A(${step.currentRow + 1},${step.currentRow + 1}) = ${mult.multiplier.toString()}</td>`;
                }
            }
            
            html += '</tr>';
        }
        
        html += '</table>';
        html += '</div>';
        
        // Mostrar detalhes dos cálculos se não for a primeira rodada
        if (i > 0 && step.multipliers.length > 0) {
            html += '<div style="margin-top: 15px; padding: 10px; background: #edf2f7; border-radius: 5px;">';
            html += '<h4>Detalhes dos Cálculos:</h4>';
            
            for (let mult of step.multipliers) {
                html += `<p><strong>Linha ${mult.row + 1}:</strong> Elementos calculados usando A(k+1,j) da Linha ${step.currentRow + 1} (linha do pivô) com multiplicador ${mult.multiplier.toString()}</p>`;
            }
            html += '</div>';
        }
        
        html += '</div>';
    }
    
    // Mostrar matriz final triangular superior
    let finalStep = steps[steps.length - 1];
    html += '<div class="step" style="border-left-color: #38a169; background: #f0fff4;">';
    html += `<h3>✅ Resultado Final - Rodada k = ${finalStep.step}</h3>`;
    html += '<div class="step-matrix">';
    html += '<table>';
    
    for (let i = 0; i < finalStep.matrix.length; i++) {
        html += '<tr>';
        html += `<td style="font-weight: bold;">L${i + 1}</td>`;
        html += '<td>[</td>';
        
        for (let j = 0; j < finalStep.matrix[i].length; j++) {
            let value = finalStep.matrix[i][j];
            let cellClass = '';
            
            if (i > j && !value.isZero()) {
                cellClass = 'style="background: #fed7d7;"';
            } else if (i === j && !value.isZero()) {
                cellClass = 'style="background: #c6f6d5; font-weight: bold;"';
            } else if (value.isZero()) {
                cellClass = 'style="color: #38a169; font-weight: bold;"';
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
    html += '<p style="margin-top: 15px; color: #38a169;"><strong>Matriz transformada em forma triangular superior!</strong> Todos os elementos abaixo da diagonal principal foram eliminados usando a fórmula corrigida.</p>';
    html += '</div>';
    
    document.getElementById('results').innerHTML = html;
}

// Gerar matriz inicial
window.onload = function() {
    generateMatrix();
};