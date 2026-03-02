import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { ProductService, Product } from '../../services/product';
import { CartService } from '../../services/cart';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetail implements OnInit, OnDestroy {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  selectedSize: string = '9';
  selectedColor: string = 'black';
  quantity: number = 1;
  
  private routerSubscription?: Subscription;
  
  sizes = ['7', '8', '9', '10', '11', '12'];
  
  colors = [
    { name: 'Black', code: '#000000' },
    { name: 'White', code: '#FFFFFF' },
    { name: 'Red', code: '#FF0000' }
  ];

  features = [
    'Free shipping on orders over $100',
    '30 day return policy',
    'Authentic products guaranteed',
    'Secure payment processing'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('ProductDetail initialized');
    this.loadProductFromRoute();
    
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.router.url.startsWith('/product/')) {
        console.log('Route changed, reloading product');
        this.loadProductFromRoute();
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private loadProductFromRoute() {
    this.product = null;
    
    const productId = this.route.snapshot.params['id'];
    console.log('Loading product ID:', productId);
    
    if (productId) {
      this.loadProduct(productId);
      this.loadRelatedProducts(productId);
    } else {
      console.error('No product ID in URL');
      this.router.navigate(['/shop']);
    }
  }

  loadProduct(id: string) {
    console.log('Fetching product from API');
    
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        console.log('Product loaded:', product);
        
        this.product = product;
        
        if (product.oldPrice && !product.originalPrice) {
          this.product.originalPrice = product.oldPrice;
        }
        
        this.cdr.detectChanges();
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log('Product state updated');
      },
      error: (error) => {
        console.error('Error loading product:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        
        alert(`Error: ${error.message || 'Cannot load product'}`);
        
        setTimeout(() => {
          this.router.navigate(['/shop']);
        }, 1000);
      }
    });
  }

  loadRelatedProducts(currentProductId: string) {
    console.log('Loading related products');
    
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        console.log('Related products loaded:', products.length);
        
        const otherProducts = products.filter(p => p._id !== currentProductId);
        this.relatedProducts = otherProducts
          .sort(() => Math.random() - 0.5)
          .slice(0, 4);
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading related products:', error);
        this.relatedProducts = [];
      }
    });
  }

  selectSize(size: string) {
    this.selectedSize = size;
    console.log('Selected size:', size);
  }

  selectColor(color: string) {
    this.selectedColor = color;
    console.log('Selected color:', color);
  }

  addToCart() {
    if (!this.product) return;

    this.cartService.addItem({
      id: this.product._id,
      name: this.product.name,
      price: this.product.price,
      images: [this.product.image],
      selectedSize: this.selectedSize,
      selectedColor: this.selectedColor,
      quantity: 1
    });

    // Toast notification
    const toast = document.createElement('div');
    toast.textContent = `"${this.product.name}" added to cart!`;
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: linear-gradient(135deg, #f97316, #ef4444);
      color: white; padding: 1rem 1.5rem;
      border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 9999; font-weight: 500;
    `;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 2500);
  }

  backToShop() {
    console.log('Back to shop');
    this.router.navigate(['/shop']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }
}