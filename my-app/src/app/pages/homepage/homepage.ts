import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Product, ProductService } from '../../services/product';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit, AfterViewInit {
  lastestProducts: Product[] = [];
  featuredProducts: Product[] = [];
  
  // Loading & Error states
  isLoadingLatest: boolean = true;
  isLoadingFeatured: boolean = true;
  errorLatest: string = '';
  errorFeatured: string = '';

  @ViewChild('contentWrapper') contentWrapper!: ElementRef;

  constructor(
    private productService: ProductService,
    private router: Router,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    console.log('Homepage component initialized');
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.initScrollAnimations();
  }

  /**
   * Load products from API with enhanced error handling
   */
  loadProducts(): void {
    console.log('Loading homepage products...');
    
    // Reset states
    this.isLoadingLatest = true;
    this.isLoadingFeatured = true;
    this.errorLatest = '';
    this.errorFeatured = '';
    
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        console.log('Successfully loaded', products.length, 'products');
        
        if (!products || products.length === 0) {
          console.warn('No products returned from API');
          this.errorLatest = 'No products available';
          this.errorFeatured = 'No products available';
          this.isLoadingLatest = false;
          this.isLoadingFeatured = false;
          return;
        }
        
        // Latest products: first 8 items
        this.lastestProducts = products.slice(0, 8);
        this.isLoadingLatest = false;
        console.log('Latest products:', this.lastestProducts.length);
        
        // Featured products: only 4 products (items 8-12)
        this.featuredProducts = products.slice(8, 12);
        
        // Option 2: Filter by featured flag (uncomment if your API supports it)
        // this.featuredProducts = products
        //   .filter(p => p.featured === true)
        //   .slice(0, 4);
        
        // Fallback: if not enough products for featured section
        if (this.featuredProducts.length === 0 && products.length > 0) {
          console.log('Not enough products for featured section, using duplicates');
          this.featuredProducts = products.slice(0, Math.min(4, products.length));
        }
        
        this.isLoadingFeatured = false;
        console.log('Featured products:', this.featuredProducts.length);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.status,
          statusText: err.statusText,
          url: err.url
        });
        
        this.errorLatest = 'Failed to load products. Please check your connection and try again.';
        this.errorFeatured = 'Failed to load products. Please check your connection and try again.';
        this.isLoadingLatest = false;
        this.isLoadingFeatured = false;
        
        // Set empty arrays
        this.lastestProducts = [];
        this.featuredProducts = [];
      }
    });
  }

  /**
   * Initialize scroll-based animations
   */
  initScrollAnimations(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.3
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-active');
        }
      });
    }, options);

    // Observe content wrapper
    if (this.contentWrapper) {
      observer.observe(this.contentWrapper.nativeElement);
    }

    // Observe product sections
    const sections = document.querySelectorAll('.lastest-section, .featured-section');
    sections.forEach(section => observer.observe(section));
  }

  /**
   * Calculate discount percentage
   */
  getDiscountPercentage(price: number, originalPrice: number): number {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  /**
   * Format price in Vietnamese Dong
   */
  formatPrice(price: number): string {
    if (!price || isNaN(price)) {
      return '0₫';
    }
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  /**
   * Generate star rating array for template iteration
   */
  generateStarRating(rating: number): string[] {
    if (!rating || isNaN(rating)) {
      rating = 0;
    }
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars: string[] = [];
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push('half');
    }
    
    // Fill remaining with empty stars
    const totalStars = hasHalfStar ? fullStars + 1 : fullStars;
    for (let i = totalStars; i < 5; i++) {
      stars.push('empty');
    }
    
    return stars;
  }

  /**
   * Get star character for rendering
   */
  getStarChar(type: string): string {
    switch (type) {
      case 'full': return '★';
      case 'half': return '⯨';
      default: return '☆';
    }
  }

  /**
   * Quick add to cart
   */
  quickAddToCart(productId: string): void {
    const allProducts = [...this.lastestProducts, ...this.featuredProducts];
    const product = allProducts.find(p => p._id === productId);

    if (!product) return;

    this.cartService.addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      images: [product.image],
      selectedSize: '9',
      selectedColor: 'black',
      quantity: 1
    });

    // Toast notification
    const toast = document.createElement('div');
    toast.textContent = `"${product.name}" added to cart!`;
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

  /**
   * Handle video load error
   */
  onVideoError(event: any): void {
    console.warn('Video failed to load');
    const videoBox = event.target.closest('.video-box');
    if (videoBox) {
      videoBox.style.display = 'none';
    }
  }

  /**
   * Retry loading products
   */
  retryLoadProducts(): void {
    console.log('Retrying product load...');
    this.loadProducts();
  }
}