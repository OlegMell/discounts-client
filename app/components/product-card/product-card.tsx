"use client";

import { useState } from "react";
import styles from "./product-card.module.css";
import { Product } from '../../interfaces/product.interface';

export default function ProductCard( { product, usdRate, addToCart }: { addToCart: any; product: Product; usdRate: number } ) {
    const [ copied, setCopied ] = useState( false );
    const [ addedToCart, setAddedToCart ] = useState( false );

    const handleCopyLink = ( e: React.MouseEvent ) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText( product.link );
        setCopied( true );
        setTimeout( () => setCopied( false ), 2000 );
    };

    const handleAddToCart = ( e: React.MouseEvent ) => {
        e.preventDefault();
        e.stopPropagation();

        addToCart( product );

        setAddedToCart( true );
        setTimeout( () => setAddedToCart( false ), 2000 );
    };

    return (
        <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
        >
            <div className={styles.imageWrapper}>
                <img src={product.image} alt={product.name} />
            </div>

            <div className={styles.info}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                    <div className={styles.name}>{product.name}</div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button
                            onClick={handleCopyLink}
                            title="Copy link"
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                fontSize: '18px',
                            }}
                        >
                            {copied ? '✓' : '🔗'}
                        </button>
                    </div>
                </div>

                <div className={styles.prices}>
                    <div className='flex flex-col'>
                        <div className={styles.price}>{product.price}</div>
                        <div className={styles.price}>₴{product.exchangedPrice}</div>
                    </div>

                    {product.old_price && (
                        <div className='flex flex-col'>
                            <span className={styles.oldPrice}>{product.old_price}</span>
                            <span className={styles.oldPrice}>₴{( ( parseFloat( product.old_price.match( /[\d,]+\.?\d*/ )?.[ 0 ]?.replace( /,/g, '' ) || '0' ) * usdRate ) * 1.011 ).toFixed( 2 )}</span>
                        </div>
                    )}
                </div>

                <button onClick={handleAddToCart} type='button' className={styles.cartButton}> {addedToCart ? 'Додано ✓' : 'В кошик 🛒'}</button>
            </div>
        </a>
    );
}