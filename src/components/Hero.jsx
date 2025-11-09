import React from "react";
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section
      className="relative h-screen bg-cover bg-center flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ 
        backgroundImage: "url('/hero-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay gradient: top transparent → bottom #0C0C0C (35% opacity) */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(12, 12, 12, 0.35) 100%)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4">
        <h1 
          className="text-[48px] md:text-[56px] font-bold text-white leading-tight max-w-[680px] mx-auto"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Building Tools for Smarter, Greener Fields.
        </h1>
        
        <p 
          className="text-[18px] font-medium text-[#F5F5F3] mt-6 leading-relaxed max-w-[560px] mx-auto"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          SATOR is a soil-monitoring rover platform designed to help farmers make
          data-driven environmental decisions.
        </p>
        
        <Link 
          to="/dashboard"
          className="mt-10 bg-[#E0A622] text-[#204D36] text-[15px] font-semibold py-4 px-10 rounded-full hover:bg-[#E3B341] transition-all duration-200"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Live Rover View →
        </Link>
      </div>
    </section>
  );
}
