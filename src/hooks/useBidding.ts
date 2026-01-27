"use client";

import { useEffect, useState } from "react";

export interface BiddingItem {
  id: string;
  name: string;
  image: string;
  basePrice: number;
  currentBid: number;
  highestBidder?: string;
  endTime?: number; // epoch ms
  durationMinutes?: number; // optional default duration
  isSold?: boolean;
  soldAt?: number;
}

const STORAGE_KEY = "biddingItems";

function readStorage(): BiddingItem[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: BiddingItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("biddingUpdated"));
}

export function useBiddingItems() {
  const [items, setItems] = useState<BiddingItem[]>([]);

  const load = () => setItems(readStorage());

  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener("biddingUpdated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("biddingUpdated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const addItem = (input: Omit<BiddingItem, "id" | "currentBid"> & { id?: string }) => {
    const id = input.id ?? crypto.randomUUID();
    const newItem: BiddingItem = {
      id,
      name: input.name,
      image: input.image,
      basePrice: input.basePrice,
      currentBid: input.basePrice,
      highestBidder: "No bids yet",
      durationMinutes: input.durationMinutes ?? 15,
      endTime: input.endTime,
      isSold: false,
      soldAt: undefined,
    };
    const next = [...readStorage(), newItem];
    writeStorage(next);
    load();
  };

  const updateItem = (id: string, patch: Partial<BiddingItem>) => {
    const next = readStorage().map((i) => (i.id === id ? { ...i, ...patch } : i));
    writeStorage(next);
    load();
  };

  const deleteItem = (id: string) => {
    const next = readStorage().filter((i) => i.id !== id);
    writeStorage(next);
    load();
  };

  const resetBid = (id: string) => {
    const items = readStorage();
    const item = items.find((i) => i.id === id);
    if (!item) return;
    item.currentBid = item.basePrice;
    item.highestBidder = "No bids yet";
    item.isSold = false;
    item.soldAt = undefined;
    writeStorage(items);
    load();
  };

  const startItem = (id: string, durationMinutes?: number) => {
    const items = readStorage();
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const dur = durationMinutes ?? item.durationMinutes ?? 15;
    item.endTime = Date.now() + dur * 60 * 1000;
    item.isSold = false;
    item.soldAt = undefined;
    writeStorage(items);
    load();
  };

  const markSold = (id: string) => {
    const items = readStorage();
    const item = items.find((i) => i.id === id);
    if (!item) return;
    item.isSold = true;
    item.soldAt = Date.now();
    writeStorage(items);
    load();
  };

  return { items, addItem, updateItem, deleteItem, resetBid, startItem, markSold };
}
