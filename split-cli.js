#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI Color codes for a beautiful CLI experience
const colors = {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    magenta: "\x1b[35m"
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper to ask questions via promises
const ask = (query) => new Promise(resolve => rl.question(query, resolve));

// Helper to print colored text
const print = (text, color = colors.reset) => console.log(`${color}${text}${colors.reset}`);

async function getTargetFile() {
    // Check if an absolute/relative path was passed as an argument
    const argFile = process.argv[2];
    
    if (argFile) {
        const resolvedPath = path.resolve(argFile);
        if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
            return resolvedPath;
        } else {
            print(`[Error] Provided path is not a valid file: ${resolvedPath}`, colors.red);
            process.exit(1);
        }
    }

    // No argument provided, list files in the current directory
    print(`\nScanning current directory: ${process.cwd()}`, colors.cyan);
    
    const files = fs.readdirSync(process.cwd()).filter(file => {
        try {
            const stat = fs.statSync(file);
            // Only list files, ignore hidden files, directories, and node_modules
            return stat.isFile() && !file.startsWith('.') && !file.endsWith('.js');
        } catch (e) {
            return false;
        }
    });

    if (files.length === 0) {
        print(`[Info] No text/data files found in the current directory.`, colors.yellow);
        process.exit(0);
    }

    print(`\nAvailable files:`, colors.magenta);
    files.forEach((file, index) => {
        print(`  [${index + 1}] ${file}`, colors.green);
    });

    const answer = await ask(`\nSelect a file by number (1-${files.length}): `);
    const selectedIndex = parseInt(answer.trim()) - 1;

    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= files.length) {
        print(`[Error] Invalid selection.`, colors.red);
        process.exit(1);
    }

    return path.resolve(process.cwd(), files[selectedIndex]);
}

async function getSplitRegex() {
    print(`\nHow would you like to split the file?`, colors.magenta);
    print(`  [1] By Empty Lines (Double line breaks)`);
    print(`  [2] Before a specific keyword (e.g., 'Chapter' - keeps keyword in new chunk)`);
    print(`  [3] By a specific separator (e.g., '---' - removes separator)`);
    print(`  [4] Custom Regular Expression (Advanced)`);

    const choice = await ask(`\nChoose an option (1-4): `);

    switch (choice.trim()) {
        case '1':
            // Regex matches 2 or more newlines, accounting for Windows (\r\n) and Unix (\n)
            return /(?:\r?\n){2,}/; 
        
        case '2':
            const keyword = await ask(`Enter the keyword to split BEFORE (e.g. Chapter): `);
            // Positive lookahead: splits before the word, keeping it at the start of the chunk
            // Escaping the keyword to prevent accidental regex injection
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(`(?=${escapedKeyword})`, 'g');
            
        case '3':
            const separator = await ask(`Enter the separator to split BY and REMOVE: `);
            const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(`\\s*${escapedSeparator}\\s*`, 'g');
            
        case '4':
            const customRegexStr = await ask(`Enter your custom regex pattern (without trailing slashes): `);
            const flags = await ask(`Enter regex flags (e.g., 'g', 'i', 'm') or leave blank: `);
            try {
                return new RegExp(customRegexStr, flags);
            } catch (e) {
                print(`[Error] Invalid regular expression: ${e.message}`, colors.red);
                process.exit(1);
            }
            
        default:
            print(`[Error] Invalid choice.`, colors.red);
            process.exit(1);
    }
}

async function main() {
    print(`\n=== ✂️  TEXT CHUNK SPLITTER ===\n`, colors.cyan);

    const filePath = await getTargetFile();
    print(`\n[Selected File] ${filePath}`, colors.cyan);

    const splitRegex = await getSplitRegex();
    
    let outputDirName = await ask(`\nEnter output directory name (default: 'chunks'): `);
    outputDirName = outputDirName.trim() || 'chunks';
    
    const outputDirPath = path.join(path.dirname(filePath), outputDirName);

    print(`\nProcessing file...`, colors.yellow);

    try {
        // Read file content
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Perform the split
        const chunks = content.split(splitRegex).filter(chunk => chunk.trim().length > 0);

        if (chunks.length === 0) {
            print(`[Info] No chunks generated. The file might be empty or the regex matched the entire file.`, colors.yellow);
            process.exit(0);
        }

        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDirPath)) {
            fs.mkdirSync(outputDirPath, { recursive: true });
        }

        const baseFileName = path.basename(filePath, path.extname(filePath));
        const extension = path.extname(filePath) || '.txt';

        // Write chunks to separate files
        chunks.forEach((chunk, index) => {
            // Pad numbers with leading zeros (e.g., 01, 02)
            const chunkNum = String(index + 1).padStart(String(chunks.length).length, '0');
            const chunkFileName = `${baseFileName}_part_${chunkNum}${extension}`;
            const chunkPath = path.join(outputDirPath, chunkFileName);
            
            fs.writeFileSync(chunkPath, chunk.trim(), 'utf8');
        });

        print(`\n✅ Success! Divided into ${chunks.length} chunks.`, colors.green);
        print(`📂 Saved in: ${outputDirPath}\n`, colors.green);

    } catch (error) {
        print(`\n[Error] Failed to process file: ${error.message}`, colors.red);
    } finally {
        rl.close();
    }
}

main();
