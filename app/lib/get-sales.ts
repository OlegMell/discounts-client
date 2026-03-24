import dbConnect from '../../db';
import Shop from '../models/shop';
import Discount from '../models/product';
import sale from '../models/sale';

/** Shared by GET /api/sale and the home page — avoids fetch() to localhost during next build. */
export async function getSalesData() {
    await dbConnect();

    const startOfDay = new Date();
    startOfDay.setHours( 0, 0, 0, 0 );
    const endOfDay = new Date();
    endOfDay.setHours( 23, 59, 59, 999 );


    console.log( 'startOfDay', startOfDay.toISOString() )

    const query: any = {};
    query.createdAt = {
        $gte: startOfDay,
        $lt: endOfDay,
    };

    return sale
        .find( query )
        .populate( { path: 'shop', model: Shop } )
        .populate( { path: 'products', model: Discount } )
        .sort( { _id: -1 } )
        .lean();
}
