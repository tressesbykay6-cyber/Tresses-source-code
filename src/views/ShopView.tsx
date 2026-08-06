import React from 'react';
import { ShoppingBag, Star, Check, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ShopViewProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onOpenCart: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ products, onAddToCart, onOpenCart }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-in">
      
      {/* Title */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-[#B88E39] font-bold flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4" /> Atelier Retail Shop
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C1814]">
          Hair Care & Styling Essentials
        </h1>
        <p className="text-sm text-[#5C5247] font-light leading-relaxed">
          Professional edge controls, silk bonnets, lace melting spray, and HD lace kits used in-house at Tresses by Kay. Delivered across Nairobi.
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="bg-[#FFFDF9] rounded-3xl overflow-hidden border border-[#E5D7C0] hover:border-[#B88E39]/60 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md"
          >
            <div className="relative h-64 bg-[#FAF7F2] overflow-hidden">
              <img
                src={prod.image}
                alt={prod.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-[#FFFDF9]/90 text-[#B88E39] text-[10px] uppercase font-bold px-3 py-1 rounded-full border border-[#E5D7C0] backdrop-blur-md shadow-sm">
                {prod.category}
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#B88E39] font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> {prod.rating}
                  </span>
                  <span className="text-[11px] text-[#5C5247] font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-[#B88E39]" /> In Stock (Nairobi)
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#1C1814] group-hover:text-[#B88E39] transition-colors">
                  {prod.name}
                </h3>
                
                <p className="text-xs text-[#5C5247] font-light line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5D7C0]/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8C8071] block">Price</span>
                  <span className="text-base font-bold text-[#B88E39]">
                    KSh {prod.price.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => onAddToCart(prod)}
                  className="bg-[#1C1814] hover:bg-[#2C2620] text-[#FAF7F2] text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-sm flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#B88E39]" />
                  <span>Add to cart</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
