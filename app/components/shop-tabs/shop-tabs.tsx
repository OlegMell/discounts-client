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
    exchanges: { cc: string; rate: number }[];
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

    const activeGroup = shopGroups.find( g => g.shopId === activeShopId );

    const filteredProducts = activeGroup
        ? activeGroup.products
        : dedupeProducts( sales );

    const activeSalesProgress = useMemo( () => {
        if ( !activeGroup ) {
            return [];
        }

        return activeGroup.sales.map( ( sale ) => {
            const exchange = exchanges.find( ( e ) => e.cc === sale.currency );
            const rate = exchange ? exchange.rate : 1;
            const orderedTotal = sale.orderedTotal ?? 0;
            const minCartCostUah = sale.minCartCost * rate * sale.commission;

            return {
                sale,
                orderedTotal,
                minCartCostUah,
                remainingToMinCart: Math.max( 0, minCartCostUah - orderedTotal )
            };
        } );
    }, [ activeGroup, exchanges ] );

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

            {
                ( activeGroup && activeGroup?.shop.delivery ) && (
                    <div className={styles.deliveryInfo}>
                        {activeGroup.shop.delivery}
                    </div>
                )
            }

            {/* {activeSalesProgress.length > 0 && (
                <div className={styles.saleProgressList}>
                    {activeSalesProgress.map( ( progress ) => (
                        <div key={progress.sale._id} className={styles.saleProgress}>
                            <div className={styles.saleProgressTitle}>
                                {`Сейл ${ progress.sale._id.slice( -6 ) } — ${ progress.sale.currency }`}
                            </div>
                            <div>Уже замовлено: ₴{progress.orderedTotal.toFixed( 2 )}</div>
                            <div>Мінімальна сума в UAH: ₴{progress.minCartCostUah.toFixed( 2 )}</div>
                            <div>
                                Не вистачає: ₴{progress.remainingToMinCart.toFixed( 2 )}
                            </div>
                        </div>
                    ) )}
                </div>
            )} */}

            {!filteredProducts.length ? (
                <div className={styles.empty}>Немає товарів за сьогодні.</div>
            ) : (
                <div className={styles.grid}>
                    {filteredProducts.map( ( product ) => (
                        <ProductCard addToCart={handleAddToCart} key={product._id} product={product} />
                    ) )}
                </div>
            )}
        </div>
    );
}