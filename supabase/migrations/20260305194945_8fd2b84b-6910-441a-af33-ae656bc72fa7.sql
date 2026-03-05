
CREATE OR REPLACE FUNCTION public.create_workshop_usage(p_items jsonb)
RETURNS uuid
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
    RAISE EXCEPTION 'No items provided';
  END IF;

  -- Insert order as completed + workshop with zero price
  INSERT INTO public.orders (customer_name, items, total_price, total_final_pagado, status, source)
  VALUES ('Uso de Taller', p_items, 0, 0, 'completed', 'workshop')
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
