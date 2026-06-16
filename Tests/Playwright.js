import console from "node:console";
import {cp, writeFile} from "node:fs/promises";
import {createServer} from "node:http";
import {join} from "node:path";
import process from "node:process";
import {firefox} from "playwright";
import handler from "serve-handler";

// Start the browser.
const browser = await firefox.launch();
const directory = join(import.meta.dirname, "../Temp");
const server = createServer((req, res) => handler(req, res, {public: directory})); // eslint-disable-line @typescript-eslint/no-misused-promises

const page = await browser.newPage();
page.on("pageerror", error => console.error(error));
page.on("console", async message => {
	const args = /** @type {unknown[]} */ (await Promise.all(message.args().map(arg => arg.jsonValue())));
	if (args.length) console.log(args.shift(), ...args);
	else console.log(message.text());
});

await page.evaluate(() => console.log(navigator.userAgent));
await page.exposeFunction("exit", async (/** @type {number} */ code) => {
	await browser.close();
	server.close();
	process.exit(code);
});

// Run the test suite.
await cp(join(import.meta.dirname, "../node_modules/mocha/mocha.js"), join(directory, "Mocha.js"));
await writeFile(join(directory, "Tests.html"), `
	<!doctype html>
	<html dir="ltr" lang="en">
		<head>
			<meta charset="utf-8">
		</head>

		<body>
			<script src="Mocha.js"></script>
			<script>
				mocha.setup({reporter: "spec", ui: "bdd"});
			</script>

			<script src="Tests.js"></script>
			<script>
				const runner = mocha.run();
				runner.on("end", () => exit(runner.failures));
			</script>
		</body>
	</html>
`);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
server.listen({host: "127.0.0.1", port: 0}, async () => {
	const {address, port} = /** @type {import("node:net").AddressInfo} */ (server.address());
	await page.goto(`http://${address}:${port}/Tests.html`);
});
