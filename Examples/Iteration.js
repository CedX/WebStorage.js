import {Storage} from "@cedx/webstorage";
import console from "node:console";

// Loop over all entries of the local storage.
const localStorage = Storage.local()
	.set("foo", "bar")
	.set("bar", "baz")
	.set("baz", "qux");

for (const [key, value] of localStorage) console.log(`${key} => ${value}`);
// Round 1: "foo => bar"
// Round 2: "bar => baz"
// Round 3: "baz => qux"

// Loop over entries of the session storage that use the same key prefix.
Storage.session()
	.set("foo", "bar")
	.set("prefix:bar", "baz");

const prefixedStorage = Storage.session({keyPrefix: "prefix:"}).set("baz", "qux");
for (const [key, value] of prefixedStorage) console.log(`${key} => ${value}`);
// Round 1: "bar => baz"
// Round 2: "baz => qux"
