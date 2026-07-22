import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { getProductById } from '../../src/lib/store';
import { Product, getCurrentPrice, isFriday } from '../../src/lib/types';
import { useCart } from '../../src/context/CartContext';
import { useTheme } from '../../src/context/ThemeContext';
import Spinner from '../../src/components/Spinner';
import { COLORS, getThemeColors } from '../../src/constants/colors';

const PLACEHOLDER = 'https://placehold.co/400x400/E75480/white?text=🌿';
const STATUS_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 44;
const SCREEN_W = Dimensions.get('window').width;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addItem, items } = useCart();
  const { isDark } = useTheme();
  const tc = getThemeColors(isDark);
  const { width } = useWindowDimensions();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then(p => { setProduct(p); })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <View style={[styles.center, { backgroundColor: tc.bg }]}><Spinner /></View>;
  }

  if (!product) {
    return (
      <View style={[styles.center, { backgroundColor: tc.bg, gap: 12 }]}>
        <Text style={{ fontSize: 48 }}>😔</Text>
        <Text style={[styles.notFoundText, { color: tc.text }]}>Product not found</Text>
        <TouchableOpacity onPress={() => router.push('/shop')} activeOpacity={0.7}>
          <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: 14 }}>← Back to Shop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const price = getCurrentPrice(product);
  const hasDiscount = product.discount_percent > 0;
  const friday = isFriday();
  const outOfStock = product.stock_quantity === 0;

  // Build slides: images first, then video slot last
  const imgSlides = [...new Set([product.image_url, ...(product.images || [])].filter(Boolean))];
  const hasVideo = !!product.video_url;
  // total slides = images + (video ? 1 : 0)
  const totalSlides = imgSlides.length + (hasVideo ? 1 : 0);
  const isVideoSlide = (i: number) => hasVideo && i === imgSlides.length;

  const cartItem = items.find(i => i.product.id === product.id);

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const stockStatus = outOfStock
    ? { bg: '#fef2f2', text: '#ef4444', label: 'Out of Stock' }
    : product.stock_quantity <= 5
    ? { bg: '#fff7ed', text: '#f97316', label: `Only ${product.stock_quantity} left!` }
    : { bg: '#f0fdf4', text: '#16a34a', label: 'In Stock' };

  const slideData = [
    ...imgSlides.map((uri, i) => ({ type: 'image' as const, uri, index: i })),
    ...(hasVideo ? [{ type: 'video' as const, uri: product.video_url!, index: imgSlides.length }] : []),
  ];

  const renderSlide = ({ item }: { item: typeof slideData[0] }) => {
    if (item.type === 'video') {
      return (
        <View style={[styles.slide, { width }]}>
          {Platform.OS === 'web' ? (
            // @ts-ignore
            <video
              src={item.uri}
              controls
              autoPlay
              style={{ width: '100%', height: '100%', backgroundColor: '#000', display: 'block' }}
            />
          ) : (
            <Video
              source={{ uri: item.uri }}
              style={styles.videoPlayer}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={activeIndex === imgSlides.length}
            />
          )}
        </View>
      );
    }
    return (
      <TouchableOpacity
        style={[styles.slide, { width }]}
        activeOpacity={0.95}
        onPress={() => setFullscreenImg(item.uri)}
      >
        <Image
          source={{ uri: item.uri || PLACEHOLDER }}
          style={styles.mainImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: tc.card }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* ── Swipeable Image / Video Gallery ── */}
        <View style={[styles.galleryContainer, { width }]}>
          <FlatList
            ref={flatRef}
            data={slideData}
            renderItem={renderSlide}
            keyExtractor={item => String(item.index)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveIndex(idx);
            }}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          />

          {/* Back button */}
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(31,41,55,0.9)' : 'rgba(255,255,255,0.9)' }]}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/shop')}
            activeOpacity={0.8}
          >
            <Text style={[{ fontSize: 18, fontWeight: '700' }, { color: tc.text }]}>←</Text>
          </TouchableOpacity>

          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{friday ? '🌟 FRIDAY' : `-${product.discount_percent}%`}</Text>
            </View>
          )}

          {/* Dot indicators */}
          {totalSlides > 1 && (
            <View style={styles.dotsRow}>
              {slideData.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.5)' },
                    i === activeIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── Thumbnail strip ── */}
        {totalSlides > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.thumbStrip, { backgroundColor: tc.card }]}
            contentContainerStyle={styles.thumbContent}
          >
            {imgSlides.map((img, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setActiveIndex(i);
                  flatRef.current?.scrollToIndex({ index: i, animated: true });
                }}
                style={[styles.thumb, { borderColor: activeIndex === i ? COLORS.primary : 'transparent' }]}
                activeOpacity={0.8}
              >
                <Image source={{ uri: img }} style={styles.thumbImg} />
              </TouchableOpacity>
            ))}
            {hasVideo && (
              <TouchableOpacity
                style={[
                  styles.thumb,
                  styles.videoThumb,
                  { borderColor: activeIndex === imgSlides.length ? COLORS.primary : 'transparent' },
                ]}
                onPress={() => {
                  const idx = imgSlides.length;
                  setActiveIndex(idx);
                  flatRef.current?.scrollToIndex({ index: idx, animated: true });
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.videoThumbIcon}>▶</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {/* ── Info ── */}
        <View style={styles.infoSection}>
          {friday && (
            <View style={styles.fridayBanner}>
              <Text style={{ color: '#a16207', fontSize: 13, fontWeight: '700' }}>🌟 Friday Sale Active!</Text>
            </View>
          )}

          <Text style={[styles.category, { color: tc.textSec }]}>{product.category}</Text>
          <Text style={[styles.productName, { color: tc.text }]}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>Rs. {price}</Text>
            {hasDiscount && (
              <>
                <Text style={styles.originalPrice}>Rs. {product.retail_price}</Text>
                <View style={styles.discountPill}>
                  <Text style={styles.discountPillText}>{product.discount_percent}% OFF</Text>
                </View>
              </>
            )}
          </View>

          <View style={[styles.stockBadge, { backgroundColor: stockStatus.bg }]}>
            <View style={[styles.stockDot, { backgroundColor: stockStatus.text }]} />
            <Text style={[styles.stockText, { color: stockStatus.text }]}>{stockStatus.label}</Text>
          </View>

          {!!product.description && (
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.descTitle, { color: tc.text }]}>Description</Text>
              <Text style={[styles.desc, { color: tc.textSec }]}>{product.description}</Text>
            </View>
          )}

          {!outOfStock && (
            <View style={styles.qtyRow}>
              <Text style={[styles.qtyLabel, { color: tc.textSec }]}>Quantity</Text>
              <View style={styles.qtyControls}>
                <TouchableOpacity
                  style={[styles.qtyBtn, { backgroundColor: isDark ? COLORS.gray800 : COLORS.gray100 }]}
                  onPress={() => setQty(q => Math.max(1, q - 1))}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.qtyBtnText, { color: tc.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.qtyValue, { color: tc.text }]}>{qty}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, { backgroundColor: isDark ? COLORS.gray800 : COLORS.gray100 }]}
                  onPress={() => setQty(q => Math.min(product.stock_quantity, q + 1))}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.qtyBtnText, { color: tc.text }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!!cartItem && (
            <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '600', marginTop: 4 }}>
              ✓ {cartItem.quantity} already in cart
            </Text>
          )}
        </View>
      </ScrollView>

      {/* ── Bottom action bar ── */}
      <View style={[styles.bottomBar, { backgroundColor: tc.card, borderTopColor: tc.border }]}>
        <TouchableOpacity
          style={[styles.viewCartBtn, { borderColor: COLORS.primary }]}
          onPress={() => router.push('/cart')}
          activeOpacity={0.85}
        >
          <Text style={styles.viewCartText}>
            View Cart {items.length > 0 && `(${items.reduce((s, i) => s + i.quantity, 0)})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.addCartBtn,
            outOfStock && { backgroundColor: isDark ? COLORS.gray700 : COLORS.gray200 },
            added && { backgroundColor: COLORS.green500 },
          ]}
          onPress={handleAdd}
          disabled={outOfStock}
          activeOpacity={0.85}
        >
          <Text style={[styles.addCartText, outOfStock && { color: COLORS.gray400 }]}>
            {outOfStock ? 'Out of Stock' : added ? '✓ Added!' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Fullscreen image modal ── */}
      <Modal visible={!!fullscreenImg} transparent animationType="fade" onRequestClose={() => setFullscreenImg(null)}>
        <View style={styles.fsOverlay}>
          <TouchableOpacity style={styles.fsClose} onPress={() => setFullscreenImg(null)} activeOpacity={0.8}>
            <Text style={styles.fsCloseText}>✕</Text>
          </TouchableOpacity>
          {fullscreenImg && (
            <Image
              source={{ uri: fullscreenImg }}
              style={styles.fsImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, fontWeight: '700' },

  // Gallery
  galleryContainer: { position: 'relative', aspectRatio: 1, backgroundColor: '#000' },
  slide: { aspectRatio: 1, backgroundColor: '#000' },
  mainImage: { width: '100%', height: '100%' },
  videoPlayer: { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute',
    top: STATUS_TOP + 8,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  discountBadge: {
    position: 'absolute',
    top: STATUS_TOP + 8,
    right: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 10,
  },
  discountText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  dotsRow: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 18 },

  // Thumbnail strip
  thumbStrip: {},
  thumbContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  thumb: { width: 56, height: 56, borderRadius: 12, overflow: 'hidden', borderWidth: 2 },
  thumbImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  videoThumb: { backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center' },
  videoThumbIcon: { color: '#fff', fontSize: 20 },

  // Info
  infoSection: { paddingHorizontal: 20, paddingTop: 16, gap: 8 },
  fridayBanner: { backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fde68a', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  category: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 },
  productName: { fontSize: 20, fontWeight: '800', lineHeight: 27 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  price: { color: COLORS.primary, fontWeight: '900', fontSize: 28 },
  originalPrice: { color: COLORS.gray400, fontSize: 15, textDecorationLine: 'line-through' },
  discountPill: { backgroundColor: 'rgba(231,84,128,0.1)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  discountPillText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  stockBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  stockDot: { width: 6, height: 6, borderRadius: 3 },
  stockText: { fontSize: 12, fontWeight: '700' },
  descTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  desc: { fontSize: 13, lineHeight: 20 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
  qtyLabel: { fontSize: 14, fontWeight: '600' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  qtyBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 20, fontWeight: '700', lineHeight: 24 },
  qtyValue: { fontSize: 18, fontWeight: '800', minWidth: 30, textAlign: 'center' },

  // Bottom bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, borderTopWidth: 1 },
  viewCartBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, borderWidth: 2, alignItems: 'center' },
  viewCartText: { color: COLORS.primary, fontWeight: '800', fontSize: 14 },
  addCartBtn: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 16, alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  addCartText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  // Fullscreen modal
  fsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center' },
  fsClose: { position: 'absolute', top: STATUS_TOP + 12, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  fsCloseText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  fsImage: { width: SCREEN_W, height: SCREEN_W * 1.2 },
});
