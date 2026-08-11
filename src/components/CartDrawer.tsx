import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, CheckCircle, Smartphone } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'mpesa_stk' | 'success'>('cart');
  const [phone, setPhone] = useState('0712345678');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 300 : 0; // Nairobi delivery KSh 300
  const grandTotal = subtotal + deliveryFee;

  const handleCheckoutMPesa = () => {
    setCheckoutStep('mpesa_stk');
    setTimeout(() => {
      setCheckoutStep('success');
      onClearCart();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#FAF7F2] border-l border-[#E5D7C0] h-full flex flex-col justify-between p-6 overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5D7C0]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#B88E39]" />
            <h3 className="font-serif text-lg font-bold text-[#1C1814]">Your Cart</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#5C5247] hover:text-[#B88E39]">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Contents */}
        <div className="my-6 flex-1 overflow-y-auto space-y-4">
          {checkoutStep === 'cart' && (
            <>
              {cartItems.length === 0 ? (
                <div className="text-center py-16 text-[#5C5247] space-y-3">
                  <ShoppingBag className="w-12 h-12 text-[#E5D7C0] mx-auto" />
                  <p className="text-sm">Your shopping cart is currently empty.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#E5D7C0] flex items-center justify-between gap-3 shadow-sm"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#E5D7C0]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#1C1814] truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-[#B88E39] font-bold mt-0.5">
                        KSh {item.product.price.toLocaleString()}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="w-5 h-5 rounded bg-[#FAF7F2] border border-[#E5D7C0] text-[#1C1814] flex items-center justify-center text-xs hover:text-[#B88E39]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-[#1C1814] px-1">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="w-5 h-5 rounded bg-[#FAF7F2] border border-[#E5D7C0] text-[#1C1814] flex items-center justify-center text-xs hover:text-[#B88E39]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-[#8C8071] hover:text-[#B88E39] p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {checkoutStep === 'mpesa_stk' && (
            <div className="text-center py-12 space-y-4 animate-pulse">
              <Smartphone className="w-12 h-12 text-[#B88E39] mx-auto" />
              <h4 className="font-serif text-lg font-bold text-[#1C1814]">M-Pesa STK Prompt Triggered</h4>
              <p className="text-xs text-[#5C5247]">
                Please accept the prompt on <strong>{phone}</strong> for <strong>KSh {grandTotal.toLocaleString()}</strong>...
              </p>
            </div>
          )}

          {checkoutStep === 'success' && (
            <div className="text-center py-12 space-y-4">
              <CheckCircle className="w-12 h-12 text-[#B88E39] mx-auto" />
              <h4 className="font-serif text-lg font-bold text-[#1C1814]">Order Placed Successfully!</h4>
              <p className="text-xs text-[#5C5247]">
                Your retail items are being packaged. Dispatch confirmation will be sent to your phone via SMS/WhatsApp.
              </p>
              <button
                onClick={() => {
                  setCheckoutStep('cart');
                  onClose();
                }}
                className="bg-[#B88E39] text-[#FAF7F2] text-xs font-bold py-2.5 px-6 rounded-full"
              >
                Continue Browsing
              </button>
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout Button */}
        {cartItems.length > 0 && checkoutStep === 'cart' && (
          <div className="pt-4 border-t border-[#E5D7C0] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5C5247]">
                <span>Subtotal</span>
                <span>KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#5C5247]">
                <span>Nairobi Courier Dispatch</span>
                <span>KSh {deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#B88E39] pt-2 border-t border-[#E5D7C0]">
                <span>Total</span>
                <span>KSh {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase text-[#B88E39] font-bold block mb-1">
                M-Pesa Phone for Checkout
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#FFFDF9] border border-[#E5D7C0] rounded-xl p-2.5 text-xs text-[#1C1814] outline-none focus:border-[#B88E39]"
              />
            </div>

            <button
              onClick={handleCheckoutMPesa}
              className="w-full bg-[#1C1814] hover:bg-[#2C2620] text-[#FAF7F2] font-bold text-sm py-3 rounded-full transition-all shadow-md"
            >
              Pay KSh {grandTotal.toLocaleString()} via M-Pesa
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
