import { getSalesData } from '../../lib/get-sales';

export async function GET() {
    try {
        const products = await getSalesData();

        return Response.json( products );
    } catch ( error ) {
        console.error( 'Error fetching products:', error );
        return Response.json( { error: 'Failed to fetch products' }, { status: 500 } );
    }
}