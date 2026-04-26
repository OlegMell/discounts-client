import dbConnect from '../../db';
import { type Types } from 'mongoose';
import type { Sale } from '../interfaces/sale.interface';
import Shop from '../models/shop';
import Discount from '../models/product';
import sale from '../models/sale';
import Order from '../models/order';

type StoredSale = Omit<Sale, '_id'> & { _id: Types.ObjectId };

/** Shared by GET /api/sale and the home page — avoids fetch() to localhost during next build. */
export async function getSalesData() {
    await dbConnect();

    const startOfDay = new Date();
    startOfDay.setHours( 0, 0, 0, 0 );
    const endOfDay = new Date();
    endOfDay.setHours( 23, 59, 59, 999 );

    const query = {
        createdAt: {
            $gte: startOfDay,
            $lt: endOfDay,
        },
    };

    const sales = await sale
        .find( query )
        .populate( { path: 'shop', model: Shop } )
        .populate( { path: 'products', model: Discount } )
        .sort( { _id: -1 } )
        .lean<StoredSale[]>();

    const saleIds = sales.map( ( item ) => item._id );
    const orderTotals = await Order.aggregate( [
        { $match: { sale: { $in: saleIds } } },
        { $group: { _id: '$sale', orderedTotal: { $sum: '$totalCost' } } }
    ] ) as Array<{ _id: Types.ObjectId; orderedTotal: number }>;

    const orderTotalsMap = new Map<string, number>(
        orderTotals.map( ( item ) => [ item._id.toString(), item.orderedTotal ] )
    );

    return sales.map( ( saleItem ) => ( {
        ...saleItem,
        _id: saleItem._id.toString(),
        orderedTotal: orderTotalsMap.get( saleItem._id.toString() ) ?? 0,
    } ) );
}
