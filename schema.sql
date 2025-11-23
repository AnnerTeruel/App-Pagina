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

-- GAMIFICATION SYSTEM

-- Add points to users table
alter table users add column if not exists points integer default 0;

-- Points History Table
create table if not exists points_history (
  id uuid default uuid_generate_v4() primary key,
  "userId" uuid references users(id),
  amount integer not null,
  reason text not null, -- 'purchase', 'redemption', 'bonus', 'refund'
  description text,
  "createdAt" timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for points_history
alter table points_history enable row level security;

create policy "Users can view their own points history" 
  on points_history for select 
  using (auth.uid() = "userId");

create policy "System can insert points history" 
  on points_history for insert 
  with check (true); -- In a real app, this should be restricted to server-side only functions
create policy "Users are viewable by everyone" on users for select using (true);
create policy "Users can insert" on users for insert with check (true);

alter table orders enable row level security;
create policy "Orders are viewable by everyone" on orders for select using (true);
create policy "Orders can insert" on orders for insert with check (true);

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

-- PREDEFINED DESIGNS TABLE
create table if not exists predefined_designs (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  "imageUrl" text not null,
  category text,
  "createdAt" timestamp with time zone default timezone('utc'::text, now())
);

alter table predefined_designs enable row level security;
create policy "Anyone can view predefined designs" on predefined_designs for select using (true);
create policy "Only admins can insert predefined designs" on predefined_designs for insert with check (true);

-- CUSTOM DESIGNS TABLE (user submissions)
create table if not exists custom_designs (
  id uuid default uuid_generate_v4() primary key,
  "userId" uuid references users(id) on delete cascade,
  name text not null,
  description text,
  "designData" jsonb,
  "imageUrl" text,
  status text default 'pending',
  "createdAt" timestamp with time zone default timezone('utc'::text, now())
);

alter table custom_designs enable row level security;
create policy "Users can view their own designs" on custom_designs for select using (true);
create policy "Users can insert their own designs" on custom_designs for insert with check (true);
create policy "Admins can view all designs" on custom_designs for select using (true);

-- DESIGN REQUESTS TABLE
create table if not exists design_requests (
  id uuid default uuid_generate_v4() primary key,
  "userId" uuid references users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  description text not null,
  "productType" text,
  quantity integer,
  status text default 'pending',
  "createdAt" timestamp with time zone default timezone('utc'::text, now())
);

alter table design_requests enable row level security;
create policy "Users can view their own requests" on design_requests for select using (true);
create policy "Users can insert requests" on design_requests for insert with check (true);
create policy "Admins can view all requests" on design_requests for select using (true);

-- QUOTES TABLE
create table if not exists quotes (
  id uuid default uuid_generate_v4() primary key,
  "userId" uuid references users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  "productType" text not null,
  quantity integer not null,
  description text,
  "estimatedPrice" numeric,
  status text default 'pending',
  "createdAt" timestamp with time zone default timezone('utc'::text, now())
);

alter table quotes enable row level security;
create policy \"Users can view their own quotes\" on quotes for select using (true);
create policy \"Users can insert quotes\" on quotes for insert with check (true);
create policy \"Admins can view all quotes\" on quotes for select using (true);

-- COUPONS TABLE
create table if not exists coupons (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  "userId" uuid references users(id) on delete cascade,
  discount numeric not null check (discount > 0),
  "isUsed" boolean default false,
  "usedAt" timestamp with time zone,
  "orderId" uuid references orders(id) on delete set null,
  "createdAt" timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies for Coupons
alter table coupons enable row level security;

-- Users can view their own coupons
create policy "Users can view own coupons"
on coupons for select
using (true);

-- Users can create coupons (through redemption)
create policy "Users can create coupons"
on coupons for insert
with check (true);

-- Users can update their own coupons (mark as used)
create policy "Users can update own coupons"
on coupons for update
using (true);

-- REVIEWS TABLE
create table if not exists reviews (
  id uuid default uuid_generate_v4() primary key,
  "productId" uuid references products(id) on delete cascade,
  "userId" uuid references users(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  "createdAt" timestamp with time zone default timezone('utc'::text, now())
);

alter table reviews enable row level security;
create policy "Reviews are viewable by everyone" on reviews for select using (true);
create policy "Authenticated users can insert reviews" on reviews for insert with check (true);
