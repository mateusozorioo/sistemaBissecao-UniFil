/**
 * SISTEMA DE DETECÇÃO E CÁLCULO DE ZEROS DE FUNÇÕES - MÉTODO DA BISSEÇÃO
 * 
 * Este sistema implementa o Método da Bisseção para encontrar zeros de funções matemáticas,
 * com a funcionalidade adicional de detectar automaticamente os intervalos onde existem zeros.
 * 
 * Autor: [Seu Nome]
 * Data: [Data]
 */

// ================================================================================================
// FUNÇÃO 1: AVALIAÇÃO DE EXPRESSÕES MATEMÁTICAS
// ================================================================================================

/**
 * Função para avaliar uma expressão matemática em JavaScript
 * Esta função recebe uma string com uma expressão matemática e um valor de x,
 * e retorna o resultado numérico da função f(x)
 * 
 * @param {string} expression - A expressão matemática como string (ex: "x^2 + 3*x - 5")
 * @param {number} x - O valor numérico para substituir na variável x
 * @returns {number} O resultado da avaliação da função f(x)
 * @throws {Error} Caso a expressão seja inválida
 */
function evaluateFunction(expression, x) {
    // ETAPA 1: Conversão de notação matemática para JavaScript
    // Substitui o símbolo ^ por ** (operador de potência em JavaScript)
    // Exemplo: "x^2" se torna "x**2"
    let func = expression.replace(/\^/g, '**');
    
    // ETAPA 2: Substituição segura da variável x
    // Substitui todas as ocorrências de 'x' pelo valor numérico entre parênteses
    // Os parênteses evitam problemas com operadores adjacentes
    // Exemplo: se x=2, "3*x+1" se torna "3*(2)+1"
    func = func.replace(/x/g, `(${x})`);
    
    // ETAPA 3: Avaliação da expressão com tratamento de erros
    try {
        // eval() executa a string como código JavaScript e retorna o resultado
        // Por exemplo: eval("3*(2)+1") retorna 7
        return eval(func);
    } catch (error) {
        // Se houver erro na avaliação (sintaxe inválida, etc.), lança uma exceção personalizada
        throw new Error('Erro na função: ' + error.message);
    }
}

// ================================================================================================
// FUNÇÃO 2: DETECÇÃO DO GRAU DE POLINÔMIOS
// ================================================================================================

/**
 * Função para detectar o grau máximo de um polinômio
 * Analisa a expressão matemática e identifica a maior potência de x presente
 * 
 * @param {string} expression - A expressão matemática a ser analisada
 * @returns {number} O grau máximo encontrado na expressão
 */
function detectPolynomialDegree(expression) {
    // ETAPA 1: Normalização da string
    // Remove todos os espaços em branco e converte para minúsculas para facilitar a análise
    let expr = expression.replace(/\s/g, '').toLowerCase();
    
    // ETAPA 2: Inicialização da variável que armazenará o grau máximo
    let maxDegree = 0;
    
    // ETAPA 3: Busca por padrões de potência explícita (x^n)
    // Utiliza regex para encontrar padrões como "x^2", "x^3", "x^10", etc.
    // O padrão /x\^(\d+)/g significa:
    // - x: letra x literal
    // - \^: símbolo ^ literal (escape necessário)
    // - (\d+): um ou mais dígitos capturados em grupo
    // - g: flag global para encontrar todas as ocorrências
    const powerMatches = expr.match(/x\^(\d+)/g);
    
    // Se foram encontrados padrões de potência
    if (powerMatches) {
        // Itera sobre cada padrão encontrado
        powerMatches.forEach(match => {
            // Extrai o número após o símbolo ^
            // Exemplo: "x^3" → split('^') → ["x", "3"] → pega [1] → "3"
            const degree = parseInt(match.split('^')[1]);
            
            // Atualiza o grau máximo se encontrou um grau maior
            if (degree > maxDegree) maxDegree = degree;
        });
    }
    
    // ETAPA 4: Verificação de x sem expoente explícito (grau 1)
    // Se a expressão contém 'x' mas nenhuma potência foi detectada,
    // significa que existe pelo menos um termo de grau 1
    if (expr.includes('x') && maxDegree === 0) {
        maxDegree = 1;
    }
    
    // Retorna o grau máximo detectado
    return maxDegree;
}

// ================================================================================================
// FUNÇÃO 3: DETECÇÃO AUTOMÁTICA DE ZEROS (ALGORITMO PRINCIPAL)
// ================================================================================================

/**
 * Função principal para detectar automaticamente os intervalos onde existem zeros
 * Implementa o algoritmo de busca por mudança de sinais em um intervalo especificado
 */
function detectZeros() {
    // ETAPA 1: Obtenção do elemento HTML onde serão exibidos os resultados
    const zerosResultsDiv = document.getElementById('zerosResults');
    
    // ETAPA 2: Tratamento de erros com try-catch
    try {
        // ETAPA 3: Coleta dos parâmetros de entrada da interface
        const funcExpression = document.getElementById('function').value;        // Expressão da função
        const searchRange = parseFloat(document.getElementById('searchRange').value); // Intervalo [-range, +range]
        const stepSize = parseFloat(document.getElementById('stepSize').value);       // Tamanho do passo
        
        // ETAPA 4: Validação da entrada
        if (!funcExpression) {
            throw new Error('Por favor, insira uma função');
        }
        
        // ETAPA 5: Análise do grau da função
        const degree = detectPolynomialDegree(funcExpression);
        
        // ETAPA 6: Inicialização da busca por intervalos
        const intervals = [];           // Array para armazenar intervalos encontrados
        const start = -searchRange;     // Ponto inicial da busca
        const end = searchRange;        // Ponto final da busca
        
        // ETAPA 7: ALGORITMO DE BUSCA POR MUDANÇA DE SINAIS
        // Percorre o intervalo [start, end] com o passo especificado
        for (let x = start; x < end; x += stepSize) {
            try {
                // Calcula f(x) no ponto atual
                const f1 = evaluateFunction(funcExpression, x);
                // Calcula f(x + passo) no próximo ponto
                const f2 = evaluateFunction(funcExpression, x + stepSize);
                
                // CONDIÇÃO 1: Verifica mudança de sinal
                // Se f1 * f2 < 0, significa que os valores têm sinais opostos
                // Pelo Teorema do Valor Intermediário, existe pelo menos uma raiz no intervalo
                if (f1 * f2 < 0) {
                    intervals.push({
                        a: x,                    // Ponto inicial do intervalo
                        b: x + stepSize,         // Ponto final do intervalo
                        fa: f1,                  // Valor da função no ponto inicial
                        fb: f2                   // Valor da função no ponto final
                    });
                }
                // CONDIÇÃO 2: Verifica se encontrou um zero exato
                // Se |f1| é muito pequeno (< 0.0001), consideramos que encontramos um zero
                else if (Math.abs(f1) < 0.0001) {
                    intervals.push({
                        a: x - stepSize/2,       // Cria um pequeno intervalo ao redor do zero
                        b: x + stepSize/2,
                        fa: evaluateFunction(funcExpression, x - stepSize/2),
                        fb: evaluateFunction(funcExpression, x + stepSize/2),
                        exactZero: x             // Marca que encontrou um zero exato
                    });
                }
            } catch (error) {
                // Se a função não pode ser avaliada em algum ponto (ex: divisão por zero),
                // continua para o próximo ponto sem interromper a busca
                continue;
            }
        }
        
        // ETAPA 8: CONSTRUÇÃO DO HTML PARA EXIBIÇÃO DOS RESULTADOS
        let html = '<div class="zeros-detection-section">';
        html += '<h4><i class="fas fa-crosshairs"></i> Detecção Automática de Zeros</h4>';
        
        // Exibe informações sobre o grau da função (se detectado)
        if (degree > 0) {
            html += `<div class="final-result">`;
            html += `<h6><i class="fas fa-info-circle"></i> Análise da Função</h6>`;
            html += `<p><strong>Grau máximo detectado:</strong> ${degree}</p>`;
            html += `<p><strong>Zeros teóricos máximos:</strong> até ${degree} zeros (reais + complexos)</p>`;
            html += `</div>`;
        }
        
        // Exibe informações sobre a busca realizada
        html += `<div class="final-result">`;
        html += `<h6><i class="fas fa-search"></i> Busca no Intervalo [-${searchRange}, ${searchRange}]</h6>`;
        html += `<p><strong>Intervalos encontrados com mudança de sinal:</strong> ${intervals.length}</p>`;
        html += `<p><strong>Passo utilizado:</strong> ${stepSize}</p>`;
        html += `</div>`;
        
        // ETAPA 9: Exibição dos intervalos encontrados
        if (intervals.length > 0) {
            html += '<h6><i class="fas fa-list"></i> Intervalos com Possíveis Zeros:</h6>';
            
            // Itera sobre cada intervalo encontrado
            intervals.forEach((interval, index) => {
                // Calcula o ponto médio (não utilizado atualmente, mas pode ser útil)
                const midPoint = (interval.a + interval.b) / 2;
                
                // Cria um elemento HTML clicável para cada intervalo
                html += `<div class="zero-interval" onclick="selectInterval(${interval.a}, ${interval.b})">`;
                html += `<strong>Intervalo ${index + 1}:</strong> [${interval.a.toFixed(4)}, ${interval.b.toFixed(4)}]<br>`;
                html += `f(${interval.a.toFixed(4)}) = ${interval.fa.toFixed(6)}<br>`;
                html += `f(${interval.b.toFixed(4)}) = ${interval.fb.toFixed(6)}<br>`;
                
                // Se foi encontrado um zero exato, destaca essa informação
                if (interval.exactZero !== undefined) {
                    html += `<span style="color: #ffd700;"><i class="fas fa-star"></i> Zero exato encontrado em x = ${interval.exactZero.toFixed(6)}</span><br>`;
                }
                html += `<small><i class="fas fa-hand-pointer"></i> Clique para usar este intervalo no cálculo</small>`;
                html += `</div>`;
            });
            
            // Adiciona botão para calcular todos os intervalos de uma vez
            html += '<div class="mt-3">';
            html += '<button class="btn btn-calculate" onclick="calculateAllIntervals()">';
            html += '<i class="fas fa-calculator"></i> Calcular Todos os Intervalos';
            html += '</button>';
            html += '</div>';
        } else {
            // ETAPA 10: Caso nenhum intervalo seja encontrado
            html += '<div class="alert alert-warning" style="background: rgba(255, 193, 7, 0.2); border: 1px solid rgba(255, 193, 7, 0.5);">';
            html += '<h6><i class="fas fa-exclamation-triangle"></i> Nenhum Zero Encontrado</h6>';
            html += '<p>Nenhuma mudança de sinal foi detectada no intervalo especificado.</p>';
            html += '<p><strong>Sugestões:</strong></p>';
            html += '<ul>';
            html += '<li>Aumentar o intervalo de busca</li>';
            html += '<li>Diminuir o passo de busca (usar 0.5 ou 0.1)</li>';
            html += '<li>Verificar se a função está correta</li>';
            html += '<li>A função pode não ter zeros reais</li>';
            html += '</ul>';
            html += '</div>';
        }
        
        html += '</div>';
        
        // ETAPA 11: Inserção do HTML gerado na página
        zerosResultsDiv.innerHTML = html;
        
    } catch (error) {
        // ETAPA 12: Tratamento de erros gerais
        zerosResultsDiv.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> <strong>Erro:</strong> ${error.message}</div>`;
    }
}

// ================================================================================================
// FUNÇÃO 4: SELEÇÃO DE INTERVALO ESPECÍFICO
// ================================================================================================

/**
 * Função chamada quando o usuário clica em um intervalo específico
 * Configura o sistema para usar esse intervalo no cálculo manual
 * 
 * @param {number} a - Ponto inicial do intervalo selecionado
 * @param {number} b - Ponto final do intervalo selecionado
 */
function selectInterval(a, b) {
    // ETAPA 1: Remove a seleção visual de todos os intervalos
    // Percorre todos os elementos com classe 'zero-interval' e remove a classe 'selected'
    document.querySelectorAll('.zero-interval').forEach(el => el.classList.remove('selected'));
    
    // ETAPA 2: Adiciona seleção visual ao elemento clicado
    // Usa event.target para identificar o elemento que foi clicado
    // closest() encontra o elemento pai mais próximo com a classe especificada
    event.target.closest('.zero-interval').classList.add('selected');
    
    // ETAPA 3: Preenche automaticamente os campos de entrada
    // Define os valores dos campos 'a' e 'b' com 6 casas decimais de precisão
    document.getElementById('a').value = a.toFixed(6);
    document.getElementById('b').value = b.toFixed(6);
    
    // ETAPA 4: Muda para o modo manual
    // Marca o radio button do modo manual como selecionado
    document.getElementById('modeManual').checked = true;
    // Chama a função para atualizar a interface e mostrar os campos manuais
    toggleInputMode();
}

// ================================================================================================
// FUNÇÃO 5: CÁLCULO EM LOTE DE TODOS OS INTERVALOS
// ================================================================================================

/**
 * Função para calcular o método da bisseção em todos os intervalos encontrados
 * Automatiza o processo de aplicar a bisseção em múltiplos intervalos simultaneamente
 */
function calculateAllIntervals() {
    // ETAPA 1: Extração dos intervalos da interface
    const intervals = [];
    
    // Percorre todos os elementos de intervalo na página
    document.querySelectorAll('.zero-interval').forEach(el => {
        // Obtém o texto completo do elemento
        const text = el.textContent;
        
        // ETAPA 2: Parsing dos valores usando expressão regular
        // Busca por padrão [número, número] no texto
        // ([-\d.]+) captura números (incluindo negativos e decimais)
        const match = text.match(/\[([-\d.]+), ([-\d.]+)\]/);
        
        if (match) {
            // Se encontrou o padrão, adiciona o intervalo ao array
            intervals.push({
                a: parseFloat(match[1]),    // Converte primeiro número capturado
                b: parseFloat(match[2])     // Converte segundo número capturado
            });
        }
    });
    
    // ETAPA 3: Preparação para exibição dos resultados
    const resultsDiv = document.getElementById('results');
    let allHtml = '';
    
    // ETAPA 4: Cálculo da bisseção para cada intervalo
    intervals.forEach((interval, index) => {
        try {
            // Obtém os parâmetros necessários da interface
            const funcExpression = document.getElementById('function').value;
            const tolerance = parseFloat(document.getElementById('tolerance').value);
            
            // Chama o método da bisseção para este intervalo específico
            const result = bisectionMethod(funcExpression, interval.a, interval.b, tolerance);
            
            // ETAPA 5: Construção do HTML para este resultado
            let html = `<div class="result-section" style="margin-top: 1rem;">`;
            html += `<h5><i class="fas fa-chart-line"></i> Resultados - Intervalo ${index + 1} [${interval.a.toFixed(4)}, ${interval.b.toFixed(4)}]</h5>`;
            
            // Verifica se o método convergiu
            if (result.converged) {
                html += '<div class="final-result">';
                html += `<h6><i class="fas fa-bullseye"></i> Raiz encontrada!</h6>`;
                html += `<p><strong>x ≈ ${result.root.toFixed(8)}</strong></p>`;
                html += `<p>f(${result.root.toFixed(8)}) ≈ ${result.finalError.toFixed(10)}</p>`;
                html += `<p>Iterações: ${result.iterations.length}</p>`;
                html += '</div>';
            } else {
                // Se não convergiu, exibe o melhor resultado obtido
                html += '<div class="alert alert-warning" style="background: rgba(255, 193, 7, 0.2);">';
                html += '<h6><i class="fas fa-exclamation-triangle"></i> Máximo de iterações atingido</h6>';
                html += `<p>Melhor aproximação: x ≈ ${result.root.toFixed(8)}</p>`;
                html += `<p>Erro: ${result.finalError.toFixed(10)}</p>`;
                html += '</div>';
            }
            
            html += '</div>';
            allHtml += html;
            
        } catch (error) {
            // ETAPA 6: Tratamento de erros para intervalos específicos
            allHtml += `<div class="error-message">Erro no intervalo ${index + 1}: ${error.message}</div>`;
        }
    });
    
    // ETAPA 7: Exibição de todos os resultados
    resultsDiv.innerHTML = allHtml;
}

// ================================================================================================
// FUNÇÃO 6: MÉTODO DA BISSEÇÃO (ALGORITMO NÚCLEO)
// ================================================================================================

/**
 * Implementação do Método da Bisseção para encontrar raízes de funções
 * Este é o algoritmo matemático principal que implementa o método numérico
 * 
 * @param {string} funcExpression - Expressão matemática da função
 * @param {number} a - Ponto inicial do intervalo
 * @param {number} b - Ponto final do intervalo  
 * @param {number} tolerance - Tolerância para convergência
 * @param {number} maxIterations - Número máximo de iterações (padrão: 100)
 * @returns {Object} Objeto com resultado, iterações e status de convergência
 */
function bisectionMethod(funcExpression, a, b, tolerance, maxIterations = 100) {
    // ETAPA 1: Inicialização das variáveis de controle
    const iterations = [];     // Array para armazenar histórico de iterações
    let iteration = 0;         // Contador de iterações
    
    // ETAPA 2: Verificação pré-requisito do método
    // CONDIÇÃO FUNDAMENTAL: f(a) e f(b) devem ter sinais opostos
    const fa = evaluateFunction(funcExpression, a);
    const fb = evaluateFunction(funcExpression, b);
    
    // Se f(a) * f(b) > 0, ambos têm o mesmo sinal
    // Isso viola o pré-requisito do Teorema do Valor Intermediário
    if (fa * fb > 0) {
        throw new Error('f(a) e f(b) devem ter sinais opostos para garantir que existe uma raiz no intervalo [a,b]');
    }
    
    // ETAPA 3: Inicialização das variáveis do intervalo
    let currentA = a;          // Ponto esquerdo do intervalo atual
    let currentB = b;          // Ponto direito do intervalo atual
    
    // ETAPA 4: LOOP PRINCIPAL DO ALGORITMO DA BISSEÇÃO
    while (iteration < maxIterations) {
        iteration++;
        
        // PASSO 1: Calcula o ponto médio do intervalo
        const c = (currentA + currentB) / 2;
        // Avalia a função no ponto médio
        const fc = evaluateFunction(funcExpression, c);
        
        // PASSO 2: Calcula o erro atual (tamanho do intervalo)
        const currentError = Math.abs(currentB - currentA);
        
        // PASSO 3: Registra informações desta iteração
        iterations.push({
            iteration: iteration,
            a: currentA,
            b: currentB,
            c: c,
            fa: evaluateFunction(funcExpression, currentA),
            fb: evaluateFunction(funcExpression, currentB),
            fc: fc,
            error: currentError
        });
        
        // PASSO 4: CRITÉRIO DE CONVERGÊNCIA
        // Se |f(c)| < tolerância, encontramos uma raiz suficientemente precisa
        if (Math.abs(fc) < tolerance) {
            return {
                root: c,                    // Raiz encontrada
                iterations: iterations,     // Histórico completo
                converged: true,           // Indicador de convergência
                finalError: Math.abs(fc)   // Erro final
            };
        }
        
        // PASSO 5: ESCOLHA DO NOVO INTERVALO
        // Determina qual metade do intervalo contém a raiz
        const faNew = evaluateFunction(funcExpression, currentA);
        
        // Se f(a) e f(c) têm sinais opostos, a raiz está em [a, c]
        if (faNew * fc < 0) {
            currentB = c;              // Novo intervalo: [currentA, c]
        } else {
            // Caso contrário, a raiz está em [c, b]
            currentA = c;              // Novo intervalo: [c, currentB]
        }
        
        // O intervalo é reduzido pela metade a cada iteração
        // Isso garante convergência linear do método
    }
    
    // ETAPA 5: CASO DE NÃO CONVERGÊNCIA
    // Se chegou aqui, o máximo de iterações foi atingido sem convergência
    return {
        root: (currentA + currentB) / 2,    // Melhor aproximação obtida
        iterations: iterations,             // Histórico de iterações
        converged: false,                   // Não convergiu
        finalError: Math.abs(evaluateFunction(funcExpression, (currentA + currentB) / 2))
    };
}

// ================================================================================================
// FUNÇÃO 7: INTERFACE DE CÁLCULO INDIVIDUAL
// ================================================================================================

/**
 * Função para calcular a bisseção de um intervalo específico (modo manual)
 * Interface principal para o usuário executar o método da bisseção
 */
function calculateBisection() {
    // ETAPA 1: Obtém o elemento HTML para exibição dos resultados
    const resultsDiv = document.getElementById('results');
    
    // ETAPA 2: Tratamento de erros com try-catch
    try {
        // ETAPA 3: Coleta dos parâmetros da interface do usuário
        const funcExpression = document.getElementById('function').value;
        const a = parseFloat(document.getElementById('a').value);
        const b = parseFloat(document.getElementById('b').value);
        const tolerance = parseFloat(document.getElementById('tolerance').value);
        
        // ETAPA 4: VALIDAÇÕES DE ENTRADA
        
        // Validação 1: Verifica se a função foi inserida
        if (!funcExpression) {
            throw new Error('Por favor, insira uma função');
        }
        
        // Validação 2: Verifica se os valores numéricos são válidos
        if (isNaN(a) || isNaN(b) || isNaN(tolerance)) {
            throw new Error('Por favor, insira valores numéricos válidos');
        }
        
        // Validação 3: Verifica se o intervalo está correto (a < b)
        if (a >= b) {
            throw new Error('O valor de "a" deve ser menor que "b"');
        }
        
        // ETAPA 5: Execução do método da bisseção
        const result = bisectionMethod(funcExpression, a, b, tolerance);
        
        // ETAPA 6: CONSTRUÇÃO DO HTML DE RESULTADOS
        let html = '<div class="result-section">';
        html += '<h4><i class="fas fa-chart-line"></i> Resultados</h4>';
        
        // Verifica se o método convergiu com sucesso
        if (result.converged) {
            html += '<div class="final-result">';
            html += `<h5><i class="fas fa-bullseye"></i> Raiz encontrada!</h5>`;
            html += `<p><strong>x ≈ ${result.root.toFixed(8)}</strong></p>`;
            html += `<p>f(${result.root.toFixed(8)}) ≈ ${result.finalError.toFixed(10)}</p>`;
            html += `<p>Iterações: ${result.iterations.length}</p>`;
            html += '</div>';
        } else {
            // Caso não tenha convergido
            html += '<div class="alert alert-warning">';
            html += '<h5><i class="fas fa-exclamation-triangle"></i> Máximo de iterações atingido</h5>';
            html += `<p>Melhor aproximação: x ≈ ${result.root.toFixed(8)}</p>`;
            html += `<p>Erro: ${result.finalError.toFixed(10)}</p>`;
            html += '</div>';
        }
        
        // ETAPA 7: CONSTRUÇÃO DA TABELA DE ITERAÇÕES
        html += '<h5 class="mt-4"><i class="fas fa-table"></i> Histórico de Iterações</h5>';
        html += '<div class="table-responsive">';
        html += '<table class="table table-sm table-hover">';
        html += '<thead><tr><th>Iter</th><th>a</th><th>b</th><th>c</th><th>f(a)</th><th>f(b)</th><th>f(c)</th><th>Erro</th></tr></thead><tbody>';
        
        // Itera sobre cada iteração registrada para construir a tabela
        result.iterations.forEach((iter, index) => {
            html += `<tr class="iteration-row" style="animation-delay: ${index * 0.1}s">`;
            html += `<td>${iter.iteration}</td>`;                     // Número da iteração
            html += `<td>${iter.a.toFixed(6)}</td>`;                  // Valor de a
            html += `<td>${iter.b.toFixed(6)}</td>`;                  // Valor de b  
            html += `<td>${iter.c.toFixed(6)}</td>`;                  // Ponto médio c
            html += `<td>${iter.fa.toFixed(6)}</td>`;                 // f(a)
            html += `<td>${iter.fb.toFixed(6)}</td>`;                 // f(b)
            html += `<td>${iter.fc.toFixed(6)}</td>`;                 // f(c)
            html += `<td>${iter.error.toFixed(8)}</td>`;              // Erro do intervalo
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        html += '</div>';
        
        // ETAPA 8: Inserção do HTML na página
        resultsDiv.innerHTML = html;
        
    } catch (error) {
        // ETAPA 9: Tratamento de erros
        resultsDiv.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> <strong>Erro:</strong> ${error.message}</div>`;
    }
}

// ================================================================================================
// FUNÇÃO 8: CONTROLE DA INTERFACE DE USUÁRIO
// ================================================================================================

/**
 * Função para alternar entre os modos manual e automático da interface
 * Controla a visibilidade dos campos de entrada baseado no modo selecionado
 */
function toggleInputMode() {
    // ETAPA 1: Verifica qual modo está selecionado
    // Obtém o estado do radio button do modo manual
    const isManual = document.getElementById('modeManual').checked;
    
    // ETAPA 2: Obtém referência aos elementos de entrada manual
    const manualInputs = document.getElementById('manualInputs');
    
    // ETAPA 3: Controla a visibilidade dos campos
    if (isManual) {
        // Modo manual: mostra os campos a, b
        manualInputs.style.display = 'block';
    } else {
        // Modo automático: esconde os campos a, b
        manualInputs.style.display = 'none';
    }
}

// ================================================================================================
// SEÇÃO DE EVENT LISTENERS E INICIALIZAÇÃO
// ================================================================================================

/**
 * Configuração dos eventos da página para interatividade
 */

// EVENT LISTENER 1: Tecla Enter para executar cálculos
// Adiciona funcionalidade de pressionar Enter para calcular
document.addEventListener('keypress', function(e) {
    // Verifica se a tecla pressionada foi Enter
    if (e.key === 'Enter') {
        // Determina qual ação executar baseado no modo selecionado
        const isManual = document.getElementById('modeManual').checked;
        
        if (isManual) {
            // Se está em modo manual, executa o cálculo da bisseção
            calculateBisection();
        } else {
            // Se está em modo automático, executa a detecção de zeros
            detectZeros();
        }
    }
});

// EVENT LISTENER 2: Radio buttons para mudança de modo
// Adiciona eventos para os botões de seleção de modo (manual/automático)
document.querySelectorAll('input[name="operationMode"]').forEach(radio => {
    // Para cada radio button, adiciona um listener para mudanças
    radio.addEventListener('change', toggleInputMode);
});

// ================================================================================================
// INICIALIZAÇÃO DO SISTEMA
// ================================================================================================

/**
 * Configuração inicial quando a página carrega
 * Define o estado inicial da interface e executa demonstração automática
 */
window.addEventListener('load', function() {
    // ETAPA 1: Configura o modo inicial da interface
    // Chama a função para ajustar a visibilidade dos campos baseado no modo padrão
    toggleInputMode();
    
    // ETAPA 2: Demonstração automática com exemplo
    // Executa a detecção automática após um pequeno delay (500ms)
    // O delay garante que todos os elementos da página estejam carregados
    setTimeout(() => {
        // Verifica se não está em modo manual (ou seja, está em automático)
        if (!document.getElementById('modeManual').checked) {
            // Executa a detecção automática com a função exemplo pré-carregada
            detectZeros();
        }
    }, 500);  // 500 milissegundos = 0.5 segundos
});

// ================================================================================================
// EVENT LISTENER PARA LIMPEZA AUTOMÁTICA
// ================================================================================================

/**
 * Limpa os resultados quando o usuário modifica a função
 * Garante que resultados antigos não sejam confundidos com a nova função
 */
document.getElementById('function').addEventListener('input', function() {
    // Limpa completamente a div de resultados da bisseção
    document.getElementById('results').innerHTML = '';
    
    // Limpa completamente a div de resultados da detecção de zeros
    document.getElementById('zerosResults').innerHTML = '';
});

// ================================================================================================
// RESUMO DO FUNCIONAMENTO DO SISTEMA
// ================================================================================================

/**
 * FLUXO PRINCIPAL DO SISTEMA:
 * 
 * 1. MODO AUTOMÁTICO (padrão):
 *    - Usuario insere função (ex: x^3 - 9*x + 3)
 *    - Sistema detecta grau da função
 *    - Busca mudanças de sinal no intervalo [-30, +30] com passo 1.0
 *    - Exibe intervalos encontrados
 *    - Usuario pode clicar em intervalo ou calcular todos
 * 
 * 2. MODO MANUAL:
 *    - Usuario insere função e define intervalo [a, b] manualmente
 *    - Sistema aplica método da bisseção diretamente
 *    - Exibe resultado e tabela de iterações
 * 
 * 3. ALGORITMO DA BISSEÇÃO:
 *    - Verifica pré-requisito: f(a) * f(b) < 0
 *    - Loop: calcula ponto médio, avalia função, escolhe novo intervalo
 *    - Continua até convergência (|f(c)| < tolerância) ou máximo de iterações
 *    - Retorna raiz encontrada e histórico completo
 * 
 * 4. DETECÇÃO AUTOMÁTICA:
 *    - Percorre intervalo com passo definido
 *    - Identifica pontos consecutivos com mudança de sinal
 *    - Cada mudança indica possível zero pelo Teorema do Valor Intermediário
 *    - Cria lista de intervalos candidatos para aplicar bisseção
 */