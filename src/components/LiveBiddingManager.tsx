"use client";

import React, { useState } from "react";
import { useBiddingItems } from "@/hooks/useBidding";

export default function LiveBiddingManager() {
  const { items, addItem, deleteItem, resetBid, startItem } = useBiddingItems();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [basePrice, setBasePrice] = useState<string>("");
  const [duration, setDuration] = useState<string>("15");

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) setImage(result);
    };
    reader.readAsDataURL(file);
  };

  const onAdd = () => {
    const bp = Number(basePrice);
    const dur = Number(duration);
    if (!name || !image || Number.isNaN(bp) || bp <= 0) return;
    addItem({ name, image, basePrice: bp, durationMinutes: Number.isNaN(dur) ? 15 : dur });
    setName("");
    setImage("");
    setBasePrice("");
    setDuration("15");
  };

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-2xl font-black text-gray-900">Live Bidding Management</h2>
      <p className="text-sm text-gray-600">Tambah item bidding berasingan dari Shop All.</p>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm"
        />
        <div
          className="rounded-xl border-2 border-dashed border-gray-200 px-4 py-3 text-sm bg-gray-50 flex flex-col gap-2 justify-center items-center text-center cursor-pointer hover:border-gray-300"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          onClick={() => document.getElementById("biddingImageInput")?.click()}
        >
          <p className="font-semibold text-gray-700">Drop / click to upload image</p>
          <p className="text-xs text-gray-500">Supports JPG/PNG</p>
          {image && (
            <img src={image} alt="Preview" className="h-20 w-20 rounded-lg object-cover border" />
          )}
          <input
            id="biddingImageInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
        <input
          type="number"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          placeholder="Base price"
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm"
        />
        <div className="flex gap-2">
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration (min)"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          />
          <button onClick={onAdd} className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white">
            Add Item
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((i) => (
          <div key={i.id} className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <img src={i.image} alt={i.name} className="h-16 w-16 rounded-lg object-cover border" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{i.name}</p>
                <p className="text-sm text-gray-600">Base RM{i.basePrice.toLocaleString()} • Current RM{(i.currentBid ?? i.basePrice).toLocaleString()}</p>
                <p className="text-xs text-gray-500">{i.endTime ? "Ends: " + new Date(i.endTime).toLocaleString() : "Not started"}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => startItem(i.id)} className="rounded-lg bg-black px-3 py-2 text-xs text-white">Start</button>
                <button onClick={() => resetBid(i.id)} className="rounded-lg bg-gray-200 px-3 py-2 text-xs">Reset Bid</button>
                <button onClick={() => deleteItem(i.id)} className="rounded-lg bg-red-500 px-3 py-2 text-xs text-white">Delete</button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-gray-600">Tiada item bidding. Tambah item di atas.</p>
        )}
      </div>
    </section>
  );
}
