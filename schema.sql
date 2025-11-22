-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PRODUCTS TABLE
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric not null,
  category text,
  inventory integer default 0,
  image text,
  images text[], -- Array of strings
  colors text[], -- Array of strings
  sizes text[], -- Array of strings
  materials text[], -- Array of strings
  "colorImages" jsonb, -- JSON array for color-image mapping
  "isFeatured" boolean default false,
  "createdAt" timestamp with time zone default timezone('utc'::text, now())
);

-- USERS TABLE (Custom auth for this template)
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password text not null, -- In a real app, this should be hashed!
  name text,
  role text default 'customer', -- 'customer' or 'admin'
  "createdAt" timestamp with time zone default timezone('utc'::text, now())
);

-- ORDERS TABLE
create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  "userId" uuid references users(id),
  total numeric not null,
  status text default 'pending', -- 'pending', 'completed', 'cancelled'
  "paymentMethod" text,
  "shippingAddress" jsonb,
  items jsonb, -- Storing items as JSON for simplicity in this migration
  "createdAt" timestamp with time zone default timezone('utc'::text, now())
);

-- RLS POLICIES (Open for now for simplicity, lock down in production)
alter table products enable row level security;
create policy "Public products are viewable by everyone" on products for select using (true);
create policy "Users can insert products" on products for insert with check (true);
create policy "Users can update products" on products for update using (true);

alter table users enable row level security;
create policy "Users are viewable by everyone" on users for select using (true);
create policy "Users can insert" on users for insert with check (true);

alter table orders enable row level security;
create policy "Orders are viewable by everyone" on orders for select using (true);
create policy "Orders can insert" on orders for insert with check (true);

-- REVIEWS TABLE
create table if not exists reviews (
  id uuid default uuid_generate_v4() primary key,
  "productId" uuid references products(id) on delete cascade,
  "userId" uuid references users(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  "userName" text, -- Store name to avoid complex joins for now
  "createdAt" timestamp with time zone default timezone('utc'::text, now())
);

alter table reviews enable row level security;
create policy "Reviews are viewable by everyone" on reviews for select using (true);
create policy "Authenticated users can insert reviews" on reviews for insert with check (auth.role() = 'authenticated' OR true); -- Allow all for custom auth

-- WISHLIST TABLE
create table if not exists wishlist (
  id uuid default uuid_generate_v4() primary key,
  "userId" uuid references users(id) on delete cascade,
  "productId" uuid references products(id) on delete cascade,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()),
  unique("userId", "productId")
);

alter table wishlist enable row level security;
create policy "Users can view their own wishlist" on wishlist for select using (true);
create policy "Users can insert into their own wishlist" on wishlist for insert with check (true);
create policy "Users can delete from their own wishlist" on wishlist for delete using (true);

-- RECENTLY VIEWED TABLE
create table if not exists recently_viewed (
  id uuid default uuid_generate_v4() primary key,
  "userId" uuid references users(id) on delete cascade,
  "productId" uuid references products(id) on delete cascade,
  "viewedAt" timestamp with time zone default timezone('utc'::text, now()),
  unique("userId", "productId")
);

alter table recently_viewed enable row level security;
create policy "Users can view their own history" on recently_viewed for select using (true);
create policy "Users can insert their own history" on recently_viewed for insert with check (true);
create policy "Users can update their own history" on recently_viewed for update using (true);
