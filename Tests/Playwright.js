/* eslint-disable @typescript-eslint/no-misused-promises */
import console from "node:console";
import {cp, writeFile} from "node:fs/promises";
import {createServer} from "node:http";
import {join} from "node:path";
import process from "node:process";
import {firefox} from "playwright";
import handler from "serve-handler";

// Deploy the test assets.
const directory = join(import.meta.dirname, "../Temp");
await cp(join(import.meta.dirname, "../node_modules/mocha/mocha.css"), join(directory, "Mocha.css"));
await cp(join(import.meta.dirname, "../node_modules/mocha/mocha.js"), join(directory, "Mocha.js"));
await writeFile(join(directory, "Tests.html"), `
	<!doctype html>
	<html dir="ltr" lang="en">
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="initial-scale=1, width=device-width">
			<link rel="stylesheet" href="Mocha.css">
			<title>Tests</title>

			<script src="Mocha.js"></script>
			<script>
				mocha.setup({
					checkLeaks: true,
					color: navigator.webdriver,
					diff: true,
					reporter: navigator.webdriver ? "spec" : "html",
					ui: "bdd"
				});
			</script>
		</head>

		<body>
			<div id="mocha"></div>

			<script src="Tests.js"></script>
			<script>
				const runner = mocha.run();
				if (navigator.webdriver) runner.on("end", () => exit(runner.failures));
			</script>
		</body>
	</html>
`);

// Start the server.
const server = createServer((req, res) => handler(req, res, {public: directory}));
server.listen({host: "127.0.0.1", port: 0}, async () => {

	// Start the browser.
	await using browser = await firefox.launch();
	await using page = await browser.newPage();

	page.on("pageerror", error => console.error(error));
	page.on("console", async message => {
		const args = /** @type {unknown[]} */ (await Promise.all(message.args().map(arg => arg.jsonValue())));
		if (args.length) console.log(args.shift(), ...args);
		else console.log(message.text());
	});

	// Run the test suite.
	const {address, port} = /** @type {import("node:net").AddressInfo} */ (server.address());
	const {promise, resolve} = /** @type {PromiseWithResolvers<number>} */ (Promise.withResolvers());

	await page.evaluate(() => console.log(navigator.userAgent));
	await page.exposeFunction("exit", resolve);
	await page.goto(`http://${address}:${port}/Tests.html`);

	process.exitCode = await promise;
	server.close();
});
