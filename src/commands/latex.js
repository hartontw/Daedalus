const { MessageAttachment } = require('discord.js');
const Command = require('./command');
const svg2img = require('svg2img');

function convert(svg, width, height) {
    return new Promise( (resolve, reject) => {
        svg2img(svg, {width, height, preserveAspectRatio:true}, function(error, buffer) {
            if (error) {
                reject(error);
            }
            else {
                resolve(buffer);
            }
        });
    });
}

class Latex extends Command {
    static get description() {
        return "Format a LaTeX formula into an image.";
    }

    static get usage() {
        return "/latex e=mc^2 --color white --scale 2";
    }

    static get argsInfo() {
        return [{
                name: 'color',
                alias: 'c',
                description: 'Set de color of the image.',
            },
            {
                name: 'scale',
                alias: 's',
                description: 'Sets the size of the image.'
            }
        ].concat(Command.argsInfo);
    }

    static async getBuffer(formula, color = 'white', scale = 1) {
        const MathJax = await require('mathjax').init({
            loader: {load: ['[tex]/color', 'output/svg']},
            tex: {packages: {'[+]': ['color']}}
        });

        let svg = MathJax.tex2svg(`{\\color{${color}}${formula}}`, {display: false});
        svg = MathJax.startup.adaptor.innerHTML(svg);

        const height = 30 * scale;
        let width = height;

        let g = svg.match(/\<svg([^\>]+)/);
        if (g && g[1]) {
            let w = g[1].match(/width="([^e]+)/);
            let h = g[1].match(/height="([^e]+)/);

            w = w && w[1] ? w[1] : null;
            h = h && h[1] ? h[1] : null;

            if (w && h) {
                let ar = w / h;
                width = height * ar;
            }
        }

        return await convert(svg, width, height);
    }

    async run() {
        try {
            const buffer = await this.constructor.getBuffer(this.args._, this.args.color, this.args.scale);
            const attachment = new MessageAttachment(buffer);
            return await this.send(attachment);

        } catch (error) {
            return this.error(error);
        }
    }
}

module.exports = Latex;