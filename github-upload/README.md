# Farid Fashion Store - RydStore.my

Modern e-commerce website built with Next.js 14, TypeScript, and Tailwind CSS for premium streetwear and fashion.

## ✨ Features

- 🛍️ **Product Catalog**: Responsive grid layout with categories
- 🛒 **Shopping Cart**: Full cart functionality with localStorage
- 📱 **Mobile-First**: Touch-optimized responsive design
- 🎨 **Black & White Theme**: Minimalist design aesthetic
- ⚡ **Performance**: Fast loading with Next.js optimization
- 🔄 **Real-time Updates**: Dynamic cart and product management
- 💳 **Payment Ready**: Integrated payment modal system
- 🎯 **Product Detail**: Enhanced product pages with Add to Cart
- **Responsive Design**: Works perfectly on all devices
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Images**: Next.js Image optimization

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

### Installation

1. Clone or download the project
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Homepage
├── components/         # React components
│   ├── Header.tsx      # Navigation header
│   ├── FilterSidebar.tsx # Product filters
│   ├── ProductGrid.tsx # Product grid layout
│   └── ProductCard.tsx # Individual product cards
└── data/
    └── products.ts     # Sample product data
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Customization

### Adding Products

Edit `/src/data/products.ts` to add or modify products:

```typescript
{
  id: "unique-id",
  name: "Product Name",
  price: 999,
  image: "image-url",
  brand: "Brand Name",
  category: "Category",
  size: ["S", "M", "L"],
  color: "Color",
  inStock: true,
  isNew: true
}
```

### Styling

The website uses Tailwind CSS. Customize the design by editing the Tailwind classes in components or modify the theme in `tailwind.config.js`.

### Filters

Add new filter categories by updating:
- `brands`, `categories`, `colors`, `sizes` arrays in `/src/data/products.ts`
- Filter logic in `/src/components/FilterSidebar.tsx`

## License

This project is for educational purposes. Please ensure you have proper licenses for any images or content you use in production.

## Support

For questions or issues, please create an issue in the repository.
