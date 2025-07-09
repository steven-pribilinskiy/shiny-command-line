#!/usr/bin/env node

import {
	getCommandPreview,
	prettifyCommand,
	prettifyCommands,
	shouldPrettifyCommand,
} from "../dist/index.js";

// Helper function to pause between sections
function pause(ms = 2000) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper function to wait for user input
async function waitForEnter(message = "Press Enter to continue...") {
	console.log(`\n${message}`);
	process.stdin.setRawMode(true);
	return new Promise((resolve) =>
		process.stdin.once("data", () => {
			process.stdin.setRawMode(false);
			resolve();
		}),
	);
}

console.log("🌟 Shiny Command Line Demo");
console.log("=".repeat(50));

// Explanation section
console.log("\n📖 How it works:");
console.log("• Commands are prettified if they:");
console.log("  - Are longer than 80 characters, OR");
console.log("  - Contain operators (&&, ||, ;, |), OR");
console.log("  - Have more than 3 long options (--option)");

await waitForEnter();

// Example commands to demonstrate
const commands = [
	"ls -la",
	"npm run build && npm run test --coverage --verbose && npm run deploy --env=production",
	"docker build -t myapp:latest . && docker run -p 3000:3000 -e NODE_ENV=production myapp:latest",
	'git add . && git commit -m "feat: add new feature" && git push origin main',
	'curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer token" -d \'{"key": "value"}\' https://api.example.com/endpoint',
	'find . -name "*.js" -type f -exec grep -l "console.log" {} \\; | xargs sed -i "s/console.log/logger.info/g"',
	"webpack --mode=production --optimize-minimize --output-path=dist --entry=./src/index.js",
];

console.log("\n📋 Command Analysis:");
console.log("=".repeat(50));

for (let i = 0; i < commands.length; i++) {
	const cmd = commands[i];
	console.log(`\n${i + 1}. Original Command:`);
	console.log(`   ${cmd}`);
	console.log(`   Length: ${cmd.length} characters`);

	const shouldPrettify = shouldPrettifyCommand(cmd);
	console.log(`   Should prettify: ${shouldPrettify ? "✅ Yes" : "❌ No"}`);

	if (shouldPrettify) {
		console.log("   Prettified:");
		const prettified = prettifyCommand(cmd);
		prettified.split("\n").forEach((line) => {
			console.log(`   ${line}`);
		});
	} else {
		console.log("   → No prettification needed (short and simple)");
	}

	if (i < commands.length - 1) {
		await pause(1500);
	}
}

await waitForEnter();

console.log("\n🎯 Preview Feature Demo:");
console.log("=".repeat(50));

const complexCommand =
	"npm run build && npm run test --coverage --reporter=json --output-file=coverage.json && npm run deploy --env=production --verbose";

const preview = getCommandPreview(complexCommand, { showPretty: true });

console.log("This shows how to get both original and prettified versions:");
console.log("\nOriginal:");
console.log(preview.original);
console.log("\nPrettified:");
console.log(preview.pretty);
console.log(
	`\nShould prettify: ${preview.shouldPrettify ? "✅ Yes" : "❌ No"}`,
);

await waitForEnter();

console.log("\n🚀 Batch Processing Demo:");
console.log("=".repeat(50));
console.log(
	"The 'prettifyCommands' function processes multiple commands at once.",
);
console.log(
	"This is useful for CI/CD scripts, documentation, or any tool that handles multiple commands:",
);

const batchCommands = [
	"npm install && npm run build && npm run test --coverage --reporter=json && npm run deploy --env=production",
	"docker build -t myapp:latest . && docker run -d --name myapp -p 3000:3000 -e NODE_ENV=production myapp:latest",
	"terraform init && terraform plan -var-file=production.tfvars && terraform apply -auto-approve -var='instance_type=t3.large'",
];

console.log("\nOriginal commands:");
batchCommands.forEach((cmd, index) => {
	console.log(`${index + 1}. ${cmd}`);
	console.log(`   (${cmd.length} characters)`);
});

console.log("\nPrettified commands:");
const prettifiedBatch = prettifyCommands(batchCommands);

prettifiedBatch.forEach((cmd, index) => {
	console.log(`\n${index + 1}. ${cmd}`);
});

await waitForEnter();

console.log("\n🎨 Syntax Highlighting Demo:");
console.log("=".repeat(50));

const syntaxCommand =
	"npm run build && docker build -t myapp:latest . && curl -X POST https://api.example.com/deploy --data-binary @package.json";

console.log("Without colors (disableColors: true):");
console.log(prettifyCommand(syntaxCommand, { disableColors: true }));
console.log("\nWith colors (default):");
console.log(prettifyCommand(syntaxCommand));

await waitForEnter();

console.log("\n🏁 Flag Formatting Demo:");
console.log("=".repeat(50));

const flagHeavyCommand =
	"docker run -d --name myapp --restart=unless-stopped -p 3000:3000 -p 4000:4000 -e NODE_ENV=production -e DATABASE_URL=postgres://user:pass@localhost:5432/db -v /host/logs:/app/logs -v /host/data:/app/data --network=mynetwork --memory=2g --cpus=2 myapp:latest";

console.log("With flags on new lines + colors (default):");
console.log(
	prettifyCommand(flagHeavyCommand, {
		flagsOnNewLine: true,
	}),
);

console.log("\n✨ Demo complete! Try it in your own projects!");
