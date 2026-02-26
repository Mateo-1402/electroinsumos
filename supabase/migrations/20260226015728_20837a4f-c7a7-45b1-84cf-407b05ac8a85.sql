
-- Add source column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'whatsapp';

-- Create POS sale function (atomic: insert order + subtract stock)
CREATE OR REPLACE FUNCTION public.create_pos_sale(
  p_customer_name TEXT,
  p_items JSONB,
  p_final_price NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_product_id UUID;
  v_quantity INT;
BEGIN
  -- Check caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Validate items
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'No items in sale';
  END IF;

  -- Insert order as completed + physical
  INSERT INTO public.orders (customer_name, items, total_price, total_final_pagado, status, source)
  VALUES (p_customer_name, p_items, p_final_price, p_final_price, 'completed', 'physical')
  RETURNING id INTO v_order_id;

  -- Subtract stock for each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'id')::UUID;
    v_quantity := (v_item->>'quantity')::INT;

    UPDATE public.products
    SET stock = GREATEST(0, COALESCE(stock, 0) - v_quantity)
    WHERE id = v_product_id;
  END LOOP;

  RETURN v_order_id;
END;
$$;
