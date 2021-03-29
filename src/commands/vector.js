const Command = require('./command');

const operations = [
    {sym: '^', func: (...m) => Math.pow(m[1], m[2]) },
    {sym: '/', func: (...m) => m[1] / m[2] },
    {sym: '*', func: (...m) => m[1] * m[2] },
    {sym: '+', func: (...m) => Number(m[1]) + Number(m[2]) },
    {sym: '-', func: (...m) => m[1] - m[2] }
];

class Vector extends Command {
    static get description() {
        return "Vector calculator.";
    }

    static get usage() {
        return `/vect {3,4,5} --normalize
               /vect {z=4, x:-:2, y1.03} -n
               /vect {2,5} - [4,6]
               /vect (-3, 2.5, 6) * 3
               /vect {3,2,1} + {2,3,4} --magnitude,
               /vect (-1, 2.3, 6) · {1, 2, 3}
               /vect {0.2, 3, 61} x {-1, 76, 4}
               /vect {0.2, 3, 61} proy {-1, 76, 4} -f fp`;
    }    

    static get argsInfo() {
        return [{
                name: 'magnitude',
                alias: 'm',
                description: 'Returns the length of this vector.'
            },
            {
                name: 'normalized',
                alias: 'n',
                description: 'Returns this vector with a magnitude of 1.'
            },
            {
                name: 'sqrMagnitude',
                alias: 's',
                description: 'Returns the squared length of this vector.'
            },
            {
                name: 'format',
                alias: 'f',
                description: 'Set the output format\n - \*\*C\*\*ompact (d) | \*\*F\*\*ull\n - \*\*P\*\*arentheses (d) | \*\*B\*\*racers | Brac\*\*k\*\*ets'
            }
        ].concat(Command.argsInfo);;
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

        const vectors = expression.find(/as/);
        
        return expression;
    }

    async run() {
        try {            
            let expression = this.constructor.format(this.message.content);

            expression = this.constructor.resolveParentheses(expression);

            return await this.send(expression);

        } catch (error) {
            return this.error(error);
        }
    }
}

module.exports = Vector;