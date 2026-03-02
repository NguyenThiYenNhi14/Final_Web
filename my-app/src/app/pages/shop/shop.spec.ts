import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product, ProductService } from '../../services/product';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

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
  
  // PAGINATION
  itemsPerPage: number = 8;
  currentDisplayCount: number = 8;
  
  private routerSubscription?: Subscription;
  
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
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('Shop component initialized');
    
    // Load products immediately
    this.loadProducts();
    this.startBannerCarousel();
    
    // Listen for route changes to reload when navigating back to shop
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('Route changed to:', event.url);
      
      // If navigating to /shop or root, reload products
      if (event.url === '/shop' || event.url === '/' || event.url === '') {
        console.log(' Reloading products for shop page...');
        this.resetPagination();
        this.loadProducts();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadProducts(): void {
    console.log('Fetching products from API...');
    
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        console.log('Received', data.length, 'products from API');
        this.products = data;
        this.filteredProducts = data;
        this.updateDisplayedProducts();
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.products = [];
        this.filteredProducts = [];
        this.displayedProducts = [];
      }
    });
  }

  // PAGINATION METHODS
  updateDisplayedProducts(): void {
    this.displayedProducts = this.filteredProducts.slice(0, this.currentDisplayCount);
    console.log('Showing', this.displayedProducts.length, 'of', this.filteredProducts.length, 'products');
  }

  loadMore(): void {
    this.currentDisplayCount += this.itemsPerPage;
    this.updateDisplayedProducts();
    console.log('Loaded more. Now showing:', this.currentDisplayCount);
  }

  showAll(): void {
    this.currentDisplayCount = this.filteredProducts.length;
    this.updateDisplayedProducts();
    console.log('Showing all:', this.currentDisplayCount, 'products');
  }

  resetPagination(): void {
    this.currentDisplayCount = this.itemsPerPage;
    console.log('Reset pagination to:', this.itemsPerPage);
  }

  get hasMoreProducts(): boolean {
    return this.displayedProducts.length < this.filteredProducts.length;
  }

  // FILTER & SORT METHODS
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    if (category === 'All Categories') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(p => p.category === category);
    }
    this.resetPagination();
    this.applySort();
    this.updateDisplayedProducts();
  }

  searchProducts(): void {
    let filtered = this.products;
    
    if (this.searchText) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        p.brand.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
    
    if (this.selectedCategory !== 'All Categories') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }
    
    this.filteredProducts = filtered;
    this.resetPagination();
    this.applySort();
    this.updateDisplayedProducts();
  }

  onSortChange(): void {
    this.applySort();
    this.updateDisplayedProducts();
  }

  applySort(): void {
    switch(this.selectedSort) {
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

  // Generate star rating
  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars ? '★' : '☆');
    }
    return stars;
  }

  // Format VND price
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  getProductImage(product: Product): string {
    if (product.image) {
      return product.image;
    }
    return 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image';
  }

  onImageError(event: any): void {
    console.warn('Image failed to load, using placeholder');
    event.target.src = 'https://via.placeholder.com/400x400/cccccc/666666?text=No+Image';
  }
}