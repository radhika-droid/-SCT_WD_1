class ProfessionalCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.historyDisplay = document.getElementById('history');
        this.calculator = document.getElementById('calculator');
        this.currentInput = '';
        this.previousInput = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.memory = 0;
        this.history = [];
        this.shiftMode = false;
        this.angleMode = 'deg';
        this.pendingOperation = null;
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.updateDisplay();
        this.updateModeDisplay();
    }

    attachEventListeners() {
        document.querySelectorAll('.btn, .operator').forEach(button => {
            button.addEventListener('click', (e) => this.handleButtonClick(e));
        });

        document.querySelectorAll('.scientific').forEach(button => {
            button.addEventListener('click', (e) => this.handleScientificClick(e));
        });

        document.getElementById('clear').addEventListener('click', () => this.clear());
        document.getElementById('equals').addEventListener('click', () => this.calculate());
        document.getElementById('shift').addEventListener('click', () => this.toggleShift());
        document.getElementById('angleToggle')?.addEventListener('click', () => this.toggleAngleMode());

        document.getElementById('mc').addEventListener('click', () => this.memoryClear());
        document.getElementById('mr').addEventListener('click', () => this.memoryRecall());
        document.getElementById('mplus').addEventListener('click', () => this.memoryAdd());
        document.getElementById('mminus').addEventListener('click', () => this.memorySubtract());

        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    toggleShift() {
        this.shiftMode = !this.shiftMode;
        if (this.shiftMode) {
            this.calculator.classList.add('shift-mode');
            document.getElementById('shift').classList.add('active');
        } else {
            this.calculator.classList.remove('shift-mode');
            document.getElementById('shift').classList.remove('active');
        }
        this.updateModeDisplay();
    }

    toggleAngleMode() {
        this.angleMode = this.angleMode === 'deg' ? 'rad' : 'deg';
        this.updateModeDisplay();
    }

    updateModeDisplay() {
        const angleModeSpan = document.getElementById('angleMode');
        const memoryIndicator = document.getElementById('memoryIndicator');
        if (angleModeSpan) {
            angleModeSpan.textContent = this.angleMode.toUpperCase();
        }
        if (memoryIndicator) {
            memoryIndicator.textContent = this.formatResult(this.memory);
        }
    }

    handleScientificClick(e) {
        const func = e.target.dataset.func;
        if (!func) return;

        const current = parseFloat(this.currentInput) || parseFloat(this.display.value) || 0;
        let result;

        switch (func) {
            case 'sin':
                result = Math.sin(this.angleMode === 'deg' ? current * Math.PI / 180 : current);
                this.addToHistory(`sin(${current}) = ${result}`);
                break;
            case 'cos':
                result = Math.cos(this.angleMode === 'deg' ? current * Math.PI / 180 : current);
                this.addToHistory(`cos(${current}) = ${result}`);
                break;
            case 'tan':
                result = Math.tan(this.angleMode === 'deg' ? current * Math.PI / 180 : current);
                this.addToHistory(`tan(${current}) = ${result}`);
                break;
            case 'asin':
                if (Math.abs(current) <= 1) {
                    result = Math.asin(current);
                    if (this.angleMode === 'deg') result = result * 180 / Math.PI;
                    this.addToHistory(`asin(${current}) = ${result}`);
                } else {
                    result = NaN;
                }
                break;
            case 'acos':
                if (Math.abs(current) <= 1) {
                    result = Math.acos(current);
                    if (this.angleMode === 'deg') result = result * 180 / Math.PI;
                    this.addToHistory(`acos(${current}) = ${result}`);
                } else {
                    result = NaN;
                }
                break;
            case 'atan':
                result = Math.atan(current);
                if (this.angleMode === 'deg') result = result * 180 / Math.PI;
                this.addToHistory(`atan(${current}) = ${result}`);
                break;
            case 'ln':
                result = current > 0 ? Math.log(current) : NaN;
                this.addToHistory(`ln(${current}) = ${result}`);
                break;
            case 'log':
                result = current > 0 ? Math.log10(current) : NaN;
                this.addToHistory(`log(${current}) = ${result}`);
                break;
            case 'sqrt':
                result = current >= 0 ? Math.sqrt(current) : NaN;
                this.addToHistory(`√(${current}) = ${result}`);
                break;
            case 'square':
                result = current * current;
                this.addToHistory(`(${current})² = ${result}`);
                break;
            case 'reciprocal':
                result = current !== 0 ? 1 / current : Infinity;
                this.addToHistory(`1/(${current}) = ${result}`);
                break;
            case 'factorial':
                result = this.factorial(Math.floor(Math.abs(current)));
                this.addToHistory(`${current}! = ${result}`);
                break;
            case 'pi':
                result = Math.PI;
                this.addToHistory(`π = ${result}`);
                break;
            case 'e':
                result = Math.E;
                this.addToHistory(`e = ${result}`);
                break;
            case 'exp':
                result = Math.exp(current);
                this.addToHistory(`exp(${current}) = ${result}`);
                break;
            case 'power':
                this.pendingOperation = '**';
                this.handleOperator('**', '^');
                return;
            default:
                return;
        }

        this.display.value = this.formatResult(result);
        this.currentInput = String(result);
        this.waitingForOperand = true;
    }

    handleButtonClick(e) {
        const button = e.target.closest('button');
        const value = button.dataset.value;
        const displayValue = button.dataset.display || value;
        
        if (this.isOperator(value)) {
            this.handleOperator(value, displayValue);
        } else {
            this.handleNumber(value, displayValue);
        }
    }

    factorial(n) {
        if (n < 0 || n > 170) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    handleNumber(value, displayValue) {
        if (this.waitingForOperand) {
            this.display.value = displayValue || value;
            this.currentInput = value;
            this.waitingForOperand = false;
        } else {
            if (this.display.value === '0') {
                this.display.value = displayValue || value;
                this.currentInput = value;
            } else {
                this.display.value += displayValue || value;
                this.currentInput += value;
            }
        }
    }

    handleOperator(nextOperator, displayOperator) {
        const inputValue = parseFloat(this.currentInput);

        if (this.previousInput === '' && this.currentInput !== '') {
            this.previousInput = this.currentInput;
        } else if (this.operation && !this.waitingForOperand) {
            const result = this.performCalculation();
            this.display.value = this.formatResult(result);
            this.currentInput = String(result);
            this.previousInput = String(result);
        }

        this.waitingForOperand = true;
        this.operation = nextOperator;
    }

    performCalculation() {
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);

        if (isNaN(prev) || isNaN(current)) return current || prev || 0;

        switch (this.operation) {
            case '+': return prev + current;
            case '-': return prev - current;
            case '*': return prev * current;
            case '/': return current !== 0 ? prev / current : 0;
            case '**': return Math.pow(prev, current);
            default: return current;
        }
    }

    calculate() {
        try {
            if (this.operation && this.previousInput !== '' && this.currentInput !== '') {
                const result = this.performCalculation();
                const operatorSymbol = this.getOperatorSymbol(this.operation);
                this.addToHistory(`${this.previousInput} ${operatorSymbol} ${this.currentInput} = ${result}`);
                this.display.value = this.formatResult(result);
                this.currentInput = String(result);
                this.previousInput = '';
                this.operation = null;
                this.waitingForOperand = true;
            }
        } catch (error) {
            this.display.value = 'Error';
            this.clear();
        }
    }

    getOperatorSymbol(operation) {
        switch (operation) {
            case '+': return '+';
            case '-': return '−';
            case '*': return '×';
            case '/': return '÷';
            case '**': return '^';
            default: return operation;
        }
    }

    formatResult(result) {
        if (isNaN(result) || !isFinite(result)) return 'Error';
        const rounded = Math.round(result * 1e10) / 1e10;
        if (Math.abs(rounded) > 1e12) {
            return rounded.toExponential(6);
        }
        return String(rounded);
    }

    clear() {
        this.display.value = '0';
        this.currentInput = '';
        this.previousInput = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.historyDisplay.value = '';
    }

    isOperator(value) {
        return ['+', '-', '*', '/', '**'].includes(value);
    }

    memoryClear() { 
        this.memory = 0; 
        this.updateModeDisplay();
    }
    
    memoryRecall() {
        this.display.value = this.formatResult(this.memory);
        this.currentInput = String(this.memory);
        this.waitingForOperand = true;
    }

    memoryAdd() {
        const current = parseFloat(this.currentInput) || parseFloat(this.display.value) || 0;
        this.memory += current;
        this.updateModeDisplay();
    }

    memorySubtract() {
        const current = parseFloat(this.currentInput) || parseFloat(this.display.value) || 0;
        this.memory -= current;
        this.updateModeDisplay();
    }

    addToHistory(calculation) {
        this.history.unshift(calculation);
        if (this.history.length > 1) {
            this.history = this.history.slice(0, 1);
        }
        this.historyDisplay.value = this.history[0] || '';
    }

    handleKeyboard(e) {
        const key = e.key;
        
        if (/[0-9]/.test(key)) {
            this.handleNumber(key);
        } else if (['+', '-', '*', '/'].includes(key)) {
            const displayOp = {'*': '×', '/': '÷', '-': '−', '+': '+'}[key];
            this.handleOperator(key, displayOp);
        } else if (key === '=' || key === 'Enter') {
            e.preventDefault();
            this.calculate();
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
            this.clear();
        } else if (key === '.') {
            this.handleNumber('.');
        } else if (key === 'Backspace') {
            if (this.display.value.length > 1 && this.display.value !== '0') {
                this.display.value = this.display.value.slice(0, -1);
                this.currentInput = this.currentInput.slice(0, -1);
            } else {
                this.clear();
            }
        }
    }

    updateDisplay() {
        if (this.display.value === '') {
            this.display.value = '0';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProfessionalCalculator();
});

