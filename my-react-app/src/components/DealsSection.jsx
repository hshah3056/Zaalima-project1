import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ProductCard from './ProductCard';
import { Clock, Zap } from 'lucide-react';

export default function DealsSection() {
  const { items } = useSelector((state) => state.products);
  const dealProducts = items.filter((p) => p.isDealOfTheDay);

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (dealProducts.length === 0) return null;

  return (
    <section className="bg-white rounded-sm shadow-sm border border-gray-200 p-4 mb-6">
      
      {/* Deals Header with Countdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-gray-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-[#e40046] text-white p-1.5 rounded-sm">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900 uppercase tracking-tight">
              Deals Of The Day
            </h2>
            <p className="text-[11px] text-gray-500">Handpicked top savings for your store</p>
          </div>
        </div>

        {/* Timer Counter */}
        <div className="flex items-center gap-2 bg-red-50 text-[#e40046] px-3 py-1.5 rounded border border-red-100 font-mono text-xs font-bold">
          <Clock className="w-4 h-4" />
          <span>Ends in:</span>
          <span className="bg-[#e40046] text-white px-1.5 py-0.5 rounded text-xs">
            {String(timeLeft.hours).padStart(2, '0')}h
          </span>
          :
          <span className="bg-[#e40046] text-white px-1.5 py-0.5 rounded text-xs">
            {String(timeLeft.minutes).padStart(2, '0')}m
          </span>
          :
          <span className="bg-[#e40046] text-white px-1.5 py-0.5 rounded text-xs">
            {String(timeLeft.seconds).padStart(2, '0')}s
          </span>
        </div>
      </div>

      {/* Deals Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dealProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

    </section>
  );
}
