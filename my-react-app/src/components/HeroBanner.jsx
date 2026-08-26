import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroBanner() {
  const { activeTenantId, tenantsList } = useSelector((state) => state.tenant);
  const { items } = useSelector((state) => state.products);

  const activeTenant = tenantsList.find((t) => t.tenantId === activeTenantId) || tenantsList[0];

  // Helper to build dynamic slides from database products or tenant defaults
  const getDynamicSlides = () => {
    // If products exist in database state for active tenant, map them dynamically to hero slides
    if (items && items.length > 0) {
      const dealItems = items.filter((p) => p.isDealOfTheDay);
      const targetItems = dealItems.length > 0 ? dealItems : items;

      return targetItems.slice(0, 4).map((product, idx) => ({
        id: product._id || idx,
        tagline: `${activeTenant?.name || 'Mydeal Store'} • ${product.brand || 'Featured Brand'}`,
        title: product.name,
        subtitle: `Special Price: ₹${product.price?.toLocaleString('en-IN')} (${product.discount || 'Special Discount'}) — Free Doorstep Shipping Available`,
        badge: product.isDealOfTheDay ? 'DEAL OF THE DAY' : `${product.category?.toUpperCase() || 'FEATURED'}`,
        gradient:
          idx % 3 === 0
            ? 'from-[#2b2b2b] via-[#3a0011] to-[#e40046]'
            : idx % 3 === 1
            ? 'from-[#0f172a] via-[#1e1b4b] to-[#2563eb]'
            : 'from-[#311b92] via-[#4a148c] to-[#e40046]',
        image: product.image,
        buttonText: `Buy Now — ₹${product.price?.toLocaleString('en-IN')}`
      }));
    }

    // Fallback store tenant slides if database products loading
    return [
      {
        id: 'fallback-1',
        tagline: activeTenant?.name || 'Mydeal Store',
        title: activeTenant?.bannerTitle || 'Mega Shopping Festival',
        subtitle: activeTenant?.bannerSubtitle || 'Up to 80% OFF on Top Electronics, Fashion & Home',
        badge: 'MEGA SALE • UP TO 80% OFF',
        gradient: 'from-[#2b2b2b] via-[#3a0011] to-[#e40046]',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
        buttonText: 'Shop Now'
      }
    ];
  };

  const slides = getDynamicSlides();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Reset slide index when active tenant or product catalog changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [activeTenantId, items]);

  // Auto-play slider interval (4 seconds)
  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, slides.length]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      
      {/* Interactive Dynamic Slider Container */}
      <div
        className="relative rounded-sm shadow-sm overflow-hidden flex-1 min-h-[300px] border border-gray-800 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Render Dynamic Database Slides */}
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out bg-gradient-to-r ${slide.gradient} p-6 sm:p-10 flex items-center justify-between ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Left Slide Content */}
              <div className="max-w-xl text-white z-10">
                {/* Badge Tagline */}
                <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-black text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-sm mb-3 shadow">
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>{slide.tagline}</span>
                  <span className="bg-black/10 text-black px-1.5 py-0.2 rounded text-[9px] font-bold">{slide.badge}</span>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 leading-snug line-clamp-2">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-base text-gray-200 mb-6 font-medium line-clamp-2">
                  {slide.subtitle}
                </p>

                {/* CTA Button */}
                <div>
                  <a
                    href="#products"
                    className="inline-flex items-center gap-2 bg-white text-[#e40046] hover:bg-yellow-100 font-extrabold px-7 py-3 rounded-sm text-xs sm:text-sm uppercase tracking-wider shadow-xl transition-all transform hover:-translate-y-0.5"
                  >
                    {slide.buttonText} <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Right Hero Database Product Image */}
              <div className="hidden md:block w-72 h-52 lg:w-96 lg:h-64 shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/20 z-10 transform rotate-1 transition-transform group-hover:rotate-0 duration-300 bg-white/10 p-3">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Decorative Circle */}
              <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            </div>
          );
        })}

        {/* Navigation Arrows (if > 1 slide) */}
        {slides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/80 text-white p-2 rounded-full shadow-md backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/80 text-white p-2 rounded-full shadow-md backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>

            {/* Bottom Dot Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'w-6 bg-yellow-400' : 'w-2 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 3 Trust Badges Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
        <div className="bg-white p-3 rounded-sm shadow-xs border border-gray-200 flex items-center gap-3">
          <Truck className="w-5 h-5 text-[#e40046] shrink-0" />
          <div>
            <div className="text-xs font-bold text-gray-800">Fast & Free Shipping</div>
            <div className="text-[10px] text-gray-500">On all eligible store orders</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-sm shadow-xs border border-gray-200 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="text-xs font-bold text-gray-800">Mydeal Safe Pay</div>
            <div className="text-[10px] text-gray-500">100% Secure Encrypted Checkout</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-sm shadow-xs border border-gray-200 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <div className="text-xs font-bold text-gray-800">7 Days Easy Return</div>
            <div className="text-[10px] text-gray-500">No questions asked policy</div>
          </div>
        </div>
      </div>

    </div>
  );
}
