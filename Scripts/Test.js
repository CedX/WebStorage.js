import {startProcess, writeOutput} from "./Tools.js";

writeOutput("Running the test suite...");
startProcess("npx", "tsc --build Sources/tsconfig.json --sourceMap");
startProcess("npx", "esbuild --bundle --legal-comments=none --log-level=warning --outfile=Temp/Tests.js --sourcemap Tests/Main.js");
startProcess("node", "Tests/Playwright.js");
