import dbConnect from '../../db';
import Shop from '../models/shop';
import Discount from '../models/product';
import sale from '../models/sale';

/** Shared by GET /api/sale and the home page — avoids fetch() to localhost during next build. */
export async function getSalesData() {
    await dbConnect();

    return sale
        .find( {} )
        .populate( { path: 'shop', model: Shop } )
        .populate( { path: 'products', model: Discount } )
        .sort( { _id: -1 } )
        .lean();
}
