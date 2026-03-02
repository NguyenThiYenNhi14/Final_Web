import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartItem, CartService } from '../../services/cart';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit, OnDestroy {
  orderComplete: boolean = false;
  isProcessing: boolean = false;
  cartItems: CartItem[] = [];
  subtotal: number = 0;
  total: number = 0;
  selectedPayment: string = 'cod';

  private sub!: Subscription;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.sub = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      this.total = this.subtotal;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  selectPayment(method: string): void {
    this.selectedPayment = method;
  }

  onPlaceOrder(event: Event): void {
    event.preventDefault();
    this.isProcessing = true;
    setTimeout(() => {
      this.isProcessing = false;
      this.orderComplete = true;
      this.cartService.clearCart();
    }, 1500);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }
}