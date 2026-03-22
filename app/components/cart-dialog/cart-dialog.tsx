"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import styles from "./cart-dialog.module.css";

type CartDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    usdRate: number;
};

export default function CartDialog( { isOpen, onClose, usdRate }: CartDialogProps ) {
    const { cartItems, removeFromCart, updateQuantity, getTotalCost, clearCart } = useCart();
    const [ showForm, setShowForm ] = useState( false );
    const [ formData, setFormData ] = useState( {
        fullName: '',
        address: '',
        delivery: '',
        phone: '+380',
        comment: '',
    } );
    const [ submitting, setSubmitting ] = useState( false );
    const [ submitMessage, setSubmitMessage ] = useState( '' );

    if ( !isOpen ) return null;

    // Flatten cartItems into a simple array for display
    const items = cartItems && typeof cartItems === 'object'
        ? Object.values( cartItems ).flatMap( ( sale: any ) =>
            sale?.products?.map( ( product: any ) => ( {
                ...product,
                sale: sale
            } ) ) || []
        )
        : [];

    const totalCost = getTotalCost();
    const itemCount = items.reduce( ( sum, item ) => sum + item.quantity, 0 );

    const handleCheckout = () => {
        setShowForm( true );
    };

    const handleFormChange = ( e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ) => {
        const { name, value } = e.target;
        if ( name === 'phone' ) {
            // Format phone number
            let formatted = value.replace( /\D/g, '' );
            if ( formatted.startsWith( '380' ) ) {
                formatted = '+380' + formatted.slice( 3 );
            } else if ( formatted.startsWith( '0' ) ) {
                formatted = '+380' + formatted.slice( 1 );
            } else {
                formatted = '+380' + formatted;
            }
            formatted = formatted.slice( 0, 13 ); // +380 + 9 digits
            setFormData( { ...formData, phone: formatted } );
        } else {
            setFormData( { ...formData, [ name ]: value } );
        }
    };

    const handleSubmit = async ( e: React.FormEvent ) => {
        e.preventDefault();
        if ( submitting ) return;

        setSubmitting( true );
        setSubmitMessage( '' );

        try {

            const orders = Object.entries( cartItems ).map( ( [ saleId, saleData ]: [ string, any ] ) => ( {
                sale: saleId,
                customerInfo: formData,
                items: saleData.products.map( ( item: any ) => ( {
                    productId: item._id,
                    quantity: item.quantity,
                    price: ( item.exchangedPrice * item.quantity ).toFixed( 2 ),
                } ) ),
                totalCost: ( saleData.products.reduce( ( sum: number, item: any ) => sum + item.exchangedPrice * item.quantity, 0 ) ).toFixed( 2 ),
            } ) );

            const response = await fetch( '/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( orders ),
            } );

            if ( response.ok ) {
                setSubmitMessage( 'Замовлення успішно створено!' );
                clearCart();
                setShowForm( false );
                setFormData( {
                    fullName: '',
                    address: '',
                    delivery: '',
                    phone: '+380',
                    comment: '',
                } );
            } else {
                const error = await response.json();
                setSubmitMessage( error.error || 'Помилка при створенні замовлення' );
            }
        } catch ( error ) {
            setSubmitMessage( 'Помилка при створенні замовлення' );
        } finally {
            setSubmitting( false );
        }
    };

    const handleBackToCart = () => {
        setShowForm( false );
        setSubmitMessage( '' );
    };

    return (
        <div className={styles.dialogOverlay} onClick={onClose}>
            <div className={styles.dialogContent} onClick={( e ) => e.stopPropagation()}>
                <div className={styles.dialogHeader}>
                    <h2>{showForm ? 'Оформлення замовлення' : 'Ваш кошик'}</h2>
                    <button
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label="Close cart"
                    >
                        ✕
                    </button>
                </div>

                {showForm ? (
                    <form onSubmit={handleSubmit} className={styles.orderForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="fullName">Повне ім'я *</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="address">Адреса *</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="delivery">Доставка (номер відділення Нової пошти або поштомату) *</label>
                            <input
                                type="text"
                                id="delivery"
                                name="delivery"
                                value={formData.delivery}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="phone">Телефон *</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleFormChange}
                                pattern="\+380\d{9}"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="comment">Коментар *</label>
                            <textarea
                                id="comment"
                                name="comment"
                                value={formData.comment}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        {submitMessage && (
                            <div className={styles.submitMessage}>
                                {submitMessage}
                            </div>
                        )}
                        <div className={styles.formButtons}>
                            <button type="button" onClick={handleBackToCart} className={styles.backButton}>
                                Назад до кошика
                            </button>
                            <button type="submit" disabled={submitting} className={styles.submitButton}>
                                {submitting ? 'Відправка...' : 'Підтвердити замовлення'}
                            </button>
                        </div>
                    </form>
                ) : items.length === 0 ? (
                    <div className={styles.emptyCart}>
                        <p>Ваш кошик порожній</p>
                    </div>
                ) : (
                    <>
                        <div>
                            {cartItems && Object.entries( cartItems ).map( ( [ saleId, saleData ] ) => (
                                <div key={saleId} className={styles.saleGroup}>
                                    <h2>{saleData.sale.shop.title}</h2>
                                    {saleData.products.map( ( item ) => (
                                        <div key={item._id} className={styles.cartItem}>
                                            <img src={item.image} alt={item.name} />
                                            <div className={styles.itemDetails}>
                                                <h3>{item.name}</h3>
                                                <p className={styles.itemPrice}>
                                                    ₴{( item.exchangedPrice ).toFixed( 2 )}
                                                </p>
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.itemLink}
                                                >
                                                    Переглянути в магазині →
                                                </a>
                                            </div>

                                            <div className={styles.quantityControl}>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity( saleId, item._id, item.quantity - 1 )
                                                    }
                                                    className={styles.quantityButton}
                                                >
                                                    −
                                                </button>
                                                <span className={styles.quantity}>
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity( saleId, item._id, item.quantity + 1 )
                                                    }
                                                    className={styles.quantityButton}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className={styles.itemTotal}>
                                                ₴{( item.exchangedPrice * item.quantity ).toFixed( 2 )}
                                            </div>

                                            <button
                                                onClick={() => removeFromCart( saleId, item._id )}
                                                className={styles.removeButton}
                                                title="Remove from cart"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ) )}
                                </div>
                            ) )}
                        </div>

                        <div className={styles.cartSummary}>
                            <div className={styles.summaryRow}>
                                <span>Товари:</span>
                                <span>{itemCount}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Підсумок:</span>
                                <span>₴{( totalCost ).toFixed( 2 )}</span>
                            </div>
                            <div className={styles.summaryRow + " " + styles.total}>
                                <span>Всього:</span>
                                <span>₴{( totalCost ).toFixed( 2 )}</span>
                            </div>
                        </div>

                        <button className={styles.checkoutButton} onClick={handleCheckout}>
                            Оформити замовлення
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
