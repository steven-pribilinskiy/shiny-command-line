# 🌟 Shiny Command Line

Pretty command line formatter with multiline display, operator detection, flag formatting, and syntax highlighting.

[![npm version](https://badge.fury.io/js/shiny-command-line.svg)](https://www.npmjs.com/package/shiny-command-line)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Features

- **Command Parsing**: Uses `shell-quote` for command parsing
- **Pretty Formatting**: Formats long commands with proper line breaks
- **Operator Detection**: Recognizes `&&`, `||`, `;`, `|` and formats accordingly
- **Line Breaking**: Breaks lines at appropriate points
- **Option Grouping**: Keeps long options with their values together
- **Flag Formatting**: Option to put each flag on a new line for better readability
- **Syntax Highlighting**: Colorizes commands, operators, flags, and arguments by default
- **Configurable**: Customizable line width, indentation, and formatting options
- **TypeScript**: Full TypeScript support with type definitions
- **Minimal Dependencies**: Only depends on `shell-quote` and `chalk`

## 📦 Installation

```bash
npm install shiny-command-line
```

## 🚀 Quick Start

```typescript
import { prettifyCommand, shouldPrettifyCommand, getCommandPreview } from 'shiny-command-line';

// Basic usage
const command = 'npm run build && npm run test --coverage --verbose && npm run deploy --env=production';
const prettified = prettifyCommand(command);

console.log(prettified);
// Output:
// npm run build &&
//   npm run test \\
//     --coverage \\
//     --verbose &&
//   npm run deploy \\
//     --env=production

// With advanced formatting
const dockerCmd = 'docker run -d --name myapp -p 3000:3000 -e NODE_ENV=production myapp:latest';
const advanced = prettifyCommand(dockerCmd, { 
  flagsOnNewLine: true
});

console.log(advanced);
// Output (with colors by default):
// docker run \
//   -d \
//   --name myapp \
//   -p 3000:3000 \
//   -e NODE_ENV=production \
//   myapp:latest
```

## 📚 API Reference

### `prettifyCommand(command, options?)`

Formats a command string with multiline display.

**Parameters:**
- `command` (string): The command to prettify
- `options` (object, optional):
  - `maxWidth` (number): Maximum line width (default: 80)
  - `indent` (string): Indentation string (default: '  ')
  - `flagsOnNewLine` (boolean): Put each flag on a new line (default: false)
  - `disableColors` (boolean): Disable syntax highlighting (default: false)

**Returns:** Prettified command string

```typescript
import { prettifyCommand } from 'shiny-command-line';

// Basic formatting
const result = prettifyCommand(
  'docker build -t myapp . && docker run -p 3000:3000 myapp'
);

// Advanced formatting with flags on new lines
const advanced = prettifyCommand(
  'docker run -d --name myapp -p 3000:3000 -e NODE_ENV=production myapp:latest',
  { 
    maxWidth: 60, 
    indent: '    ',
    flagsOnNewLine: true
  }
);

// To disable colors
const disableColors = prettifyCommand(dockerCmd, { disableColors: true });
```

### `shouldPrettifyCommand(command, threshold?)`

Determines if a command should be prettified based on complexity.

**Parameters:**
- `command` (string): The command to analyze
- `threshold` (number): Length threshold (default: 80)

**Returns:** Boolean indicating if prettification is recommended

```typescript
import { shouldPrettifyCommand } from 'shiny-command-line';

console.log(shouldPrettifyCommand('ls -la')); // false
console.log(shouldPrettifyCommand('npm run build && npm run test')); // true
console.log(shouldPrettifyCommand('command --option1 --option2 --option3 --option4')); // true
```

### `getCommandPreview(command, options?)`

Gets both original and prettified versions of a command.

**Parameters:**
- `command` (string): The command to preview
- `options` (object, optional):
  - `showPretty` (boolean): Include prettified version (default: false)
  - `maxWidth` (number): Maximum line width (default: 80)
  - `indent` (string): Indentation string (default: '  ')
  - `flagsOnNewLine` (boolean): Put each flag on a new line (default: false)
  - `disableColors` (boolean): Disable syntax highlighting (default: false)

**Returns:** Object with `original`, `pretty`, and `shouldPrettify` properties

```typescript
import { getCommandPreview } from 'shiny-command-line';

const preview = getCommandPreview(
  'npm run build && npm run test',
  { showPretty: true, flagsOnNewLine: true }
);

console.log(preview.original);     // Original command
console.log(preview.pretty);       // Prettified version (if shouldPrettify is true)
console.log(preview.shouldPrettify); // true
```

### `prettifyCommands(commands, options?)`

Formats multiple commands in batch.

**Parameters:**
- `commands` (string[]): Array of commands to prettify
- `options` (object, optional): Same as `prettifyCommand`

**Returns:** Array of prettified command strings

```typescript
import { prettifyCommands } from 'shiny-command-line';

const commands = [
  'npm run build && npm run test',
  'docker build -t app . && docker run app'
];

const prettified = prettifyCommands(commands, { 
  flagsOnNewLine: true
});
```

## 🎯 Examples

### Flag Formatting

```typescript
const dockerCmd = 'docker run -d --name myapp --restart=unless-stopped -p 3000:3000 -p 4000:4000 -e NODE_ENV=production -e DATABASE_URL=postgres://user:pass@localhost:5432/db -v /host/logs:/app/logs myapp:latest';

// Standard formatting
console.log(prettifyCommand(dockerCmd));
// Output:
// docker run \\
//   -d \\
//   --name myapp \\
//   --restart=unless-stopped \\
//   -p 3000:3000 \\
//   -p 4000:4000 \\
//   -e NODE_ENV=production \\
//   -e DATABASE_URL=postgres://user:pass@localhost:5432/db \\
//   -v /host/logs:/app/logs \\
//   myapp:latest

// With flags on new lines (better for complex commands)
console.log(prettifyCommand(dockerCmd, { flagsOnNewLine: true }));
// Output:
// docker run \\
//   -d \\
//   --name myapp \\
//   --restart=unless-stopped \\
//   -p 3000:3000 \\
//   -p 4000:4000 \\
//   -e NODE_ENV=production \\
//   -e DATABASE_URL=postgres://user:pass@localhost:5432/db \\
//   -v /host/logs:/app/logs \\
//   myapp:latest
```

### Syntax Highlighting

```typescript
const complexCmd = 'npm run build && docker build -t myapp:latest . && curl -X POST https://api.example.com/deploy --data-binary @package.json';

// With colors (default behavior)
console.log(prettifyCommand(complexCmd));
// Commands appear in cyan, operators in yellow, flags in green, etc.

// Without colors
console.log(prettifyCommand(complexCmd, { disableColors: true }));
```

**Color Scheme:**
- **Commands**: Cyan bold (`npm`, `docker`, `curl`)
- **Operators**: Yellow bold (`&&`, `||`, `;`, `|`)
- **Flags**: Green (`--flag`, `-f`)
- **File paths**: Blue (`./src/index.js`, `/host/path`)
- **Key=value pairs**: Magenta (`NODE_ENV=production`)
- **URLs**: Blue underlined (`https://api.example.com`)
- **Arguments**: White (regular arguments)

### Complex Docker Command

```typescript
const dockerCmd = 'docker run -d --name myapp -p 3000:3000 -p 4000:4000 -e NODE_ENV=production -e DATABASE_URL=postgres://user:pass@localhost:5432/db -v /host/path:/container/path myapp:latest';

console.log(prettifyCommand(dockerCmd, { flagsOnNewLine: true }));
// Output (with colors by default):
// docker run \
//   -d \
//   --name myapp \
//   -p 3000:3000 \
//   -p 4000:4000 \
//   -e NODE_ENV=production \
//   -e DATABASE_URL=postgres://user:pass@localhost:5432/db \
//   -v /host/path:/container/path \
//   myapp:latest
```

### CI/CD Pipeline

```typescript
const ciCmd = 'npm ci && npm run lint && npm run test -- --coverage && npm run build && npm run deploy -- --env=production --verbose';

console.log(prettifyCommand(ciCmd));
// Output:
// npm ci &&
//   npm run lint &&
//   npm run test \\
//     -- \\
//     --coverage &&
//   npm run build &&
//   npm run deploy \\
//     -- \\
//     --env=production \\
//     --verbose
```

### Git Operations

```typescript
const gitCmd = 'git add . && git commit -m "feat: add new feature with tests and documentation" && git push origin feature/new-feature';

console.log(prettifyCommand(gitCmd, { disableColors: true }));
// Output:
// git add . &&
//   git commit \\
//     -m "feat: add new feature with tests and documentation" &&
//   git push \\
//     origin \\
//     feature/new-feature
```

## 🔧 Configuration

### Custom Formatting Options

```typescript
import { prettifyCommand } from 'shiny-command-line';

// Custom line width and indentation
const options = {
  maxWidth: 120,
  indent: '    ', // 4 spaces instead of 2
  flagsOnNewLine: true,
  disableColors: true
};

const prettified = prettifyCommand(longCommand, options);
```

### Integration with Your CLI Tool

```typescript
import { getCommandPreview } from 'shiny-command-line';

function executeCommand(cmd: string, showPreview: boolean = false) {
  if (showPreview) {
    const preview = getCommandPreview(cmd, { 
      showPretty: true,
      flagsOnNewLine: true,
      disableColors: true
    });
    
    if (preview.shouldPrettify && preview.pretty) {
      console.log('Command preview:');
      console.log('─'.repeat(50));
      console.log(preview.pretty);
      console.log('─'.repeat(50));
    }
  }
  
  // Execute the command...
}
```

### Use Cases

**Perfect for:**
- **Docker commands** with many flags and options
- **CLI tools** with complex argument structures
- **CI/CD scripts** with chained commands
- **Documentation** that shows command examples
- **Developer tools** that need to display commands clearly
- **Script runners** that preview commands before execution

## 🧪 Demo

Run the interactive demo to see all features in action:

```bash
git clone https://github.com/steven-pribilinskiy/shiny-command-line.git
cd shiny-command-line
npm install
npm run build
npm run demo
```

The demo showcases:
- Basic command analysis
- Flag formatting comparison
- Syntax highlighting examples
- Batch processing capabilities 