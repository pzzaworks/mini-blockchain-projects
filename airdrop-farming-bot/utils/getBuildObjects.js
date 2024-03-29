const fs = require('fs');
const path = require('path');

const buildFolderPath = path.join(__dirname, '../build');
const buildFiles = fs.readdirSync(buildFolderPath);
const buildObjects = {};

buildFiles.forEach(file => {
    if (path.extname(file) === '.json') {
        const buildFilePath = path.join(buildFolderPath, file);
        const buildContent = JSON.parse(fs.readFileSync(buildFilePath, 'utf8'));
        const contractName = path.basename(file, '.json');
        buildObjects[contractName] = buildContent;
    }
});

module.exports = buildObjects;