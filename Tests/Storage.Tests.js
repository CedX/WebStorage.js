/* eslint-disable max-lines-per-function */
import {Storage} from "@cedx/webstorage";
import {assert} from "chai";

/**
 * Tests the features of the {@link Storage} class.
 */
describe("Storage", () => {
	beforeEach(() => sessionStorage.clear());

	describe("keys", () => {
		it("should return an empty array for an empty storage", () =>
			assert.isEmpty(Storage.session().keys));

		it("should return the list of keys for a non-empty storage", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');
			assert.sameOrderedMembers(Array.from(Storage.session().keys), ["foo", "prefix:baz"]);
		});

		it("should handle the key prefix", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');
			assert.sameMembers(Array.from(Storage.session({keyPrefix: "prefix:"}).keys), ["baz"]);
		});
	});

	describe("length", () => {
		it("should return zero for an empty storage", () =>
			assert.lengthOf(Storage.session(), 0));

		it("should return the number of entries for a non-empty storage", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');
			assert.lengthOf(Storage.session(), 2);
		});

		it("should handle the key prefix", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');
			assert.lengthOf(Storage.session({keyPrefix: "prefix:"}), 1);
		});
	});

	describe("[Symbol.iterator]()", () => {
		it("should end iteration immediately if the storage is empty", () => {
			const iterator = Storage.session()[Symbol.iterator]();
			assert.isTrue(iterator.next().done);
		});

		it("should iterate over the values if the storage is not empty", () => {
			const iterator = Storage.session()[Symbol.iterator]();
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');

			let next = iterator.next();
			assert.isFalse(next.done);
			assert.sameOrderedMembers(next.value, ["foo", "bar"]);
			next = iterator.next();
			assert.isFalse(next.done);
			assert.sameOrderedMembers(next.value, ["prefix:baz", "qux"]);
			assert.isTrue(iterator.next().done);
		});

		it("should handle the key prefix", () => {
			const iterator = Storage.session({keyPrefix: "prefix:"})[Symbol.iterator]();
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');

			const next = iterator.next();
			assert.isFalse(next.done);
			assert.sameOrderedMembers(next.value, ["baz", "qux"]);
			assert.isTrue(iterator.next().done);
		});
	});

	describe("clear()", () => {
		it("should remove all storage entries", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');

			Storage.session().clear();
			assert.lengthOf(sessionStorage, 0);
		});

		it("should handle the key prefix", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');

			Storage.session({keyPrefix: "prefix:"}).clear();
			assert.lengthOf(sessionStorage, 1);
		});
	});

	describe("delete()", () => {
		it("should properly remove the storage entries", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');

			Storage.session().delete("foo");
			assert.lengthOf(sessionStorage, 1);
			assert.isNull(sessionStorage.getItem("foo"));
		});

		it("should handle the key prefix", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');

			Storage.session({keyPrefix: "prefix:"}).delete("baz");
			assert.lengthOf(sessionStorage, 1);
			assert.isNull(sessionStorage.getItem("prefix:baz"));
		});
	});

	describe("get()", () => {
		it("should properly get the deserialized storage entries", () => {
			const service = Storage.session();
			assert.isNull(service.get("foo"));

			sessionStorage.setItem("foo", '"bar"');
			assert.equal(service.get("foo"), "bar");

			sessionStorage.setItem("foo", "123");
			assert.equal(service.get("foo"), 123);

			sessionStorage.setItem("foo", '{"key": "value"}');
			assert.deepEqual(service.get("foo"), {key: "value"});

			sessionStorage.setItem("foo", "{bar[123]}");
			assert.isNull(service.get("foo"));

			sessionStorage.removeItem("foo");
			assert.isNull(service.get("foo"));
		});

		it("should handle the key prefix", () => {
			const service = Storage.session({keyPrefix: "prefix:"});
			assert.isNull(service.get("baz"));

			sessionStorage.setItem("prefix:baz", '"qux"');
			assert.equal(service.get("baz"), "qux");

			sessionStorage.setItem("prefix:baz", "456");
			assert.equal(service.get("baz"), 456);

			sessionStorage.setItem("prefix:baz", '{"key": "value"}');
			assert.deepEqual(service.get("baz"), {key: "value"});

			sessionStorage.setItem("prefix:baz", "{qux[456]}");
			assert.isNull(service.get("baz"));

			sessionStorage.removeItem("prefix:baz");
			assert.isNull(service.get("baz"));
		});
	});

	describe("has()", () => {
		it("should return `false` if the specified key is not contained", () =>
			assert.isFalse(Storage.session().has("foo")));

		it("should return `true` if the specified key is contained", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');

			const service = Storage.session();
			assert.isFalse(service.has("foo:bar"));
			assert.isTrue(service.has("foo"));
			assert.isTrue(service.has("prefix:baz"));
		});

		it("should handle the key prefix", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');

			const service = Storage.session({keyPrefix: "prefix:"});
			assert.isFalse(service.has("foo"));
			assert.isTrue(service.has("baz"));
		});
	});

	describe("onChange()", () => {
		it("should trigger an event when a cookie is added", () => {
			const listener = (/** @type {import("@cedx/webstorage").StorageEvent} */ event) => {
				assert.equal(event.key, "foo");
				assert.isNull(event.oldValue);
				assert.equal(event.newValue, "bar");
			};

			const service = Storage.session();
			service.onChange(listener);
			service.set("foo", "bar").removeEventListener(Storage.changeEvent, /** @type {EventListener} */ (listener));
		});

		it("should trigger an event when a cookie is updated", () => {
			sessionStorage.setItem("foo", '"bar"');
			const listener = (/** @type {import("@cedx/webstorage").StorageEvent} */ event) => {
				assert.equal(event.key, "foo");
				assert.equal(event.oldValue, "bar");
				assert.equal(event.newValue, "baz");
			};

			const service = Storage.session();
			service.onChange(listener);
			service.set("foo", "baz").removeEventListener(Storage.changeEvent, /** @type {EventListener} */ (listener));
		});

		it("should trigger an event when a cookie is removed", () => {
			sessionStorage.setItem("foo", '"bar"');
			const listener = (/** @type {import("@cedx/webstorage").StorageEvent} */ event) => {
				assert.equal(event.key, "foo");
				assert.equal(event.oldValue, "bar");
				assert.isNull(event.newValue);
			};

			const service = Storage.session();
			service.onChange(listener);
			service.delete("foo");
			service.removeEventListener(Storage.changeEvent, /** @type {EventListener} */ (listener));
		});

		it("should handle the key prefix", () => {
			const listener = (/** @type {import("@cedx/webstorage").StorageEvent} */ event) => {
				assert.equal(event.key, "baz");
				assert.isNull(event.oldValue);
				assert.equal(event.newValue, "qux");
			};

			const service = Storage.local({keyPrefix: "prefix:"});
			service.onChange(listener);
			service.set("baz", "qux").removeEventListener(Storage.changeEvent, /** @type {EventListener} */ (listener));
		});
	});

	describe("set()", () => {
		it("should properly serialize and set the storage entries", () => {
			const service = Storage.session();
			assert.isNull(sessionStorage.getItem("foo"));

			service.set("foo", "bar");
			assert.equal(sessionStorage.getItem("foo"), '"bar"');

			service.set("foo", 123);
			assert.equal(sessionStorage.getItem("foo"), "123");

			service.set("foo", {key: "value"});
			assert.equal(sessionStorage.getItem("foo"), '{"key":"value"}');
		});

		it("should handle the key prefix", () => {
			const service = Storage.session({keyPrefix: "prefix:"});
			assert.isNull(sessionStorage.getItem("prefix:baz"));

			service.set("baz", "qux");
			assert.equal(sessionStorage.getItem("prefix:baz"), '"qux"');

			service.set("baz", 456);
			assert.equal(sessionStorage.getItem("prefix:baz"), "456");

			service.set("baz", {key: "value"});
			assert.equal(sessionStorage.getItem("prefix:baz"), '{"key":"value"}');
		});
	});
});
