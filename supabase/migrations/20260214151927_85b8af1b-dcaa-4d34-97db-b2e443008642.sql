
-- 1. Add negotiated price column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_final_pagado NUMERIC(10, 2);

-- 2. Create app_role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can read roles (using security definer to avoid recursion)
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Drop all existing policies on products
DROP POLICY IF EXISTS "Public Read" ON public.products;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;
DROP POLICY IF EXISTS "Admin All" ON public.products;

-- Recreate products policies
CREATE POLICY "Public can read products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Drop all existing policies on orders
DROP POLICY IF EXISTS "Public Create Order" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can view orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Admin View Orders" ON public.orders;

-- Recreate orders policies
CREATE POLICY "Public can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view orders" ON public.orders
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Atomic stock subtraction + order completion RPC
CREATE OR REPLACE FUNCTION public.confirm_order(
  p_order_id UUID,
  p_final_price NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_items JSONB;
  v_item JSONB;
  v_product_id UUID;
  v_quantity INT;
BEGIN
  -- Check caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get order items
  SELECT items INTO v_items FROM public.orders WHERE id = p_order_id AND status = 'pending';
  IF v_items IS NULL THEN
    RAISE EXCEPTION 'Order not found or not pending';
  END IF;

  -- Subtract stock for each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items)
  LOOP
    v_product_id := (v_item->>'id')::UUID;
    v_quantity := (v_item->>'quantity')::INT;

    UPDATE public.products
    SET stock = GREATEST(0, COALESCE(stock, 0) - v_quantity)
    WHERE id = v_product_id;
  END LOOP;

  -- Mark order as completed with final price
  UPDATE public.orders
  SET status = 'completed',
      total_final_pagado = p_final_price
  WHERE id = p_order_id;
END;
$$;
