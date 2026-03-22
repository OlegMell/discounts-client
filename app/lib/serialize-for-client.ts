/** Strips non-plain values (ObjectId, Date, etc.) for Server → Client Component props. */
export function toPlainJson<T>( value: T ): T {
    return JSON.parse( JSON.stringify( value ) );
}
