"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { Sale } from '../interfaces/sale.interface';

export type CartItem = {
    id: string;
    name: string;
    price: number;
    originalPrice: string;
    image: string;
    link: string;
    quantity: number;
    addedAt: number;
    shopId: string;
    shopTitle: string;
};

type CartContextType = {
    cartItems: any;
    addToCart: ( { product, sale }: { product: Omit<CartItem, "id" | "quantity" | "addedAt">; sale: Sale } ) => void;
    removeFromCart: ( saleId: string, id: string ) => void;
    updateQuantity: ( saleId: string, id: string, quantity: number ) => void;
    clearCart: () => void;
    getTotalCost: () => number;
};

const CartContext = createContext<CartContextType | undefined>( undefined );

function getInitialCartState(): any {
    if ( typeof window === "undefined" ) return {};
    const savedCart = localStorage.getItem( "cart" );
    if ( savedCart ) {
        try {
            return JSON.parse( savedCart );
        } catch ( error ) {
            console.error( "Failed to load cart from localStorage:", error );
            return {};
        }
    }
    return {};
}

export function CartProvider( { children }: { children: ReactNode } ) {
    const [ cartItems, setCartItems ] = useState<any>( getInitialCartState );

    const hasHydrated = useRef( false );

    // Save cart to localStorage whenever it changes
    useEffect( () => {
        hasHydrated.current = true;
        localStorage.setItem( "cart", JSON.stringify( cartItems ) );
    }, [ cartItems ] );

    const addToCart = useCallback( ( { product, sale }: { product: Omit<CartItem, "id" | "quantity" | "addedAt">; sale: Sale } ) => {
        setCartItems( ( prev: any ) => {
            const saleId = sale._id;

            if ( prev[ saleId ] ) {
                const foundProduct = prev[ saleId ].products.find( ( ( p: any ) => p._id === product._id ) );
                if ( foundProduct ) {
                    return {
                        ...prev,
                        [ saleId ]: {
                            ...prev[ saleId ],
                            products: prev[ saleId ].products
                                .map( ( ( p: any ) => p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p ) ),
                        }
                    }
                } else {
                    return {
                        ...prev,
                        [ saleId ]: {
                            ...prev[ saleId ],
                            products: [ ...prev[ saleId ].products, { ...product, quantity: 1 } ]
                        }
                    }
                }
            } else {
                prev[ saleId ] = {
                    sale,
                    products: [ { ...product, quantity: 1 } ]
                }
            }

            return { ...prev };
        } );
    }, [] );

    const removeFromCart = useCallback( ( saleId: string, id: string ) => {
        setCartItems( ( prev: any ) => {
            if ( !prev || typeof prev !== 'object' ) return {};
            const newCartItems = { ...prev };
            // Find and remove the product from all sales

            newCartItems[ saleId ] = {
                ...newCartItems[ saleId ],
                products: newCartItems[ saleId ].products.filter( ( product: any ) => product._id !== id )
            };

            return newCartItems;
        } );
    }, [] );

    const updateQuantity = useCallback( ( saleId: string, id: string, quantity: number ) => {
        if ( quantity <= 0 ) {
            removeFromCart( saleId, id );
            return;
        }

        setCartItems( ( prev: any ) => {
            if ( !prev || typeof prev !== 'object' ) return {};
            const newCartItems = { ...prev };

            newCartItems[ saleId ] = {
                ...newCartItems[ saleId ],
                products: newCartItems[ saleId ].products.map( ( product: any ) =>
                    product._id === id ? { ...product, quantity } : product
                )
            }

            return newCartItems;
        } );
    }, [ removeFromCart ] );

    const clearCart = useCallback( () => {
        setCartItems( {} );
    }, [] );

    const getTotalCost = useCallback( () => {
        if ( !cartItems || typeof cartItems !== 'object' ) return 0;
        return Object.values( cartItems ).reduce( ( total: number, sale: any ) => {
            const tmp = total + ( sale?.products?.reduce( ( sum: number, product: any ) =>
                sum + product.exchangedPrice * ( product?.quantity || 0 ), 0
            ) || 0 );
            return tmp;
        }, 0 );
    }, [ cartItems ] );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalCost,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext( CartContext );
    if ( !context ) {
        throw new Error( "useCart must be used within CartProvider" );
    }
    return context;
}
