import dbConnect from './../../../db';
import Shop from './../../models/shop';
import Product from './../../models/product';

export async function GET() {
    try {
        await dbConnect();

        const now = new Date();
        const startOfToday = new Date( now.getFullYear(), now.getMonth(), now.getDate() );
        const startOfTomorrow = new Date( now.getFullYear(), now.getMonth(), now.getDate() + 1 );

        const products = await Product.find( {
            // createdAt: {
            //     $gte: startOfToday,
            //     $lt: startOfTomorrow,
            // },
        } )
            .populate( { path: 'shop', model: Shop } )
            .sort( { _id: -1 } );

        return Response.json( products );
    } catch ( error ) {
        console.error( 'Error fetching products:', error );
        return Response.json( { error: 'Failed to fetch products' }, { status: 500 } );
    }
}