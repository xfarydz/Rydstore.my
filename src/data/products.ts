export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  images?: string[] // Additional images for product gallery
  brand: string
  category: string
  size: string[]
  color: string
  inStock: boolean
  isNew?: boolean
  isSoldOut?: boolean
  isFeatured?: boolean // Featured product flag
  description?: string
  soldQuantity?: number
  totalStock?: number
  createdAt?: string
  offers?: Offer[]
  // Bidding properties
  isBiddingItem?: boolean
  biddingStartTime?: number // scheduled start time
  biddingEndTime?: number
  currentBid?: number
  highestBidder?: string
  highestBidderEmail?: string
  biddingStartPrice?: number
  biddingDuration?: number // in minutes
}

export interface Offer {
  id: string
  userId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  offeredPrice: number
  message?: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  createdAt: string
  paidAt?: string
}

export const products: Product[] = [
  {
    id: "1",
    name: "Nike ACG Technical Jacket",
    price: 1269,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400",
    brand: "Nike",
    category: "Jackets",
    size: ["S", "M", "L", "XL"],
    color: "Black",
    inStock: true,
    isNew: true,
    totalStock: 1,
    soldQuantity: 0,
    createdAt: "2025-10-14T10:00:00Z", // 1 day ago (Oct 14, 2025)
    offers: [
      {
        id: "offer-1",
        userId: "user-sample-1",
        customerName: "Ahmad Rahman",
        customerEmail: "ahmad@email.com",
        customerPhone: "012-345-6789",
        offeredPrice: 1000,
        message: "Hi, can you consider RM1000 for this jacket? I really like it but my budget is tight.",
        status: "pending",
        createdAt: "2025-10-14T08:30:00Z"
      }
    ]
  },
  {
    id: "2", 
    name: "Stone Island Padded Jacket",
    price: 4199,
    image: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400",
    brand: "Stone Island",
    category: "Jackets", 
    size: ["M", "L"],
    color: "Yellow",
    inStock: true,
    isNew: true,
    totalStock: 1,
    soldQuantity: 0,
    createdAt: "2025-10-13T15:30:00Z", // 2 days ago (Oct 13, 2025)
    offers: [
      {
        id: "offer-2",
        userId: "user-sample-2",
        customerName: "Siti Aisyah",
        customerEmail: "siti@email.com", 
        customerPhone: "013-456-7890",
        offeredPrice: 3500,
        message: "Would you accept RM3500? I can pay immediately.",
        status: "pending",
        createdAt: "2025-10-13T10:15:00Z"
      }
    ]
  },
  {
    id: "3",
    name: "Comme Des Garcons Patchwork Tee",
    price: 739,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    brand: "Comme Des Garcons",
    category: "T-Shirts",
    size: ["S", "M"],
    color: "Multi",
    inStock: true,
    totalStock: 1,
    soldQuantity: 0,
    createdAt: "2025-10-15T09:00:00Z" // Today - very new! (Oct 15, 2025)
  },
  {
    id: "4",
    name: "Arc'teryx Beta Shell Jacket",
    price: 5583,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400",
    brand: "Arc'teryx",
    category: "Jackets",
    size: ["M", "L"],
    color: "Blue",
    inStock: true,
    totalStock: 1,
    soldQuantity: 0,
    createdAt: "2025-10-08T10:00:00Z" // 7 days ago - should NOT show JUST ARRIVED
  },
  {
    id: "5",
    name: "Prada Sport Nylon Jacket",
    price: 2469,
    image: "https://images.unsplash.com/photo-1525845859779-54d477ff291f?w=400",
    brand: "Prada",
    category: "Jackets",
    size: ["S", "M"],
    color: "Blue",
    inStock: true,
    totalStock: 1,
    soldQuantity: 0,
    createdAt: "2025-10-12T16:00:00Z", // 3 days ago (Oct 12, 2025)
    offers: [
      {
        id: "offer-3",
        userId: "user-sample-3",
        customerName: "Kevin Lim",
        customerEmail: "kevin@email.com",
        customerPhone: "014-567-8901",
        offeredPrice: 2200,
        status: "accepted",
        createdAt: "2025-10-12T14:20:00Z"
      }
    ]
  },
  {
    id: "6",
    name: "Oakley Technical Sunglasses",
    price: 1027,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
    brand: "Oakley",
    category: "Accessories",
    size: ["O/S"],
    color: "Black",
    inStock: true,
    isSoldOut: false,
    totalStock: 1,
    soldQuantity: 0
  },
  {
    id: "7",
    name: "Supreme x Stone Island Jacket",
    price: 4776,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
    brand: "Supreme",
    category: "Jackets",
    size: ["S", "M"],
    color: "Denim",
    inStock: true,
    totalStock: 1,
    soldQuantity: 0
  },
  {
    id: "8",
    name: "Nike Gyakusou Track Jacket",
    price: 739,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
    brand: "Nike",
    category: "Jackets",
    size: ["S", "M", "L"],
    color: "Black",
    inStock: true,
    totalStock: 1,
    soldQuantity: 0,
    createdAt: "2024-10-11T14:00:00Z" // 3 days ago
  },
  {
    id: "9",
    name: "Issey Miyake Pleated Pants",
    price: 912,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400",
    brand: "Issey Miyake",
    category: "Pants",
    size: ["30", "32", "34"],
    color: "Black",
    inStock: true,
    isSoldOut: false,
    totalStock: 1,
    soldQuantity: 0,
    createdAt: "2024-10-08T10:00:00Z" // 6 days ago - OLD
  },
  {
    id: "10",
    name: "Maharishi Reflective Jacket",
    price: 2700,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
    brand: "Maharishi",
    category: "Jackets",
    size: ["S", "M"],
    color: "Olive",
    inStock: true,
    totalStock: 1,
    soldQuantity: 0
  },
  {
    id: "11",
    name: "Oakley Software Cargo Shorts",
    price: 566,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400",
    brand: "Oakley",
    category: "Collection",
    size: ["30", "32", "34"],
    color: "Blue",
    inStock: true,
    totalStock: 1,
    soldQuantity: 0
  },
  {
    id: "12",
    name: "Prada Sport Mesh Jacket",
    price: 2123,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
    brand: "Prada",
    category: "Jackets",
    size: ["6-8"],
    color: "Black",
    inStock: true,
    totalStock: 1,
    soldQuantity: 0
  }
]

export const brands = ["Nike", "Stone Island", "Comme Des Garcons", "Arc'teryx", "Prada", "Oakley", "Supreme", "Issey Miyake", "Maharishi"]
export const categories = ["Jackets", "T-Shirts", "Accessories", "Pants", "Collection"]
export const colors = ["Black", "Blue", "Yellow", "Multi", "Denim", "Olive"]
export const sizes = ["XS", "S", "M", "L", "XL", "XXL", "30", "32", "34", "36", "6-8", "O/S"]
