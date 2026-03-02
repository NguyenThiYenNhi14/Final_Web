import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit {

  constructor() { }

  ngOnInit(): void {
    window.scrollTo(0, 0); 
  }

  onSubmit(event: Event): void {
    event.preventDefault(); 
    
    console.log('Form submitted!');
    
    alert('Thank you! Your message has been sent successfully.');
    
    const form = event.target as HTMLFormElement;
    form.reset();
  }
}

