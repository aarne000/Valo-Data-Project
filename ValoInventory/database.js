function saveData(date, description, quantity, category, location) {
    const fs = require('fs');
    fs.appendFileSync('data.txt', date + ',' + description + ',' + quantity + ',' + category + ',' + location + '\n');
}

async function getData() {
    try {
        const { readFile } = require('node:fs/promises');
        const { resolve } = require('node:path');
        const filePath = resolve('./data.txt');
        const contents = await readFile(filePath, { encoding: 'utf8' });
        const lines = contents.split('\n')
        lines.pop()
        const output = new Array()
        for (i in lines) {
            output.push(lines[i].split(','))
        }
        return output
    } catch (e) {
        error("Error: " + e.message);
    }
}
