/* eslint-disable max-lines-per-function */
import {Storage} from "@cedx/webstorage";

/**
 * Tests the features of the {@link Storage} class.
 */
describe("Storage", () => {
	beforeEach(() => sessionStorage.clear());

	context("keys", () => {
		it("should return an empty array for an empty storage", () =>
			Storage.session().keys.should.be.empty);

		it("should return the list of keys for a non-empty storage", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');
			Storage.session().keys.should.have.ordered.members(["foo", "prefix:baz"]);
		});

		it("should handle the key prefix", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');
			Storage.session({keyPrefix: "prefix:"}).keys.should.have.members(["baz"]);
		});
	});

	context("length", () => {
		it("should return zero for an empty storage", () =>
			Storage.session().should.be.empty);

		it("should return the number of entries for a non-empty storage", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');
			Storage.session().should.have.lengthOf(2);
		});

		it("should handle the key prefix", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');
			Storage.session({keyPrefix: "prefix:"}).should.have.lengthOf(1);
		});
	});

	context("[Symbol.iterator]()", () => {
		it("should end iteration immediately if the storage is empty", () => {
			const iterator = Storage.session()[Symbol.iterator]();
			should.equal(iterator.next().done, true);
		});

		it("should iterate over the values if the storage is not empty", () => {
			const iterator = Storage.session()[Symbol.iterator]();
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');

			let next = iterator.next();
			should.equal(next.done, false);
			/** @type {string[]} */ (next.value).should.have.ordered.members(["foo", "bar"]);
			next = iterator.next();
			should.equal(next.done, false);
			/** @type {string[]} */ (next.value).should.have.ordered.members(["prefix:baz", "qux"]);
			should.equal(iterator.next().done, true);
		});

		it("should handle the key prefix", () => {
			const iterator = Storage.session({keyPrefix: "prefix:"})[Symbol.iterator]();
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');

			const next = iterator.next();
			should.equal(next.done, false);
			/** @type {string[]} */ (next.value).should.have.ordered.members(["baz", "qux"]);
			should.equal(iterator.next().done, true);
		});
	});

	context("clear()", () => {
		it("should remove all storage entries", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');

			Storage.session().clear();
			sessionStorage.should.be.empty;
		});

		it("should handle the key prefix", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');

			Storage.session({keyPrefix: "prefix:"}).clear();
			sessionStorage.should.have.lengthOf(1);
		});
	});

	context("delete()", () => {
		it("should properly remove the storage entries", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');

			Storage.session().delete("foo");
			sessionStorage.should.have.lengthOf(1);
			should.not.exist(sessionStorage.getItem("foo"));
		});

		it("should handle the key prefix", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');

			Storage.session({keyPrefix: "prefix:"}).delete("baz");
			sessionStorage.should.have.lengthOf(1);
			should.not.exist(sessionStorage.getItem("prefix:baz"));
		});
	});

	context("get()", () => {
		it("should properly get the deserialized storage entries", () => {
			const service = Storage.session();
			should.not.exist(service.get("foo"));

			sessionStorage.setItem("foo", '"bar"');
			/** @type {string} */ (service.get("foo")).should.equal("bar");

			sessionStorage.setItem("foo", "123");
			/** @type {number} */ (service.get("foo")).should.equal(123);

			sessionStorage.setItem("foo", '{"key": "value"}');
			/** @type {object} */ (service.get("foo")).should.deep.equal({key: "value"});

			sessionStorage.setItem("foo", "{bar[123]}");
			should.not.exist(service.get("foo"));

			sessionStorage.removeItem("foo");
			should.not.exist(service.get("foo"));
		});

		it("should handle the key prefix", () => {
			const service = Storage.session({keyPrefix: "prefix:"});
			should.not.exist(service.get("baz"));

			sessionStorage.setItem("prefix:baz", '"qux"');
			/** @type {string} */ (service.get("baz")).should.equal("qux");

			sessionStorage.setItem("prefix:baz", "456");
			/** @type {number} */ (service.get("baz")).should.equal(456);

			sessionStorage.setItem("prefix:baz", '{"key": "value"}');
			/** @type {object} */ (service.get("baz")).should.deep.equal({key: "value"});

			sessionStorage.setItem("prefix:baz", "{qux[456]}");
			should.not.exist(service.get("baz"));

			sessionStorage.removeItem("prefix:baz");
			should.not.exist(service.get("baz"));
		});
	});

	context("has()", () => {
		it("should return `false` if the specified key is not contained", () =>
			Storage.session().has("foo").should.be.false);

		it("should return `true` if the specified key is contained", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');

			const service = Storage.session();
			service.has("foo:bar").should.be.false;
			service.has("foo").should.be.true;
			service.has("prefix:baz").should.be.true;
		});

		it("should handle the key prefix", () => {
			sessionStorage.setItem("foo", '"bar"');
			sessionStorage.setItem("prefix:baz", '"qux"');

			const service = Storage.session({keyPrefix: "prefix:"});
			service.has("foo").should.be.false;
			service.has("baz").should.be.true;
		});
	});

	context("onChange()", () => {
		it("should trigger an event when a cookie is added", done => {
			const listener = (/** @type {import("@cedx/webstorage").StorageEvent} */ event) => {
				event.key.should.equal("foo");
				should.not.exist(event.oldValue);
				/** @type {number} */ (event.newValue).should.equal("bar"); // eslint-disable-line @typescript-eslint/no-unsafe-member-access
				done();
			};

			const service = Storage.session();
			const abortController = service.onChange(listener);
			service.set("foo", "bar");
			abortController.abort();
		});

		it("should trigger an event when a cookie is updated", done => {
			sessionStorage.setItem("foo", '"bar"');
			const listener = (/** @type {import("@cedx/webstorage").StorageEvent} */ event) => {
				event.key.should.equal("foo");
				/** @type {number} */ (event.oldValue).should.equal("bar"); // eslint-disable-line @typescript-eslint/no-unsafe-member-access
				/** @type {number} */ (event.newValue).should.equal("baz"); // eslint-disable-line @typescript-eslint/no-unsafe-member-access
				done();
			};

			const service = Storage.session();
			const abortController = service.onChange(listener);
			service.set("foo", "baz");
			abortController.abort();
		});

		it("should trigger an event when a cookie is removed", done => {
			sessionStorage.setItem("foo", '"bar"');
			const listener = (/** @type {import("@cedx/webstorage").StorageEvent} */ event) => {
				event.key.should.equal("foo");
				/** @type {number} */ (event.oldValue).should.equal("bar"); // eslint-disable-line @typescript-eslint/no-unsafe-member-access
				should.not.exist(event.newValue);
				done();
			};

			const service = Storage.session();
			const abortController = service.onChange(listener);
			service.delete("foo");
			abortController.abort();
		});

		it("should handle the key prefix", done => {
			const listener = (/** @type {import("@cedx/webstorage").StorageEvent} */ event) => {
				event.key.should.equal("baz");
				should.not.exist(event.oldValue);
				/** @type {number} */ (event.newValue).should.equal("qux"); // eslint-disable-line @typescript-eslint/no-unsafe-member-access
				done();
			};

			const service = Storage.local({keyPrefix: "prefix:"});
			const abortController = service.onChange(listener);
			service.set("baz", "qux");
			abortController.abort();
		});
	});

	context("set()", () => {
		it("should properly serialize and set the storage entries", () => {
			const service = Storage.session();
			should.not.exist(sessionStorage.getItem("foo"));

			service.set("foo", "bar");
			should.equal(sessionStorage.getItem("foo"), '"bar"');

			service.set("foo", 123);
			should.equal(sessionStorage.getItem("foo"), "123");

			service.set("foo", {key: "value"});
			should.equal(sessionStorage.getItem("foo"), '{"key":"value"}');
		});

		it("should handle the key prefix", () => {
			const service = Storage.session({keyPrefix: "prefix:"});
			should.not.exist(sessionStorage.getItem("prefix:baz"));

			service.set("baz", "qux");
			should.equal(sessionStorage.getItem("prefix:baz"), '"qux"');

			service.set("baz", 456);
			should.equal(sessionStorage.getItem("prefix:baz"), "456");

			service.set("baz", {key: "value"});
			should.equal(sessionStorage.getItem("prefix:baz"), '{"key":"value"}');
		});
	});
});
