/* eslint-disable react/no-unescaped-entities */
"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import {
  fetchOffersBanner,
  selectOffersBanner,
  selectOffersBannerLoading,
} from "@/lib/redux/slice/offerBannerSlice";

const OfferBanner = () => {
  const dispatch = useDispatch<AppDispatch>();
  const offers = useSelector(selectOffersBanner);
  const loading = useSelector(selectOffersBannerLoading);

  useEffect(() => {
    dispatch(fetchOffersBanner());
  }, [dispatch]);

  if (loading) {
    return (
      <p className="text-center py-16 text-xl text-gray-500">
        Loading offers...
      </p>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <p className="text-center py-16 text-xl text-gray-400">
        No offers available.
      </p>
    );
  }

  // Only show the first three offers
  const topThreeOffers = offers.slice(0, 3);

  return (
    <section className="w-full py-16 px-6 bg-gradient-to-r from-[#e63d3d] to-[#f07c54] text-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 text-white">
            🔥 Special Offers 🔥
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Don't miss out on these incredible deals! Limited time offers available now.
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 md:-ml-8">
          {topThreeOffers.map((offer) => (
            <Card
              key={offer.id}
              className="group overflow-hidden p-4 m-2 transition-all duration-300 hover:scale-100 hover:shadow-sm border-2 border-[#e63d3d]/20 h-[28rem] md:h-[28rem] w-full md:w-[28rem]"
            >
              <div className="relative w-full h-full rounded-lg">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg"
                />

                <div className="absolute inset-0  rounded-lg" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold">{offer.title}</h3>
                  <p className="text-sm opacity-90">{offer.subtitle}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function OffersPage() {
  return <OfferBanner />;
}
