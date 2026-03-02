import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product, ProductService } from '../../services/product';
import { Router, RouterModule, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  displayedProducts: Product[] = [];

  categories: string[] = ['All Categories', 'Running', 'Basketball', 'Casual', 'Lifestyle'];
  selectedCategory: string = 'All Categories';
  selectedSort: string = 'Filter';
  searchText: string = '';

  // Show All logic
  itemsPerPage: number = 8;
  showingAll: boolean = false;

  private routerSubscription?: Subscription;
  private queryParamSubscription?: Subscription;

  // Banner slides
  bannerSlides = [
    {
      title: 'SEEKER',
      subtitle: 'Up your game in our latest innovations for the court, the field, and everywhere in between and also another interesting feature.',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=500&fit=crop&q=80'
    },
    {
      title: 'NEW ARRIVALS',
      subtitle: 'Discover the latest collection of premium sneakers designed for performance and style.',
      image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200&h=500&fit=crop&q=80'
    },
    {
      title: 'SUMMER COLLECTION',
      subtitle: 'Light, breathable, and perfect for the season. Get ready to make a statement.',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&h=500&fit=crop&q=80'
    }
  ];
  currentSlide = 0;

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Lắng nghe query params (?search=...) — kể cả khi navigate từ header
    this.queryParamSubscription = this.route.queryParams.subscribe(params => {
      const searchParam = params['search'] || '';
      this.searchText = searchParam;
      // Nếu products đã load rồi thì filter luôn, nếu chưa thì loadProducts sẽ tự filter
      if (this.products.length > 0) {
        this.applyFilters();
      }
    });

    this.loadProducts();
    this.startBannerCarousel();

    // Listen to NavigationEnd để reload khi quay lại /shop không có param
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.url === '/shop') {
        this.resetView();
        this.loadProducts();
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.queryParamSubscription?.unsubscribe();
  }

  resetView(): void {
    this.showingAll = false;
    this.searchText = '';
    this.selectedCategory = 'All Categories';
    this.selectedSort = 'Filter';
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        // Áp dụng filter ngay sau khi có data (kể cả searchText từ query param)
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.products = [];
        this.filteredProducts = [];
        this.displayedProducts = [];
      }
    });
  }

  // Hàm tổng hợp: áp dụng search + category + sort cùng lúc
  applyFilters(): void {
    this.showingAll = false;
    let filtered = this.products;

    // Filter by search text
    if (this.searchText && this.searchText.trim()) {
      const q = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (this.selectedCategory !== 'All Categories') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    this.filteredProducts = filtered;
    this.applySort();
    this.updateDisplayedProducts();
  }

  updateDisplayedProducts(): void {
    if (this.showingAll) {
      this.displayedProducts = this.filteredProducts;
    } else {
      this.displayedProducts = this.filteredProducts.slice(0, this.itemsPerPage);
    }
  }

  showAll(): void {
    this.showingAll = true;
    this.updateDisplayedProducts();
  }

  // Gọi khi user gõ vào search box trên trang shop
  searchProducts(): void {
    this.applyFilters();
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onSortChange(): void {
    this.applySort();
    this.updateDisplayedProducts();
  }

  applySort(): void {
    switch (this.selectedSort) {
      case 'Price: Low to High':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'Newest':
        this.filteredProducts.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        this.filteredProducts.sort((a, b) => b.rating - a.rating);
    }
  }

  // Banner carousel
  startBannerCarousel(): void {
    setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.bannerSlides.length;
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.bannerSlides.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars ? '★' : '☆');
    }
    return stars;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  getProductImage(product: Product): string {
    if (product.image) return product.image;
    return 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image';
  }

  addToCart(product: Product): void {
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
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 2500);
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image';
  }
}