// Elementos do DOM
const functionInput = document.getElementById('functionInput');
const searchMinInput = document.getElementById('searchMin');
const searchMaxInput = document.getElementById('searchMax');
const validateBtn = document.getElementById('validateBtn');
const clearBtn = document.getElementById('clearBtn');
const messageDiv = document.getElementById('message');
const resultsDiv = document.getElementById('results');

// Event Listeners
validateBtn.addEventListener('click', findRootIntervals);
clearBtn.addEventListener('click', clearFields);
functionInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        findRootIntervals();
    }
});
searchMinInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        findRootIntervals();
    }
});
searchMaxInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        findRootIntervals();
    }
});

// Função principal que encontra intervalos com raízes usando Teorema de Bolzano
function findRootIntervals() {
    const input = functionInput.value.trim();
    const searchMin = parseFloat(searchMinInput.value) || -10;
    const searchMax = parseFloat(searchMaxInput.value) || 10;

    // Validação da função
    if (!input) {
        showMessage('Por favor, insira uma função para encontrar as raízes.', 'error');
        hideResults();
        return;
    }

    // Validação da faixa de busca
    if (searchMin >= searchMax) {
        showMessage('A faixa mínima deve ser menor que a faixa máxima.', 'error');
        hideResults();
        return;
    }

    try {
        const maxDegree = findMaxDegree(input);
        
        if (maxDegree > 5) {
            showMessage(
                `⚠️ Função inválida! Potência máxima: x^${maxDegree}. Use funções até 5º grau.`,
                'error'
            );
            hideResults();
            return;
        } else if (maxDegree === -1) {
            showMessage('⚠️ Formato de função inválido. Verifique a sintaxe.', 'error');
            hideResults();
            return;
        }

        // Converte a função para uma forma avaliável
        const evalFunction = createEvaluableFunction(input);
        
        // Aplica Teorema de Bolzano para encontrar intervalos
        const intervals = applyBolzanoTheorem(evalFunction, searchMin, searchMax);
        
        if (intervals.length === 0) {
            showMessage(
                `✅ Função válida (grau ${maxDegree}), mas nenhuma raiz encontrada na faixa [${searchMin}, ${searchMax}]. Tente expandir a faixa de busca.`,
                'success'
            );
            showNoRootsResult();
        } else {
            showMessage(
                `🎯 Análise concluída! Encontrados ${intervals.length} intervalos com mudança de sinal (Teorema de Bolzano).`,
                'success'
            );
            showResults(intervals);
        }

    } catch (error) {
        showMessage('⚠️ Erro ao processar a função: ' + error.message, 'error');
        hideResults();
    }
}

// Função que aplica o Teorema de Bolzano
function applyBolzanoTheorem(evalFunc, min, max) {
    const intervals = [];
    const step = 0.1; // Passo para busca (refinável)
    
    let x1 = min;
    
    while (x1 < max) {
        let x2 = x1 + step;
        if (x2 > max) x2 = max;
        
        try {
            const f1 = evalFunc(x1);
            const f2 = evalFunc(x2);
            
            // Teorema de Bolzano: f(a) * f(b) < 0 indica mudança de sinal
            if (!isNaN(f1) && !isNaN(f2) && f1 * f2 < 0) {
                intervals.push({
                    start: Math.round(x1 * 10) / 10,
                    end: Math.round(x2 * 10) / 10,
                    fStart: f1,
                    fEnd: f2
                });
            }
        } catch (e) {
            // Ignora pontos onde a função não pode ser avaliada
        }
        
        x1 = x2;
    }
    
    return intervals;
}

// Converte string da função matemática para função JavaScript avaliável
function createEvaluableFunction(functionStr) {
    // Remove espaços e converte para minúsculo
    let func = functionStr.replace(/\s+/g, '').toLowerCase();
    
    // Substitui padrões matemáticos por JavaScript válido
    func = func.replace(/\^/g, '**');                    // x^2 → x**2
    func = func.replace(/(\d)([a-z])/g, '$1*$2');       // 2x → 2*x
    func = func.replace(/([a-z])(\d)/g, '$1*$2');       // x2 → x*2 (caso raro)
    func = func.replace(/([a-z])\(/g, '$1*(');          // x( → x*(
    func = func.replace(/\)([a-z])/g, ')*$1');          // )x → )*x
    
    // Retorna função que avalia a expressão
    return function(x) {
        try {
            // Substitui 'x' pelo valor numérico
            const expression = func.replace(/x/g, `(${x})`);
            // Avalia a expressão matematicamente
            return eval(expression);
        } catch (error) {
            throw new Error('Erro na avaliação da função');
        }
    };
}

// Função para validar grau da função (reutilizada do código anterior)
function findMaxDegree(functionStr) {
    let func = functionStr.replace(/\s+/g, '').toLowerCase();
    
    const powerRegex = /[+-]?[0-9]*\.?[0-9]*\*?x\*\*([0-9]+)/g;
    const linearRegex = /[+-]?[0-9]*\.?[0-9]*\*?x(?!\*)/g;
    
    let maxDegree = -1;
    let hasValidTerms = false;
    
    let match;
    while ((match = powerRegex.exec(func)) !== null) {
        const degree = parseInt(match[1]);
        maxDegree = Math.max(maxDegree, degree);
        hasValidTerms = true;
    }
    
    if (linearRegex.test(func)) {
        maxDegree = Math.max(maxDegree, 1);
        hasValidTerms = true;
    }
    
    if (!hasValidTerms) {
        const constantRegex = /^[+-]?[0-9]*\.?[0-9]+$/;
        if (constantRegex.test(func)) {
            maxDegree = 0;
            hasValidTerms = true;
        }
    }
    
    return hasValidTerms ? Math.max(maxDegree, 0) : -1;
}

// Exibe os resultados dos intervalos encontrados
function showResults(intervals) {
    resultsDiv.style.display = 'block';
    
    let html = '<h3>🎯 Intervalos com Raízes (Teorema de Bolzano)</h3>';
    
    intervals.forEach((interval, index) => {
        html += `
            <div class="root-interval">
                <div class="interval-label">
                    I${index + 1}: [${interval.start}; ${interval.end}] → x${index + 1} = ?
                </div>
                <div class="function-values">
                    f(${interval.start}) = ${interval.fStart.toFixed(4)} | 
                    f(${interval.end}) = ${interval.fEnd.toFixed(4)} | 
                    Sinais opostos ✓
                </div>
            </div>
        `;
    });
    
    html += `
        <div style="margin-top: 15px; padding: 10px; background: #e8f5e8; border-radius: 8px; border-left: 4px solid #4caf50;">
            <strong>📋 Próximos passos:</strong> Use o método da bisseção em cada intervalo para encontrar as raízes com precisão desejada.
        </div>
    `;
    
    resultsDiv.innerHTML = html;
}

// Exibe mensagem quando não há raízes
function showNoRootsResult() {
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `
        <h3>🔍 Resultado da Busca</h3>
        <div class="no-roots">
            ❌ Nenhuma raiz encontrada na faixa especificada
            <br><small>Tente expandir a faixa de busca ou verificar se a função possui raízes reais</small>
        </div>
    `;
}

// Esconde a área de resultados
function hideResults() {
    resultsDiv.style.display = 'none';
}

// Função para exibir mensagens
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('show');
    
    setTimeout(() => {
        messageDiv.classList.add('show');
    }, 10);
    
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.classList.remove('show');
        }, 8000);
    }
}

// Limpa todos os campos
function clearFields() {
    functionInput.value = '';
    searchMinInput.value = '-10';
    searchMaxInput.value = '10';
    messageDiv.classList.remove('show');
    hideResults();
    functionInput.focus();
}

// Foco inicial
window.addEventListener('load', () => {
    functionInput.focus();
});

// Função de teste para o console
function testBolzano(func, min = -10, max = 10) {
    console.log(`🧪 Testando: ${func} em [${min}, ${max}]`);
    try {
        const evalFunc = createEvaluableFunction(func);
        const intervals = applyBolzanoTheorem(evalFunc, min, max);
        console.log(`📊 Encontrados ${intervals.length} intervalos:`);
        intervals.forEach((int, i) => {
            console.log(`  I${i+1}: [${int.start}, ${int.end}] | f(${int.start})=${int.fStart.toFixed(4)} | f(${int.end})=${int.fEnd.toFixed(4)}`);
        });
    } catch (error) {
        console.log(`❌ Erro: ${error.message}`);
    }
    console.log('---');
}

// Exemplos de teste
/*
testBolzano('x^3-9*x+3');     // Exemplo do usuário
testBolzano('x^2-4');         // Raízes em ±2  
testBolzano('x^3-x');         // Raízes em 0, ±1
testBolzano('x^2+1');         // Sem raízes reais
*/