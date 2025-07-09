import chalk from "chalk";
import { parse } from "shell-quote";

export interface CommandPart {
	type: "command" | "argument" | "operator";
	value: string;
	isLongOption?: boolean;
	isShortOption?: boolean;
}

export interface PrettifyOptions {
	maxWidth?: number;
	indent?: string;
	flagsOnNewLine?: boolean;
	disableColors?: boolean;
}

export interface PreviewOptions {
	showPretty?: boolean;
	maxWidth?: number;
	indent?: string;
	flagsOnNewLine?: boolean;
	disableColors?: boolean;
}

export interface CommandPreview {
	original: string;
	pretty: string | undefined;
	shouldPrettify: boolean;
}

/**
 * Parse a command line into structured parts
 */
function parseCommand(command: string): CommandPart[] {
	const parts: CommandPart[] = [];
	const parsed = parse(command);

	for (const part of parsed) {
		if (typeof part === "string") {
			// Check if this is an option
			if (part.startsWith("--")) {
				parts.push({ type: "argument", value: part, isLongOption: true });
			} else if (
				part.startsWith("-") &&
				part.length > 1 &&
				!part.match(/^-\d/)
			) {
				parts.push({ type: "argument", value: part, isShortOption: true });
			} else {
				// First non-option is command, rest are arguments
				const isCommand =
					parts.length === 0 || parts.every((p) => p.type === "operator");
				parts.push({ type: isCommand ? "command" : "argument", value: part });
			}
		} else if (typeof part === "object" && "op" in part) {
			parts.push({ type: "operator", value: part.op });
		}
	}

	return parts;
}

/**
 * Apply syntax highlighting to a command part
 */
function applyHighlighting(part: CommandPart): string {
	if (!chalk.level) {
		return part.value;
	}

	switch (part.type) {
		case "command":
			return chalk.cyan.bold(part.value);
		case "operator":
			return chalk.yellow.bold(part.value);
		case "argument":
			if (part.isLongOption) {
				return chalk.green(part.value);
			} else if (part.isShortOption) {
				return chalk.green(part.value);
			} else {
				// Regular argument - check if it looks like a file path, URL, or value
				if (part.value.includes("/") || part.value.includes("\\")) {
					return chalk.blue(part.value); // File paths
				} else if (part.value.includes("=")) {
					return chalk.magenta(part.value); // Key=value pairs
				} else if (part.value.match(/^https?:\/\//)) {
					return chalk.blue.underline(part.value); // URLs
				} else {
					return chalk.white(part.value); // Regular arguments
				}
			}
		default:
			return part.value;
	}
}

/**
 * Format a command for pretty display with intelligent multiline formatting
 *
 * @param command - The command string to prettify
 * @param options - Formatting options
 * @returns Prettified command string with proper line breaks and indentation
 *
 * @example
 * ```typescript
 * import { prettifyCommand } from 'shiny-command-line';
 *
 * const cmd = 'npm run build && npm run test --coverage --verbose && npm run deploy --env=production';
 * const pretty = prettifyCommand(cmd);
 * console.log(pretty);
 * // Output:
 * // npm run build &&
 * //   npm run test \\
 * //     --coverage \\
 * //     --verbose &&
 * //   npm run deploy \\
 * //     --env=production
 * ```
 */
export function prettifyCommand(
	command: string,
	options: PrettifyOptions = {},
): string {
	const {
		maxWidth = 80,
		indent = "  ",
		flagsOnNewLine = false,
		disableColors = false,
	} = options;

	try {
		const parts = parseCommand(command);

		if (parts.length === 0) {
			return command;
		}

		// If command is short enough, return as-is
		if (command.length <= maxWidth) {
			return command;
		}

		const result: string[] = [];
		let currentLine = "";

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			const isLastPart = i === parts.length - 1;
			const partValue = !disableColors ? applyHighlighting(part) : part.value;

			if (part.type === "command") {
				currentLine = partValue;
			} else if (part.type === "operator") {
				// Handle different operators
				switch (part.value) {
					case "&&":
					case "||":
					case "|":
						result.push(`${currentLine} ${partValue}`);
						currentLine = "";
						break;
					case ";":
						result.push(currentLine + partValue);
						currentLine = "";
						break;
					default:
						currentLine += ` ${partValue}`;
				}
			} else {
				// Handle arguments
				const argWithSpace = ` ${partValue}`;

				// Special handling for flags on new lines
				if (flagsOnNewLine && (part.isLongOption || part.isShortOption)) {
					if (currentLine.trim()) {
						result.push(`${currentLine} \\`);
						currentLine = indent + partValue;
					} else {
						currentLine += argWithSpace;
					}
				} else {
					// Check if adding this argument would exceed max width
					if (
						currentLine.length + argWithSpace.length > maxWidth &&
						currentLine.length > 0
					) {
						result.push(`${currentLine} \\`);
						currentLine = indent + partValue;
					} else {
						currentLine += argWithSpace;
					}
				}

				// For long options, consider breaking after them
				if (part.isLongOption && !isLastPart && !flagsOnNewLine) {
					const nextPart = parts[i + 1];
					if (
						nextPart &&
						nextPart.type === "argument" &&
						!nextPart.isLongOption &&
						!nextPart.isShortOption
					) {
						// This is a long option with a value, keep them together if possible
						const nextPartValue = !disableColors
							? applyHighlighting(nextPart)
							: nextPart.value;
						const nextArgWithSpace = ` ${nextPartValue}`;
						if (currentLine.length + nextArgWithSpace.length > maxWidth) {
							result.push(`${currentLine} \\`);
							currentLine = indent + nextPartValue;
							i++; // Skip next part as we've processed it
						}
					}
				}
			}
		}

		if (currentLine) {
			result.push(currentLine);
		}

		return result.join("\n");
	} catch (_error) {
		// If parsing fails, return original command
		return command;
	}
}

/**
 * Check if a command should be prettified based on length, complexity, and operators
 *
 * @param command - The command string to analyze
 * @param threshold - Length threshold for prettification (default: 80)
 * @returns True if the command should be prettified
 *
 * @example
 * ```typescript
 * import { shouldPrettifyCommand } from 'shiny-command-line';
 *
 * console.log(shouldPrettifyCommand('ls -la')); // false
 * console.log(shouldPrettifyCommand('npm run build && npm run test')); // true
 * console.log(shouldPrettifyCommand('command --option1 --option2 --option3 --option4')); // true
 * ```
 */
export function shouldPrettifyCommand(
	command: string,
	threshold: number = 80,
): boolean {
	return (
		command.length > threshold ||
		command.includes("&&") ||
		command.includes("||") ||
		command.includes(";") ||
		command.includes("|") ||
		(command.match(/--\w+/g) || []).length > 3
	);
}

/**
 * Get a formatted preview of the command with both original and prettified versions
 *
 * @param command - The command string to preview
 * @param options - Preview options
 * @returns Object containing original, prettified (if applicable), and shouldPrettify flag
 *
 * @example
 * ```typescript
 * import { getCommandPreview } from 'shiny-command-line';
 *
 * const preview = getCommandPreview('npm run build && npm run test', { showPretty: true });
 * console.log(preview.original); // Original command
 * console.log(preview.pretty);   // Prettified version (if shouldPrettify is true)
 * console.log(preview.shouldPrettify); // true
 * ```
 */
export function getCommandPreview(
	command: string,
	options: PreviewOptions = {},
): CommandPreview {
	const {
		showPretty = false,
		maxWidth = 80,
		indent = "  ",
		flagsOnNewLine = false,
		disableColors = false,
	} = options;
	const shouldPrettify = shouldPrettifyCommand(command, maxWidth);

	return {
		original: command,
		pretty:
			showPretty && shouldPrettify
				? prettifyCommand(command, {
						maxWidth,
						indent,
						flagsOnNewLine,
						disableColors,
					})
				: undefined,
		shouldPrettify,
	};
}

/**
 * Format multiple commands in a batch
 *
 * @param commands - Array of command strings to prettify
 * @param options - Formatting options
 * @returns Array of prettified command strings
 *
 * @example
 * ```typescript
 * import { prettifyCommands } from 'shiny-command-line';
 *
 * const commands = [
 *   'npm run build && npm run test',
 *   'docker build -t myapp . && docker run myapp'
 * ];
 * const prettified = prettifyCommands(commands);
 * ```
 */
export function prettifyCommands(
	commands: string[],
	options: PrettifyOptions = {},
): string[] {
	return commands.map((cmd) => prettifyCommand(cmd, options));
}

// Types are already exported above with their interfaces
