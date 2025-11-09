import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardPreview() {
  return (
    <section
      id="dashboard-preview"
      className="relative isolate bg-[#E8E1C4]"
    >
      {/* topo overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/topo-pattern.png')] bg-cover bg-center opacity-100" />
      </div>

      <div className="mx-auto max-w-[1200px] px-6 lg:px-8 pt-[72px] pb-[120px]">
        {/* Title + underline - flush left aligned */}
        <h2 className="relative inline-block font-[Inter] font-extrabold text-[36px] md:text-[50px] leading-none tracking-two uppercase text-[#204D36] mb-20">
          DASHBOARD PREVIEW
          <span
            aria-hidden
            className="absolute left-0 block h-[10px] w-full rounded-full bg-[#E0A622]"
            style={{ top: 'calc(100% + 16px)' }}
          />
        </h2>

        {/* Grid - with extra spacing around cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,754px)_minmax(0,465px)] lg:gap-6">
          {/* Left stack */}
          <div className="flex flex-col gap-6">
            <div className="bg-white shadow-sm h-[389px] w-full">
              <div className="p-6">
                <h3 className="font-[Inconsolata] font-extrabold text-[22px] md:text-[30px] tracking-two uppercase text-[#204D36]">
                  LIVE SENSOR FEED
                </h3>
              </div>
            </div>
            <div className="bg-white shadow-sm h-[389px] w-full">
              <div className="p-6">
                <h3 className="font-[Inconsolata] font-extrabold text-[22px] md:text-[30px] tracking-two uppercase text-[#204D36]">
                  SOIL HEALTH SNAPSHOT
                </h3>
              </div>
            </div>
          </div>

          {/* Right tall card - height matches left stack (389px + 24px gap + 389px = 802px) */}
          <div className="relative bg-white shadow-sm h-[802px] w-full">
            <div className="p-6">
              <h3 className="font-[Inconsolata] font-extrabold text-[22px] md:text-[30px] tracking-two uppercase text-[#204D36]">
                AI INSIGHTS CONSOLE
              </h3>
            </div>

            <Link
              to="/dashboard"
              className="absolute bottom-6 right-6 inline-flex h-[42px] w-[180px] items-center justify-center rounded-full bg-[#E0A622] font-[Inter] font-medium text-white text-[18px] hover:bg-[#E3B341] transition-colors"
              aria-label="Open Dashboard"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

