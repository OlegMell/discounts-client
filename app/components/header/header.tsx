"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";
import CartDialog from "@/app/components/cart-dialog/cart-dialog";
import styles from './header.module.css';

export default function Header( { exchanges }: { exchanges: any[] } ) {
    const [ isCartOpen, setIsCartOpen ] = useState( false );
    const [ isExchangesOpen, setIsExchangesOpen ] = useState( false );
    const [ mounted, setMounted ] = useState( false );
    const { cartItems } = useCart();

    // Calculate item count from cartItems object
    const itemCount = cartItems && typeof cartItems === 'object'
        ? Object.values( cartItems ).reduce( ( total: number, sale: any ) =>
            total + ( sale?.products?.reduce( ( sum: number, product: any ) => sum + ( product?.quantity || 0 ), 0 ) || 0 ), 0
        )
        : 0;

    useEffect( () => {
        setMounted( true );
    }, [] );

    const usdExchange = exchanges.find( e => e.cc === 'USD' );
    const usdRate = usdExchange ? usdExchange.rate : 1;

    return (
        <>
            <header className={styles.header}>
                <h1 className={styles.headerTitle}>America Europe Shop</h1>

                <div className='flex gap-[12px] items-center'>
                    <button
                        onClick={() => setIsExchangesOpen( !isExchangesOpen )}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                            padding: '8px',
                            display: 'none',
                        }}
                        className={styles.exchangeToggle}
                        title="Курси валют"
                    >
                        💱
                    </button>

                    <div className={styles.headerExchanges} style={{
                        display: isExchangesOpen ? 'flex' : undefined,
                    }}>
                        {exchanges.filter( exchange => [ 'USD', 'EUR', 'GBP' ].includes( exchange.cc ) ).map( ( exchange ) => (
                            <div key={exchange.r030} className={styles.exchange}>
                                <span>{exchange.txt}:</span>
                                <span> {exchange.rate.toFixed( 2 )}</span>
                            </div>
                        ) )}
                    </div>

                    {/* <button
                        onClick={() => setIsCartOpen( true )}
                        style={{
                            position: 'relative',
                            background: 'none',
                            border: 'none',
                            fontSize: '28px',
                            cursor: 'pointer',
                            padding: '8px',
                        }}
                        title="Кошик"
                    >
                        🛒
                        {mounted && itemCount > 0 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    background: '#dc2626',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                }}
                            >
                                {itemCount}
                            </span>
                        )}
                    </button> */}
                </div>
            </header>
            <CartDialog isOpen={isCartOpen} onClose={() => setIsCartOpen( false )} usdRate={usdRate} />
        </>
    )
}