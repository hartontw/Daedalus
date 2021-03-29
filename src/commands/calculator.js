const Command = require('./command');

const operations = [
    {sym: '^', func: (...m) => Math.pow(m[1], m[2]) },
    {sym: '/', func: (...m) => m[1] / m[2] },
    {sym: '*', func: (...m) => m[1] * m[2] },
    {sym: '+', func: (...m) => Number(m[1]) + Number(m[2]) },
    {sym: '-', func: (...m) => m[1] - m[2] }
];

class Calculator extends Command {
    static get description() {
        return "An expression based calculator.";
    }

    static get usage() {
        return `/calc 3 * 5
               /calc x=3(2+7.4), y=45^2-1
               /calc √2*(5.25 + 2(2^3))
               /calc (9(5 + 2(2^2 + √(23-3)) * 5.612 + sqrt5))`;
    }    

    static resolveOperations(expression) {
        // SQRT
        expression = expression.replace(/√(-?\d*\.{0,1}\d+)/, (m, g) => Math.sqrt(g));

        // OTHERS
        for(let operation of operations) {
            const regex = new RegExp(`(-?\\d*\\.{0,1}\\d+)\\${operation.sym}(-?\\d*\\.{0,1}\\d+)`, 'g');
            while(expression.match(regex)) {
                expression = expression.replace(regex, operation.func);
            }            
        }

        return expression;
    }

    static resolveParentheses(expression) {
        while (expression.match(/\(([^()]*)\)/)) {
            expression = expression.replace(/\(([^()]*)\)/g, (m,g) => this.resolveOperations(g));
        }

        return this.resolveOperations(expression);
    }

    static format(content) {
        let expression = content.replace(/^\/[^\s\t]+/, '').replace(/[\s\t]/g, '');

        this.argsInfo.forEach(arg => {
            expression = expression.replace(`--${arg.name}`, '');
        });

        expression = expression.replace(/(\d)[*]*(\()/g, (...m) => m[1] + "*" + m[2]);
        expression = expression.replace(/(\))[*]*(\d)/g, (...m) => m[1] + "*" + m[2]);
        expression = expression.replace(/sqrt/g, '√');
        
        return expression;
    }

    async run() {
        try {            
            console.log(this);

            let expression = this.constructor.format(this.message.content);

            expression = this.constructor.resolveParentheses(expression);

            return await this.send(expression);

        } catch (error) {
            return this.error(error);
        }
    }
}

module.exports = Calculator;