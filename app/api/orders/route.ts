import dbConnect from './../../../db';
import Order from './../../models/order';

export async function POST( request: Request ) {
    try {
        await dbConnect();

        const body = await request.json();

        if ( !body || !Array.isArray( body ) ) {
            return Response.json( { error: 'Orders array is required' }, { status: 400 } );
        }

        const savedOrders = [];
        for ( const orderData of body ) {
            const { sale, customerInfo, items } = orderData;

            if ( !sale || !customerInfo || !items || !Array.isArray( items ) ) {
                return Response.json( { error: 'Invalid order data' }, { status: 400 } );
            }

            const order = new Order( {
                sale,
                customerInfo,
                items: items.map( item => ( {
                    productId: item.productId,
                    quantity: item.quantity,
                    price: parseFloat( item.price )
                } ) ),
                totalCost: parseFloat( orderData.totalCost )
            } );

            await order.save();
            savedOrders.push( { orderId: order._id } );
        }

        return Response.json( { message: 'Orders created successfully', orders: savedOrders }, { status: 201 } );
    } catch ( error ) {
        console.error( 'Error creating orders:', error );
        return Response.json( { error: 'Failed to create orders' }, { status: 500 } );
    }
}