/**
 * Розбирає рядок ціни: "$1,450.00", "1,450.00", "1450", "€12,50" тощо.
 * US-стиль: кома — розділювач тисяч, крапка — дробова частина.
 * Європейський варіант з крапкою та комою: "1.234,56".
 */
export function parsePriceString( raw: string ): number {
    if ( raw == null || typeof raw !== 'string' ) return 0;

    let s = raw
        .trim()
        .replace( /[\u00A0\u202F]/g, '' )
        .replace( /\s+/g, '' );

    s = s.replace( /^[\$€£₴¥]+|[\$€£₴¥]+$/gu, '' );

    const hasDot = s.includes( '.' );
    const hasComma = s.includes( ',' );

    if ( !hasComma && !hasDot ) {
        const n = parseFloat( s.replace( /[^\d.-]/g, '' ) );
        return Number.isFinite( n ) ? n : 0;
    }

    if ( hasComma && hasDot ) {
        if ( s.lastIndexOf( '.' ) > s.lastIndexOf( ',' ) ) {
            const normalized = s.replace( /,/g, '' );
            const n = parseFloat( normalized );
            return Number.isFinite( n ) ? n : 0;
        }
        const normalized = s.replace( /\./g, '' ).replace( ',', '.' );
        const n = parseFloat( normalized );
        return Number.isFinite( n ) ? n : 0;
    }

    if ( hasComma && !hasDot ) {
        const parts = s.split( ',' );
        if ( parts.length === 2 ) {
            const [ a, b ] = parts;
            if ( /^\d+$/.test( a ) && /^\d+$/.test( b ) ) {
                if ( b.length === 3 && a.length <= 3 ) {
                    return parseFloat( a + b ) || 0;
                }
                if ( b.length <= 2 ) {
                    return parseFloat( `${ a }.${ b }` ) || 0;
                }
            }
        }
        const n = parseFloat( s.replace( /,/g, '' ) );
        return Number.isFinite( n ) ? n : 0;
    }

    const n = parseFloat( s.replace( /[^\d.-]/g, '' ) );
    return Number.isFinite( n ) ? n : 0;
}
