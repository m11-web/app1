import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../lib/store';
import { Product, getCurrentPrice, getDiscountedPrice, isFriday } from '../lib/types';
import { useCart } from '../context/CartContext';
import Spinner from '../components/Spinner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { addItem, items } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then(p => { setProduct(p); if (p) setSelectedImg(p.image_url); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8">
      <p className="text-5xl">😔</p>
      <p className="font-bold text-gray-900 dark:text-white">Product not found</p>
      <button onClick={() => nav('/shop')} className="text-primary font-semibold">← Back to Shop</button>
    </div>
  );

  const price = getCurrentPrice(product);
  const discountedPrice = getDiscountedPrice(product);
  const hasDiscount = product.discount_percent > 0;
  const friday = isFriday();
  const outOfStock = product.stock_quantity === 0;
  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean);
  const cartItem = items.find(i => i.product.id === product.id);

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-28">

      {/* Back button over image */}
      <div className="relative">
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {showVideo && product.video_url ? (
            <video src={product.video_url} controls autoPlay className="w-full h-full object-cover" />
          ) : (
            <img
              src={selectedImg || product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/E75480/white?text=🌿'; }}
            />
          )}
        </div>

        {/* Back */}
        <button
          onClick={() => nav(-1)}
          className="absolute top-12 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center shadow-md text-gray-900 dark:text-white font-bold"
        >←</button>

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-12 right-4 bg-primary text-white font-bold text-xs px-3 py-1 rounded-full">
            {friday ? '🌟 FRIDAY' : `-${product.discount_percent}%`}
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {(allImages.length > 1 || product.video_url) && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide bg-white dark:bg-gray-900">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => { setSelectedImg(img); setShowVideo(false); }}
              className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${selectedImg === img && !showVideo ? 'border-primary' : 'border-transparent'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
          {product.video_url && (
            <button
              onClick={() => setShowVideo(true)}
              className={`flex-shrink-0 w-14 h-14 rounded-xl border-2 flex items-center justify-center bg-gray-900 transition-all ${showVideo ? 'border-primary' : 'border-transparent'}`}
            >
              <span className="text-xl">▶️</span>
            </button>
          )}
        </div>
      )}

      {/* Product info */}
      <div className="px-5 py-4 space-y-4">
        {friday && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl px-4 py-2.5">
            <p className="text-yellow-700 dark:text-yellow-400 text-sm font-bold">🌟 Friday Sale Active!</p>
          </div>
        )}

        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.category}</p>
          <h1 className="font-extrabold text-gray-900 dark:text-white text-xl leading-tight">{product.name}</h1>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-primary">Rs. {price}</span>
          {hasDiscount && (
            <>
              <span className="text-gray-400 line-through text-base">Rs. {product.retail_price}</span>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{product.discount_percent}% OFF</span>
            </>
          )}
        </div>

        {/* Stock */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
          outOfStock ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : product.stock_quantity <= 5 ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500' : 'bg-green-50 dark:bg-green-900/20 text-green-600'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {outOfStock ? 'Out of Stock' : product.stock_quantity <= 5 ? `Only ${product.stock_quantity} left!` : 'In Stock'}
        </div>

        {/* Description */}
        {product.description && (
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Qty selector */}
        {!outOfStock && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 font-bold text-lg flex items-center justify-center active:scale-90 transition-transform"
              >−</button>
              <span className="font-extrabold text-gray-900 dark:text-white text-lg w-8 text-center">{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(product.stock_quantity, q + 1))}
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 font-bold text-lg flex items-center justify-center active:scale-90 transition-transform"
              >+</button>
            </div>
          </div>
        )}

        {cartItem && (
          <p className="text-xs text-primary font-semibold">✓ {cartItem.quantity} already in cart</p>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-5 py-4 flex gap-3 z-30">
        <button
          onClick={() => nav('/cart')}
          className="flex-1 py-3.5 rounded-2xl border-2 border-primary text-primary font-extrabold text-sm active:scale-95 transition-transform"
        >
          View Cart {items.length > 0 && `(${items.reduce((s, i) => s + i.quantity, 0)})`}
        </button>
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className={`flex-1 py-3.5 rounded-2xl font-extrabold text-sm transition-all active:scale-95 ${
            outOfStock ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              : added ? 'bg-green-500 text-white'
              : 'bg-primary text-white shadow-lg shadow-primary/30'
          }`}
        >
          {outOfStock ? 'Out of Stock' : added ? '✓ Added!' : `Add to Cart`}
        </button>
      </div>
    </div>
  );
}
