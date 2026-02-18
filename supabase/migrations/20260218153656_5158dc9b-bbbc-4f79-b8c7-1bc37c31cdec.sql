
-- Fix 1: Replace overly permissive WITH CHECK (true) on orders INSERT
-- Keep guest checkout but add basic validation
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;

CREATE POLICY "Public can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  -- Items must not be empty
  jsonb_array_length(items) > 0
  -- Status must be 'pending' on creation
  AND status = 'pending'
  -- total_final_pagado must be null on creation (only set by admin on confirm)
  AND total_final_pagado IS NULL
);

-- Fix 2: Add explicit restrictive SELECT policy for non-admin public users
-- This prevents future misconfigurations from accidentally exposing order data
-- (Admins already have their own SELECT policy)
-- No additional policy needed since RLS blocks by default when no matching policy exists.
-- We document this with a comment instead.

COMMENT ON TABLE public.orders IS 
'Guest orders table. Public INSERT allowed with validation. SELECT/UPDATE/DELETE restricted to admins via RLS. RLS default-deny prevents public reads.';
