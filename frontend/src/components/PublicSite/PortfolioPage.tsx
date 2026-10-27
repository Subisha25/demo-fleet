import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "./PublicLayout";

import v1 from "../../assets/vehicles/img1.png";
import v2 from "../../assets/vehicles/img2.png";
import v3 from "../../assets/vehicles/img3.png";
import v4 from "../../assets/vehicles/img4.png";
import v5 from "../../assets/vehicles/img5.png";
import v6 from "../../assets/vehicles/img6.png";

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("ALL");

  const fleet = [
    {
      id: "v1",
      category: "SEDAN",
      name: "Toyota Etios / Dzire",
      type: "Executive Compact Sedan",
      passengers: 4,
      luggage: "2 Large Bags",
      image: v1,
      tag: "High Mileage",
      rate: "Standard Tariff",
      features: ["Air Conditioning", "Dual Airbags", "Commercial Yellow Board", "Clean Interiors"],
    },
    {
      id: "v2",
      category: "SEDAN",
      name: "Honda City / Ciaz",
      type: "Premium Business Sedan",
      passengers: 4,
      luggage: "3 Large Bags",
      image: v2,
      tag: "Executive Standard",
      rate: "Corporate Tariff",
      features: ["Premium Leatherette", "Smooth Suspension", "USB Charging", "Chauffeur Uniform"],
    },
    {
      id: "v3",
      category: "SUV",
      name: "Toyota Innova Crysta",
      type: "Luxury Multi-Utility Vehicle",
      passengers: 7,
      luggage: "4 Large Bags",
      image: v3,
      tag: "Flagship Choice",
      rate: "VIP Tariff",
      features: ["Captain Seats", "Rear AC Vents", "Long Distance King", "High Safety Rating"],
    },
    {
      id: "v4",
      category: "HATCHBACK",
      name: "Maruti WagonR / Swift",
      type: "Urban Spot Dispatch",
      passengers: 4,
      luggage: "1 Medium Bag",
      image: v4,
      tag: "City Quick Duty",
      rate: "Spot Tariff",
      features: ["Rapid City Transit", "Air Conditioned", "Affordable Rates", "Compact Parking"],
    },
    {
      id: "v5",
      category: "SUV",
      name: "Mahindra XUV 700 / Scorpio",
      type: "Rugged Executive SUV",
      passengers: 6,
      luggage: "3 Bags",
      image: v5,
      tag: "Outstation Special",
      rate: "Outstation Tariff",
      features: ["High Ground Clearance", "Panoramic Comfort", "All-Weather Transit", "GPS Tracking"],
    },
    {
      id: "v6",
      category: "VAN",
      name: "Force Tempo Traveller",
      type: "Employee Group Transit Shuttle",
      passengers: 14,
      luggage: "10 Bags",
      image: v6,
      tag: "Staff Transport",
      rate: "Group Route Tariff",
      features: ["Pushback Reclining Seats", "Dedicated AC Ducting", "Wide Windows", "PA Audio System"],
    },
  ];

  const filteredFleet = filter === "ALL" ? fleet : fleet.filter((item) => item.category === filter);

  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#FAF8F5] to-[#F5EFEB] py-16 md:py-24 border-b border-[#E0DAD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C04E24]">
            Fleet Portfolio
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#1C1A18] tracking-tight">
            Commercial Fleet Portfolio & Specifications
          </h1>
          <p className="text-lg text-[#5A554E] max-w-3xl mx-auto leading-relaxed">
            Every vehicle in the FleetFlow mobility network undergoes mandatory periodic fitness audits,
            carries active comprehensive commercial insurance, and operates with verified chauffeurs.
          </p>

          {/* Category Filter Pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
            {["ALL", "SEDAN", "SUV", "HATCHBACK", "VAN"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === cat
                    ? "bg-[#C04E24] text-white shadow-sm"
                    : "bg-white text-[#5A554E] border border-[#E0DAD1] hover:border-[#1C1A18]/40"
                }`}
              >
                {cat === "ALL" ? "All Categories" : cat + "s"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Grid */}
      <section className="py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFleet.map((veh) => (
              <div
                key={veh.id}
                className="bg-white rounded-3xl overflow-hidden border border-[#E0DAD1] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative p-8 flex items-center justify-center bg-[#F7F2EC] h-56">
                    <img
                      src={veh.image}
                      alt={veh.name}
                      className="max-h-40 max-w-full object-contain filter drop-shadow-md transform hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#1C1A18] text-white">
                      {veh.tag}
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C04E24]">
                        {veh.type}
                      </span>
                      <h3 className="text-xl font-bold text-[#1C1A18] mt-0.5">{veh.name}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#5A554E] py-2 border-y border-[#E0DAD1]/60">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[#C04E24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{veh.passengers} Passengers</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[#C04E24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>{veh.luggage}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#7A7570]">Vehicle Specs</div>
                      <div className="flex flex-wrap gap-1.5">
                        {veh.features.map((f, i) => (
                          <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E0DAD1] text-[#2B2927]">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => navigate("/register-fleet")}
                    className="w-full py-2.5 text-xs font-bold text-white bg-[#C04E24] hover:bg-[#A83F1A] rounded-xl transition-all"
                  >
                    Deploy into Your Fleet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
