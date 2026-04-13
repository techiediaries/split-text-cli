# ✂️ Text Chunk Splitter CLI

A powerful, user-friendly, and zero-dependency Node.js CLI tool for splitting large text files into smaller, manageable chunks. Whether you need to split a document by chapters, specific separators, or custom regular expressions, this tool handles it with an intuitive interactive menu.

## ✨ Features

* **Zero Dependencies:** Built entirely with native Node.js modules (\`fs\`, \`path\`, \`readline\`). No \`npm install\` required!

* **Interactive Mode:** Automatically scans your current directory for text files and lets you choose one via a simple numbered list.

* **Direct File Path:** Pass an absolute or relative file path directly as an argument to skip the directory scan.

* **Smart Splitting Options:**

  1. **Empty Lines:** Split by double line breaks (paragraphs).

  2. **Before Keyword:** Split right before a specific word (e.g., \`Chapter\`), keeping the keyword at the start of the new chunk.

  3. **By Separator:** Split by a specific string (e.g., \`***\` or \`---\`) and remove the separator from the output.

  4. **Custom Regex:** For advanced users, input your own raw Regular Expressions and flags.

* **Smart File Numbering:** Output files are automatically zero-padded (e.g., \`part_01\`, \`part_02\`) to ensure perfect sorting in your file explorer.

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone this repository or download the \`split-cli.js\` file.

2. Navigate to the directory containing the file.

3. *(Optional but recommended on macOS/Linux)* Make the script executable:

````bash
chmod +x split-cli.js
```

## 💻 Usage

### Option 1: Interactive Menu

Run the script without arguments in the folder containing your text files. The CLI will list available files and guide you through the process.

```bash
node split-cli.js
```

### Option 2: Direct File Path

If you already know the exact path to the file you want to split, pass it as an argument:

```bash
node split-cli.js /absolute/or/relative/path/to/your/file.txt
```

### Output

The tool will prompt you for an output directory name (defaults to \`chunks\`). It will create this directory alongside your original file and populate it with the newly generated text chunks.

## 📄 License

This project is open-source and available under the MIT License. Feel free to modify and use it as you see fit!