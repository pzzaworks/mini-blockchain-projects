const solc = require('solc');
const fs = require('fs');
const path = require('path');

const contractsFolderPath = path.join(__dirname, '/../contracts');
const buildFolderPath = path.join(__dirname, '/../build');
const nodeModulesPath = path.join(__dirname, '/../node_modules');

function findImports(importPath) {
    if (importPath.startsWith('@openzeppelin')) {
        const fullPath = path.join(nodeModulesPath, importPath);
        return { contents: fs.readFileSync(fullPath, 'utf8') };
    } else {
        return { error: 'File not found' };
    }
}

function clearBuildFolder() {
    if (fs.existsSync(buildFolderPath)) {
        const files = fs.readdirSync(buildFolderPath);
        for (const file of files) {
            fs.unlinkSync(path.join(buildFolderPath, file));
        }
        console.log('Build folder cleared.');
    } else {
        fs.mkdirSync(buildFolderPath, { recursive: true });
        console.log('Build folder created.');
    }
}

async function compileContracts() {
    clearBuildFolder();

    const files = fs.readdirSync(contractsFolderPath);
    const sources = {};

    files.forEach(file => {
        if (path.extname(file) === '.sol') {
            const filePath = path.join(contractsFolderPath, file);
            const source = fs.readFileSync(filePath, 'utf8');
            console.log(`Compiling ${file}...`);
            sources[file] = { content: source };
        }
    });
    
    const input = {
        language: 'Solidity',
        sources,
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode.object'],
                },
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

    if (output.errors && output.errors.some(error => error.severity === 'error')) {
        console.log('Compilation errors:');
        output.errors.forEach(error => {
            if (error.severity === 'error') {
                console.log(error.formattedMessage);
            }
        });
        return;
    }

    Object.entries(output.contracts).forEach(([filePath, contracts]) => {
        const isContractInContractsFolder = files.includes(path.basename(filePath));
        if (isContractInContractsFolder) {
            
            Object.entries(contracts).forEach(([contractName, contractObject]) => {
                contractObject.bytecode = `0x${contractObject.evm.bytecode.object}`;
                delete contractObject.evm; 
                const outputPath = path.join(buildFolderPath, `${contractName}.json`);
                fs.writeFileSync(outputPath, JSON.stringify(contractObject, null, 2), 'utf8');
            });
        }
    });

    console.log('Contracts compiled successfully!');
}

compileContracts();