// ==================== ELEMENTS ====================
const calculator = document.getElementById('calculator');
const currentDisplay = document.getElementById('current');
const previousDisplay = document.getElementById('previous');
const themeBtn = document.getElementById('themeBtn');
const modeBtn = document.getElementById('modeBtn');
const themeMenu = document.getElementById('themeMenu');

// ==================== ETAT ====================
let currentValue = '0';
let previousValue = '';
let operation = null;
let shouldResetScreen = false;

// ==================== THEMES ====================
const themes = ['light', 'dark', 'gradient', 'neon', 'minimal'];
let currentTheme = localStorage.getItem('calculatorTheme') || 'light';

function setTheme(theme) {
    document.body.className = theme;
    currentTheme = theme;
    localStorage.setItem('calculatorTheme', theme);
    closeThemeMenu();
}

function toggleThemeMenu() {
    themeMenu.classList.toggle('active');
}

function closeThemeMenu() {
    themeMenu.classList.remove('active');
}

// Appliquer le thème sauvegardé
setTheme(currentTheme);

// ==================== MODE SCIENTIFIQUE ====================
let isScientific = localStorage.getItem('calculatorMode') === 'scientific';

function toggleScientificMode() {
    isScientific = !isScientific;
    calculator.classList.toggle('scientific', isScientific);
    localStorage.setItem('calculatorMode', isScientific ? 'scientific' : 'standard');
}

// Appliquer le mode sauvegardé
if (isScientific) {
    calculator.classList.add('scientific');
}

// ==================== AFFICHAGE ====================
function updateDisplay() {
    currentDisplay.textContent = formatNumber(currentValue);

    if (operation !== null) {
        previousDisplay.textContent = `${formatNumber(previousValue)} ${getOperationSymbol(operation)}`;
    } else {
        previousDisplay.textContent = '';
    }
}

function formatNumber(num) {
    if (num === 'Error' || num === 'Infinity' || num === '-Infinity') return 'Erreur';
    if (num === 'NaN') return 'Erreur';

    const number = parseFloat(num);
    if (isNaN(number)) return num;

    // Limiter les décimales pour l'affichage
    if (num.includes('.') && !num.endsWith('.')) {
        const parts = num.split('.');
        if (parts[1].length > 10) {
            return parseFloat(num).toPrecision(10);
        }
    }

    return num;
}

function getOperationSymbol(op) {
    const symbols = {
        'add': '+',
        'subtract': '−',
        'multiply': '×',
        'divide': '÷'
    };
    return symbols[op] || op;
}

// ==================== OPERATIONS DE BASE ====================
function inputNumber(num) {
    if (shouldResetScreen) {
        currentValue = num;
        shouldResetScreen = false;
    } else {
        currentValue = currentValue === '0' ? num : currentValue + num;
    }
    updateDisplay();
}

function inputDecimal() {
    if (shouldResetScreen) {
        currentValue = '0.';
        shouldResetScreen = false;
    } else if (!currentValue.includes('.')) {
        currentValue += '.';
    }
    updateDisplay();
}

function clear() {
    currentValue = '0';
    previousValue = '';
    operation = null;
    shouldResetScreen = false;
    updateDisplay();
}

function toggleSign() {
    if (currentValue !== '0') {
        currentValue = currentValue.startsWith('-')
            ? currentValue.slice(1)
            : '-' + currentValue;
    }
    updateDisplay();
}

function percent() {
    currentValue = (parseFloat(currentValue) / 100).toString();
    updateDisplay();
}

function setOperation(op) {
    if (operation !== null && !shouldResetScreen) {
        calculate();
    }
    previousValue = currentValue;
    operation = op;
    shouldResetScreen = true;
    updateDisplay();
}

function calculate() {
    if (operation === null || shouldResetScreen) return;

    const prev = parseFloat(previousValue);
    const current = parseFloat(currentValue);
    let result;

    switch (operation) {
        case 'add':
            result = prev + current;
            break;
        case 'subtract':
            result = prev - current;
            break;
        case 'multiply':
            result = prev * current;
            break;
        case 'divide':
            result = current === 0 ? 'Error' : prev / current;
            break;
        default:
            return;
    }

    currentValue = result.toString();
    operation = null;
    previousValue = '';
    shouldResetScreen = true;
    updateDisplay();
}

// ==================== FONCTIONS SCIENTIFIQUES ====================
function scientificFunction(func) {
    const num = parseFloat(currentValue);
    let result;

    switch (func) {
        case 'sin':
            result = Math.sin(num * Math.PI / 180); // En degrés
            break;
        case 'cos':
            result = Math.cos(num * Math.PI / 180);
            break;
        case 'tan':
            result = Math.tan(num * Math.PI / 180);
            break;
        case 'log':
            result = num <= 0 ? 'Error' : Math.log10(num);
            break;
        case 'ln':
            result = num <= 0 ? 'Error' : Math.log(num);
            break;
        case 'sqrt':
            result = num < 0 ? 'Error' : Math.sqrt(num);
            break;
        case 'pow':
            result = Math.pow(num, 2);
            break;
        case 'pi':
            result = Math.PI;
            break;
        case 'exp':
            result = Math.exp(num);
            break;
        case 'factorial':
            result = factorial(num);
            break;
        case 'openParen':
        case 'closeParen':
            // Les parenthèses seraient pour une implémentation plus avancée
            return;
        default:
            return;
    }

    currentValue = result.toString();
    shouldResetScreen = true;
    updateDisplay();
}

function factorial(n) {
    if (n < 0 || !Number.isInteger(n)) return 'Error';
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;

    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// ==================== GESTION DES EVENEMENTS ====================
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        // Nombre
        if (button.dataset.value) {
            inputNumber(button.dataset.value);
            return;
        }

        // Action
        const action = button.dataset.action;
        if (!action) return;

        switch (action) {
            case 'clear':
                clear();
                break;
            case 'toggleSign':
                toggleSign();
                break;
            case 'percent':
                percent();
                break;
            case 'decimal':
                inputDecimal();
                break;
            case 'equals':
                calculate();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                setOperation(action);
                break;
            // Fonctions scientifiques
            case 'sin':
            case 'cos':
            case 'tan':
            case 'log':
            case 'ln':
            case 'sqrt':
            case 'pow':
            case 'pi':
            case 'exp':
            case 'factorial':
            case 'openParen':
            case 'closeParen':
                scientificFunction(action);
                break;
        }
    });
});

// Boutons de contrôle
themeBtn.addEventListener('click', toggleThemeMenu);
modeBtn.addEventListener('click', toggleScientificMode);

// Options de thème
document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
        setTheme(option.dataset.theme);
    });
});

// Fermer le menu en cliquant ailleurs
document.addEventListener('click', (e) => {
    if (!themeMenu.contains(e.target) && e.target !== themeBtn && !themeBtn.contains(e.target)) {
        closeThemeMenu();
    }
});

// ==================== CLAVIER ====================
document.addEventListener('keydown', (e) => {
    // Fermer le menu des thèmes avec Escape
    if (e.key === 'Escape') {
        closeThemeMenu();
        return;
    }

    // Chiffres
    if (e.key >= '0' && e.key <= '9') {
        inputNumber(e.key);
        return;
    }

    // Opérations
    switch (e.key) {
        case '+':
            setOperation('add');
            break;
        case '-':
            setOperation('subtract');
            break;
        case '*':
            setOperation('multiply');
            break;
        case '/':
            e.preventDefault();
            setOperation('divide');
            break;
        case 'Enter':
        case '=':
            calculate();
            break;
        case '.':
        case ',':
            inputDecimal();
            break;
        case 'Backspace':
            if (currentValue.length > 1) {
                currentValue = currentValue.slice(0, -1);
            } else {
                currentValue = '0';
            }
            updateDisplay();
            break;
        case 'Escape':
        case 'c':
        case 'C':
            clear();
            break;
        case '%':
            percent();
            break;
    }
});

// Initialiser l'affichage
updateDisplay();
