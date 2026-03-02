import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  cartItemCount: number = 0;
  searchOpen: boolean = false;
  searchQuery: string = '';

  private sub!: Subscription;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.cartService.cartItems$.subscribe(items => {
      this.cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleSearch(): void {
    if (this.searchOpen && this.searchQuery.trim()) {
      // Nếu đang mở và có text → submit luôn
      this.submitSearch();
    } else {
      this.searchOpen = !this.searchOpen;
      if (!this.searchOpen) {
        this.searchQuery = '';
      }
    }
  }

  submitSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/shop'], {
        queryParams: { search: this.searchQuery.trim() }
      });
    }
    this.closeSearch();
  }

  closeSearch(): void {
    this.searchOpen = false;
    this.searchQuery = '';
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}