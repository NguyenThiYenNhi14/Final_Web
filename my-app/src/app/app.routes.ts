import { Routes } from '@angular/router';
import { Shop } from './pages/shop/shop';
import { ProductDetail } from './pages/product-detail/product-detail';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { Homepage } from './pages/homepage/homepage';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';

export const routes: Routes = [
    {path:'', redirectTo:'/homepage', pathMatch:'full'},
    {path:'homepage', component: Homepage, runGuardsAndResolvers: 'always'},
    {path: 'shop', component: Shop, runGuardsAndResolvers: 'always'},
    {path:'product/:id', component:ProductDetail},
    {path:'about', component:About},
    {path:'contact', component: Contact},
    {path: 'login', component: Login },
    {path: 'register', component: Register },
    { path: 'cart', component: Cart },
    { path: 'checkout', component: Checkout },
];