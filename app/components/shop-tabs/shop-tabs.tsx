"use client";

import { useMemo, useState } from "react";
import ProductCard from "../product-card/product-card";
import styles from "./shop-tabs.module.css";
import { Sale } from '../../interfaces/sale.interface';
import { Shop } from '../../interfaces/shop.interface';
import { useCart, type CartItem } from '../../context/CartContext';
import { Product } from '../../interfaces/product.interface';

type ShopTabsProps = {
    sales: Sale[];
    exchanges: { cc: string; rate: number }[]; // Replace 'any' with the actual type for exchanges if available
};

const ALL = 'Усі';

type ShopGroup = {
    shopId: string;
    shop: Shop;
    sales: Sale[];
    products: Product[];
};

function groupSalesByShop( sales: Sale[] ): ShopGroup[] {
    const byShop = new Map<string, ShopGroup>();
    for ( const sale of sales ) {
        const shopId = sale.shop._id;
        let group = byShop.get( shopId );
        if ( !group ) {
            group = { shopId, shop: sale.shop, sales: [], products: [] };
            byShop.set( shopId, group );
        }
        group.sales.push( sale );
        const seen = new Set( group.products.map( p => p._id ) );
        for ( const p of sale.products ) {
            if ( !seen.has( p._id ) ) {
                seen.add( p._id );
                group.products.push( p );
            }
        }
    }
    return [ ...byShop.values() ];
}

function dedupeProducts( sales: Sale[] ): Product[] {
    const seen = new Set<string>();
    const out: Product[] = [];
    for ( const sale of sales ) {
        for ( const p of sale.products ) {
            if ( !seen.has( p._id ) ) {
                seen.add( p._id );
                out.push( p );
            }
        }
    }
    return out;
}

export default function ShopTabs( { sales, exchanges }: ShopTabsProps ) {
    const [ activeShopId, setActiveShopId ] = useState<string | null>( null );
    const { addToCart } = useCart();

    const shopGroups = useMemo( () => groupSalesByShop( sales ), [ sales ] );

    const usdExchange = exchanges.find( e => e.cc === 'USD' );
    const usdRate = usdExchange ? usdExchange.rate : 1;

    const activeGroup = shopGroups.find( g => g.shopId === activeShopId );

    const filteredProducts = activeGroup
        ? activeGroup.products
        : dedupeProducts( sales );

    const minCartPrice = activeGroup
        ? Math.min( ...activeGroup.sales.map( s => s.minCartCost ) )
        : undefined;

    const handle = ( group: ShopGroup | typeof ALL ) => {
        setActiveShopId( typeof group === 'string' ? null : group.shopId );
    }

    const handleAddToCart = ( product: Product ) => {
        const sale = sales.find( s => s.products.some( p => p._id === product._id ) );
        if ( sale ) {
            addToCart( {
                product: product as unknown as Omit<CartItem, "id" | "quantity" | "addedAt">,
                sale,
            } );
        }
    };

    return (
        <div>
            <div className={styles.tabs}>
                <button
                    className={`${ styles.tab } ${ !activeShopId ? styles.active : "" }`}
                    type="button"
                    onClick={() => handle( ALL )}
                >
                    {ALL}
                </button>

                {shopGroups.map( ( group ) => (
                    <button
                        key={group.shopId}
                        className={`${ styles.tab } ${ activeShopId === group.shopId ? styles.active : "" }`}
                        type="button"
                        onClick={() => handle( group )}
                    >
                        {group.shop.title} ({group.products.length})
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