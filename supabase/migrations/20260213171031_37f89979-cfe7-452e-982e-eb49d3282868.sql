
-- Create Orders Table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT,
  total_price NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Anyone can insert orders (public checkout)
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

-- Only authenticated users (admin) can view orders
CREATE POLICY "Authenticated users can view orders"
ON public.orders
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only authenticated users can update orders
CREATE POLICY "Authenticated users can update orders"
ON public.orders
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Only authenticated users can delete orders
CREATE POLICY "Authenticated users can delete orders"
ON public.orders
FOR DELETE
USING (auth.uid() IS NOT NULL);
