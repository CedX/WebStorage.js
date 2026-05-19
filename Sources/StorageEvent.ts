/**
 * An event dispatched when the storage has been changed.
 */
export class StorageEvent extends Event {

	/**
	 * The changed key.
	 */
	readonly key: string;

	/**
	 * The new value.
	 */
	readonly newValue: any;

	/**
	 * The original value.
	 */
	readonly oldValue: any;

	/**
	 * Creates a new cookie event.
	 * @param type The event type.
	 * @param key The changed key.
	 * @param oldValue The original value.
	 * @param newValue The new value.
	 */
	constructor(type: string, key: string, oldValue: unknown = null, newValue: unknown = null) {
		super(type, {bubbles: true});
		this.key = key;
		this.newValue = newValue;
		this.oldValue = oldValue;
	}
}
