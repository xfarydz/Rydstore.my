"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";
import Footer from "@/components/Footer";
import MaintenancePage from "@/components/MaintenancePage";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAllProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { Product } from "@/data/products";

const MIN_INCREMENT = 5;

function LiveBiddingContent() {
  const { settings } = useSiteSettings();
  const products = useAllProducts();
  const { user, isAuthenticated, setShowAuthModal } = useAuth();
  const [now, setNow] = useState(() => Date.now());
  const [bidInputs, setBidInputs] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});

  // Helper function to update product
  const updateProduct = (productId: string, updates: Partial<Product>) => {
    const allProducts = localStorage.getItem('adminProducts');
    if (allProducts) {
      const parsedProducts = JSON.parse(allProducts);
      const updatedProducts = parsedProducts.map((p: Product) => 
        p.id === productId ? { ...p, ...updates } : p
      );
      localStorage.setItem('adminProducts', JSON.stringify(updatedProducts));
      window.dispatchEvent(new Event('productUpdated'));
    }
  };

  // Filter bidding items: show active ones, not started (no schedule), and scheduled ones that haven't passed start time yet
  const biddingProducts = useMemo(() => 
    products.filter(p => {
      if (!p.isBiddingItem || p.isSoldOut) return false;
      // Include items that are active, not yet started, or scheduled for future
      const isScheduledFuture = p.biddingStartTime && p.biddingStartTime > now;
      const isActive = p.biddingEndTime && p.biddingEndTime > now;
      const notStartedNoSchedule = !p.biddingEndTime && !p.biddingStartTime;
      return isScheduledFuture || isActive || notStartedNoSchedule;
    }).sort((a, b) => (a.biddingEndTime ?? 0) - (b.biddingEndTime ?? 0)),
    [products, now]
  );

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-mark sold when timer ends
  useEffect(() => {
    biddingProducts.forEach((product) => {
      if (product.biddingEndTime && product.biddingEndTime <= Date.now()) {
        updateProduct(product.id, { isSoldOut: true });
      }
    });
  }, [biddingProducts]);

  const handleBid = (productId: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const product = biddingProducts.find((p) => p.id === productId);
    if (!product) return;

    const raw = bidInputs[productId];
    const value = Number(raw);
    if (!raw || Number.isNaN(value)) {
      setMessages((prev) => ({ ...prev, [productId]: "Masukkan nilai bid yang sah" }));
      return;
    }

    const minBid = (product.currentBid ?? product.biddingStartPrice ?? product.price) + MIN_INCREMENT;
    if (value < minBid) {
      setMessages((prev) => ({
        ...prev,
        [productId]: `Min bid ${settings.currency}${minBid.toLocaleString()}`,
      }));
      return;
    }

    updateProduct(productId, { 
      currentBid: value, 
      highestBidder: user?.name || "User",
      highestBidderEmail: user?.email
    });
    setMessages((prev) => ({ ...prev, [productId]: "You are the highest bidder" }));
  };

  const formatRemaining = (endTime?: number) => {
    if (!endTime) return "Not started";
    const diff = endTime - now;
    if (diff <= 0) return "Ended";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  if (settings.maintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AuthModal />

      <section 
        className={`relative overflow-hidden text-white ${!settings.heroBackgroundImage ? 'bg-black' : ''}`}
        style={settings.heroBackgroundImage ? {
          backgroundImage: `url("${settings.heroBackgroundImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll'
        } : {}}
      >
        {/* Decorative blobs when no image is set */}
        {!settings.heroBackgroundImage && (
          <div className="absolute inset-0 opacity-60" aria-hidden>
            <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-amber-500 blur-3xl" />
            <div className="absolute -right-10  bottom-0 h-64 w-64 rounded-full bg-fuchsia-500 blur-3xl" />
          </div>
        )}
        {/* Dark overlay for readability when image exists */}
        {settings.heroBackgroundImage && (
          <div className="absolute inset-0 bg-black/50" aria-hidden />
        )}
        <div className="relative max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Live Bidding
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-black tracking-tight">
            Bid in Real Time, Score Exclusive Drops
          </h1>
          <p className="mt-4 text-lg text-gray-200 max-w-3xl mx-auto">
            Participate in live auctions for selected items. Each bid requires a minimum increment of {settings.currency}
            {MIN_INCREMENT}. Don't wait until time runs out.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {biddingProducts.length === 0 && (
            <div className="col-span-full text-center text-gray-600">
              No products available for bidding right now.
            </div>
          )}

          {biddingProducts.map((product) => {
            const isScheduledFuture = product.biddingStartTime && product.biddingStartTime > now;
            const isEnded = (product.biddingEndTime ?? 0) - now <= 0 && !!product.biddingEndTime;
            const remaining = formatRemaining(product.biddingEndTime);
            const isSold = product.isSoldOut || isEnded;
            const isActive = product.biddingEndTime && product.biddingEndTime > now;
            const currentBid = product.currentBid ?? product.biddingStartPrice ?? product.price;
            
            const getScheduleCountdown = () => {
              if (!product.biddingStartTime) return '';
              const diff = product.biddingStartTime - now;
              if (diff <= 0) return '';
              const days = Math.floor(diff / (24 * 60 * 60 * 1000));
              const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
              const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
              if (days > 0) return `In ${days}d ${hours}h`;
              if (hours > 0) return `In ${hours}h ${minutes}m`;
              return `In ${minutes}m`;
            };
            
            return (
              <div
                key={product.id}
                className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black text-white px-3 py-1 text-xs font-semibold uppercase">
                  <span className={`h-2 w-2 rounded-full ${isSold ? "bg-red-400" : isScheduledFuture ? "bg-blue-400" : "bg-green-400 animate-pulse"}`} />
                  {isSold ? "Sold" : isScheduledFuture ? "Coming Soon" : "Live"}
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-gray-800">
                  {isSold ? "Ended" : isScheduledFuture ? getScheduleCountdown() : `Ends in ${remaining}`}
                </div>

                <div className="relative aspect-[4/3] bg-gray-100 cursor-pointer" onClick={() => window.location.href = `/product/${product.id}`}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight cursor-pointer hover:underline" onClick={() => window.location.href = `/product/${product.id}`}>
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500">Starting bid {settings.currency}{(product.biddingStartPrice ?? product.price).toLocaleString()}</p>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Current Bid</p>
                      <p className="text-2xl font-black text-gray-900">
                        {settings.currency}{currentBid.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Highest Bidder</p>
                      <p className="text-sm font-semibold text-gray-800">{product.highestBidder ?? "No bids yet"}</p>
                    </div>
                  </div>

                  {isScheduledFuture && (
                    <div className="rounded-lg bg-blue-50 p-3 text-center">
                      <p className="text-sm font-semibold text-blue-800">
                        Bidding starts at {new Date(product.biddingStartTime!).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}

                  {isActive && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-600">
                        Place your bid (min +{settings.currency}{MIN_INCREMENT})
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={currentBid + MIN_INCREMENT}
                          value={bidInputs[product.id] || ""}
                          onChange={(e) =>
                            setBidInputs((prev) => ({ ...prev, [product.id]: e.target.value }))
                          }
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-black focus:ring-2 focus:ring-black/10"
                          placeholder={`${settings.currency}${(currentBid + MIN_INCREMENT).toLocaleString()}`}
                          disabled={isSold || !isAuthenticated}
                        />
                        <button
                          onClick={() => handleBid(product.id)}
                          disabled={isSold || !isAuthenticated}
                          className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSold ? "Ended" : !isAuthenticated ? "Login to Bid" : "Place Bid"}
                        </button>
                      </div>
                      {messages[product.id] && (
                        <p className="text-xs font-semibold text-gray-700">{messages[product.id]}</p>
                      )}
                      {!isAuthenticated && (
                        <p className="text-xs font-semibold text-blue-700">
                          You must <button onClick={() => setShowAuthModal(true)} className="underline hover:no-underline">login or register</button> to place bids.
                        </p>
                      )}
                      {isSold && product.highestBidder && product.highestBidder !== "No bids yet" && (
                        <p className="text-xs font-semibold text-green-700">Sold to {product.highestBidder} at {settings.currency}{currentBid.toLocaleString()}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-2xl font-black text-gray-900">How live bidding works</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-700">01 — Choose item</p>
              <p className="text-sm text-gray-600 mt-1">Select an item that is currently live. Each item has an end time.</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-700">02 — Place bid</p>
              <p className="text-sm text-gray-600 mt-1">Enter an amount higher than the current bid with minimum increment.</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-700">03 — Win when timer ends</p>
              <p className="text-sm text-gray-600 mt-1">Highest bid when the timer ends wins.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function LiveBiddingPage() {
  return <LiveBiddingContent />;
}
