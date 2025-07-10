// DOM Elements
const display = document.getElementById('display');
const historyDisplay = document.getElementById('history');
const historyPanel = document.getElementById('history-panel');
const themeToggle = document.getElementById('theme-toggle');
const clearHistoryBtn = document.getElementById('clear-history');
const calculatorButtons = document.querySelectorAll('.calculator-btn');

// State
let currentOperand = '0';
let previousOperand = '';
let operation = null;
let resetScreen = false;
let calculationHistory = [];

// Theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Display
function updateDisplay() {
    display.textContent = currentOperand;
    historyDisplay.textContent = previousOperand + (operation ? ` ${getOperationSymbol(operation)} ` : '');
}

function getOperationSymbol(op) {
    const symbols = {
        add: '+',
        subtract: '−',
        multiply: '×',
        divide: '÷'
    };
    return symbols[op] || op;
}

function appendNumber(number) {
    if (currentOperand === '0' || resetScreen) {
        currentOperand = number;
        resetScreen = false;
    } else {
        currentOperand += number;
    }
}

function addDecimal() {
    if (resetScreen) {
        currentOperand = '0.';
        resetScreen = false;
        return;
    }
    if (!currentOperand.includes('.')) currentOperand += '.';
}

function chooseOperation(op) {
    if (previousOperand !== '') calculate();
    operation = op;
    previousOperand = currentOperand;
    resetScreen = true;
}

function calculate() {
    if (operation === null || resetScreen) return;
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    let result;
    switch (operation) {
        case 'add': result = prev + current; break;
        case 'subtract': result = prev - current; break;
        case 'multiply': result = prev * current; break;
        case 'divide': result = prev / current; break;
        case 'percentage': result = prev * (current / 100); break;
        default: return;
    }

    const historyEntry = {
        expression: `${previousOperand} ${getOperationSymbol(operation)} ${currentOperand}`,
        result: result.toString()
    };

    calculationHistory.unshift(historyEntry);
    updateHistoryPanel();

    currentOperand = result.toString();
    operation = null;
    previousOperand = '';
    resetScreen = true;
}

function clearCalculator() {
    currentOperand = '0';
    previousOperand = '';
    operation = null;
}

function backspace() {
    currentOperand = currentOperand.length <= 1 || (currentOperand.length === 2 && currentOperand.startsWith('-')) ? '0' : currentOperand.slice(0, -1);
}

function percentage() {
    currentOperand = (parseFloat(currentOperand) / 100).toString();
}

function updateHistoryPanel() {
    if (calculationHistory.length === 0) {
        historyPanel.innerHTML = '<div class="text-gray-500 dark:text-gray-400 text-center py-4">No history yet</div>';
        return;
    }
    historyPanel.innerHTML = '';
    calculationHistory.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'py-2 border-b border-gray-200 dark:border-gray-700';
        div.innerHTML = `<div class="text-gray-500 dark:text-gray-400 text-sm">${entry.expression}</div><div class="text-right font-medium text-gray-800 dark:text-white">= ${entry.result}</div>`;
        div.addEventListener('click', () => {
            currentOperand = entry.result;
            updateDisplay();
        });
        historyPanel.appendChild(div);
    });
}

function clearHistory() {
    calculationHistory = [];
    updateHistoryPanel();
}

// Events
themeToggle.addEventListener('click', toggleTheme);
clearHistoryBtn.addEventListener('click', clearHistory);

calculatorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (btn.dataset.number) appendNumber(btn.dataset.number);
        else if (action === 'decimal') addDecimal();
        else if (action === 'clear') clearCalculator();
        else if (action === 'backspace') backspace();
        else if (action === 'percentage') percentage();
        else if (action === 'calculate') calculate();
        else chooseOperation(action);
        updateDisplay();
    });
});

document.addEventListener('keydown', e => {
    if (/[0-9]/.test(e.key)) appendNumber(e.key);
    else if (e.key === '.') addDecimal();
    else if (e.key === 'Enter' || e.key === '=') calculate();
    else if (e.key === 'Backspace') backspace();
    else if (e.key === 'Escape') clearCalculator();
    else if (e.key === '+') chooseOperation('add');
    else if (e.key === '-') chooseOperation('subtract');
    else if (e.key === '*') chooseOperation('multiply');
    else if (e.key === '/') chooseOperation('divide');
    else if (e.key === '%') percentage();
    updateDisplay();
});

initTheme();
updateDisplay();
