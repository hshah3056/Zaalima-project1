import React from 'react';
import { ShieldCheck, Truck, Lock, CreditCard, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#2b2b2b] text-gray-300 mt-12 text-xs border-t-4 border-[#e40046]">

      {/* Policy Trust Strip */}
      <div className="bg-[#1f1f1f] py-6 px-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <Lock className="w-6 h-6 text-[#e40046] mb-2" />
            <h4 className="font-bold text-white text-xs uppercase">100% Secure Payments</h4>
            <p className="text-[11px] text-gray-400 mt-1">Moving 256-Bit SSL Encryption</p>
          </div>

          <div className="flex flex-col items-center">
            <ShieldCheck className="w-6 h-6 text-[#e40046] mb-2" />
            <h4 className="font-bold text-white text-xs uppercase">TrustPay Guarantee</h4>
            <p className="text-[11px] text-gray-400 mt-1">100% Payment Protection</p>
          </div>

          <div className="flex flex-col items-center">
            <Truck className="w-6 h-6 text-[#e40046] mb-2" />
            <h4 className="font-bold text-white text-xs uppercase">Express Delivery</h4>
            <p className="text-[11px] text-gray-400 mt-1">Insured Doorstep Shipping</p>
          </div>

          <div className="flex flex-col items-center">
            <CreditCard className="w-6 h-6 text-[#e40046] mb-2" />
            <h4 className="font-bold text-white text-xs uppercase">Multiple Payment Options</h4>
            <p className="text-[11px] text-gray-400 mt-1">UPI, Cards, NetBanking, COD</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-10 px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-sm uppercase mb-3">E-Portal Mydeal</h3>
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            India’s premier online e-commerce shopping platform for top electronics, fashion, and home essentials.
          </p>
          <div className="text-[11px] text-yellow-400 font-semibold">
            ● 100% Genuine Verified Stores
          </div>
        </div>

        <div>
          <h3 className="text-white font-bold text-sm uppercase mb-3">Policy Info</h3>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#terms" className="hover:text-white transition-colors">Terms of Sale</a></li>
            <li><a href="#returns" className="hover:text-white transition-colors">Return Policy</a></li>
            <li><a href="#abuse" className="hover:text-white transition-colors">Report Abuse</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold text-sm uppercase mb-3">Mydeal Business</h3>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#sell" className="hover:text-white transition-colors">Sell on Mydeal</a></li>
            <li><a href="#media" className="hover:text-white transition-colors">Media Enquiries</a></li>
            <li><a href="#tenants" className="hover:text-white transition-colors">Multi-Tenant Onboarding</a></li>
            <li><a href="#api" className="hover:text-white transition-colors">Developer REST APIs</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold text-sm uppercase mb-3">Help Center</h3>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#faq" className="hover:text-white transition-colors">FAQ & Support</a></li>
            <li><a href="#contact" className="hover:text-white transition-colors">Customer Care 24x7</a></li>
            <li><a href="#shipping" className="hover:text-white transition-colors">Shipping Information</a></li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-black py-4 px-4 text-center text-gray-500 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Copyright © 2026 Zaalima Mydeal E-Commerce Platform. All Rights Reserved.</span>
          <span className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> React & MongoDB
          </span>
        </div>
      </div>

    </footer>
  );
}
