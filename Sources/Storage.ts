import {StorageEvent} from "./StorageEvent.js";

/**
 * Provides access to the [Web Storage](https://developer.mozilla.org/docs/Web/API/Web_Storage_API).
 */
export class Storage extends EventTarget implements Disposable, Iterable<[string, any], void, void> {

	/**
	 * The `change` event type.
	 */
	static readonly changeEvent = "webstorage:change";

	/**
	 * The underlying data store.
	 */
	readonly #backend: globalThis.Storage;

	/**
	 * A string prefixed to every key so that it is unique globally in the whole storage.
	 */
	readonly #keyPrefix: string;

	/**
	 * Creates a new storage service.
	 * @param backend The underlying data store.
	 * @param options An object providing values to initialize this instance.
	 */
	private constructor(backend: globalThis.Storage, options: StorageOptions = {}) {
		super();
		this.#backend = backend;
		this.#keyPrefix = options.keyPrefix ?? "";
		if (options.listenToGlobalEvents) addEventListener("storage", this.#dispatchGlobalEvent);
	}

	/**
	 * The keys of this storage.
	 */
	get keys(): Set<string> {
		const keys = new Array(this.#backend.length).fill(null).map((_, index) => this.#backend.key(index)!);
		return new Set(this.#keyPrefix ? keys.filter(key => key.startsWith(this.#keyPrefix)).map(key => key.slice(this.#keyPrefix.length)) : keys);
	}

	/**
	 * The number of entries in this storage.
	 */
	get length(): number {
		return this.keys.size;
	}

	/**
	 * Creates a new local storage service.
	 * @param options An object providing values to initialize the service.
	 * @returns The newly created service.
	 */
	static local(options: StorageOptions = {}): Storage {
		return new this(localStorage, options);
	}

	/**
	 * Creates a new session storage service.
	 * @param options An object providing values to initialize the service.
	 * @returns The newly created service.
	 */
	static session(options: StorageOptions = {}): Storage {
		return new this(sessionStorage, options);
	}

	/**
	 * Releases any resources associated with this object.
	 */
	[Symbol.dispose](): void {
		this.dispose();
	}

	/**
	 * Returns a new iterator that allows iterating the entries of this storage.
	 * @returns An iterator for the entries of this storage.
	 */
	*[Symbol.iterator](): Iterator<[string, any], void, void> {
		for (const key of this.keys) yield [key, this.get(key)];
	}

	/**
	 * Removes all entries from this storage.
	 */
	clear(): void {
		for (const key of this.keys) this.delete(key);
	}

	/**
	 * Removes the value associated with the specified key.
	 * @param key The storage key.
	 * @returns The value associated with the key before it was removed.
	 */
	delete<T>(key: string): T|null { // eslint-disable-line @typescript-eslint/no-unnecessary-type-parameters
		const oldValue = this.get<T>(key);
		this.#backend.removeItem(this.#buildKey(key));
		this.dispatchEvent(new StorageEvent(Storage.changeEvent, key, oldValue));
		return oldValue;
	}

	/**
	 * Cancels the subscription to the global storage events.
	 */
	dispose(): void {
		removeEventListener("storage", this.#dispatchGlobalEvent);
	}

	/**
	 * Gets the deserialized value associated with the specified key.
	 * @param key The storage key.
	 * @returns The storage value, or `null` if the key does not exist or the value cannot be deserialized.
	 */
	get<T>(key: string): T|null { // eslint-disable-line @typescript-eslint/no-unnecessary-type-parameters
		try { return JSON.parse(this.#backend.getItem(this.#buildKey(key)) ?? "") as T; }
		catch { return null; }
	}

	/**
	 * Gets a value indicating whether this storage contains the specified key.
	 * @param key The storage key.
	 * @returns `true` if this storage contains the specified key, otherwise `false`.
	 */
	has(key: string): boolean {
		return this.#backend.getItem(this.#buildKey(key)) != null;
	}

	/**
	 * Registers a function that will be invoked whenever the `change` event is triggered.
	 * @param listener The event handler to register.
	 * @returns This instance.
	 */
	onChange(listener: (event: StorageEvent) => void): this {
		this.addEventListener(Storage.changeEvent, listener as EventListener);
		return this;
	}

	/**
	 * Serializes and associates a given `value` with the specified `key`.
	 * @param key The storage key.
	 * @param value The storage value.
	 * @returns This instance.
	 */
	set(key: string, value: unknown): this {
		const oldValue = this.get(key);
		this.#backend.setItem(this.#buildKey(key), JSON.stringify(value));
		this.dispatchEvent(new StorageEvent(Storage.changeEvent, key, oldValue, value));
		return this;
	}

	/**
	 * Builds a normalized storage key from the given key.
	 * @param key The original key.
	 * @returns The normalized storage key.
	 */
	#buildKey(key: string): string {
		return `${this.#keyPrefix}${key}`;
	}

	/**
	 * Dispatches the specified global event.
	 * @param event The dispatched event.
	 */
	readonly #dispatchGlobalEvent: (event: globalThis.StorageEvent) => void = event => {
		if (event.storageArea != this.#backend || (event.key && !event.key.startsWith(this.#keyPrefix))) return;

		let oldValue = null; // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		try { oldValue = JSON.parse(event.oldValue ?? ""); } catch { /* Noop */ }

		let newValue = null; // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		try { newValue = JSON.parse(event.newValue ?? ""); } catch { /* Noop */ }

		this.dispatchEvent(new StorageEvent(Storage.changeEvent, (event.key ?? "").slice(this.#keyPrefix.length), oldValue, newValue));
	};
}

/**
 * Defines the options of a {@link Storage} instance.
 */
export type StorageOptions = Partial<{

	/**
	 * A string prefixed to every key so that it is unique globally in the whole storage.
	 */
	keyPrefix: string;

	/**
	 * Value indicating whether to listen to the global storage events.
	 */
	listenToGlobalEvents: boolean;
}>;
