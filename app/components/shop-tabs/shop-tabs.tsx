"use client";

import { useState } from "react";
import ProductCard from "../product-card/product-card";
import styles from "./shop-tabs.module.css";
import { Sale } from '../../interfaces/sale.interface';
import { useCart } from '../../context/CartContext';
import { Product } from '../../interfaces/product.interface';

type ShopTabsProps = {
    sales: Sale[];
    exchanges: { cc: string; rate: number }[]; // Replace 'any' with the actual type for exchanges if available
};

const ALL = 'Усі';

export default function ShopTabs( { sales, exchanges }: ShopTabsProps ) {
    console.log( sales )
    const [ activeSaleId, setActiveSaleId ] = useState<string | null>( null );
    const { addToCart } = useCart();

    const usdExchange = exchanges.find( e => e.cc === 'USD' );
    const usdRate = usdExchange ? usdExchange.rate : 1;

    const filteredProducts = sales.find( sale => sale._id === activeSaleId )?.products || sales.flatMap( sale => sale.products );

    const minCartPrice = sales.find( sale => sale._id === activeSaleId )?.minCartCost;

    const handle = ( sale: Sale | typeof ALL ) => {
        setActiveSaleId( typeof sale === 'string' ? null : sale._id );
    }

    const handleAddToCart = ( product: Product ) => {
        // Find the sale that contains this product
        const sale = sales.find( sale => sale.products.some( p => p._id === product._id ) );
        if ( sale ) {
            addToCart( {
                product,
                sale,
            } );
        }
    };

    return (
        <div>
            <div className={styles.tabs}>
                <button
                    className={`${ styles.tab } ${ !activeSaleId ? styles.active : "" }`}
                    type="button"
                    onClick={() => handle( ALL )}
                >
                    {ALL}
                </button>

                {sales.map( ( sale ) => (
                    <button
                        key={sale.shop.title}
                        className={`${ styles.tab } ${ activeSaleId === sale._id ? styles.active : "" }`}
                        type="button"
                        onClick={() => handle( sale )}
                    >
                        {sale.shop.title} ({sale.products.length})
                    </button>
                ) )}
            </div>

            {minCartPrice && (
                <div>
                    <b>Мінімальна сума кошика: ${minCartPrice}</b>
                </div>
            )}

            {filteredProducts.length === 0 ? (
                <div className={styles.empty}>Немає товарів за сьогодні.</div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, 180px)",
                        gap: "20px",
                        padding: "20px 0",
                    }}
                >
                    {filteredProducts.map( ( product ) => (
                        <ProductCard addToCart={handleAddToCart} key={product._id} product={product} usdRate={usdRate} />
                    ) )}
                </div>
            )}
        </div>
    );
}