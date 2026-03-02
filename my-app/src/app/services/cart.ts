import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  images: string[];
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  private get items(): CartItem[] {
    return this.cartItemsSubject.getValue();
  }

  addItem(newItem: CartItem): void {
    const existing = this.items.find(
      i => i.id === newItem.id &&
           i.selectedSize === newItem.selectedSize &&
           i.selectedColor === newItem.selectedColor
    );

    if (existing) {
      this.updateQuantity(existing, existing.quantity + newItem.quantity);
    } else {
      this.cartItemsSubject.next([...this.items, newItem]);
    }
  }

  updateQuantity(item: CartItem, newQty: number): void {
    const updated = this.items.map(i =>
      i === item ? { ...i, quantity: newQty } : i
    );
    this.cartItemsSubject.next(updated);
  }

  removeItem(item: CartItem): void {
    this.cartItemsSubject.next(this.items.filter(i => i !== item));
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
  }
}