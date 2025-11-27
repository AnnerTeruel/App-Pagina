

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'admin';
  isAdmin: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  images?: string[];
  materials: string[];
  sizes: string[];
  colors: string[];
  inventory: number;
  isFeatured: boolean;
  barcode?: string;
  colorImages?: { color: string; image: string }[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'visa' | 'cash' | 'transfer' | 'debit' | 'credit';
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  is_active: boolean;
  createdAt: string;
}

export interface ContentBlock {
  id: string;
  section_name: string;
  content: {
    title: string;
    subtitle: string;
    image: string;
    ctaText?: string;
    ctaLink?: string;
  };
  updatedAt: string;
}
