import { Product } from '@/data/products'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  // Debug log
  console.log('ProductGrid rendering with', products.length, 'products');
  console.log('Products status:', products.map(p => ({ 
    id: p.id, 
    name: p.name, 
    inStock: p.inStock, 
    isSoldOut: p.isSoldOut 
  })));

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard 
          key={`${product.id}-${product.isSoldOut}-${Date.now()}`} 
          product={product} 
        />
      ))}
    </div>
  )
}
