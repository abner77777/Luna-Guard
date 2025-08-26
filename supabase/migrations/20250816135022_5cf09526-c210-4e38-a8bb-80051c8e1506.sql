-- Remove the restrictive policy that only allows users to insert their own vehicles
DROP POLICY "Users can insert their own vehicles" ON public.vehicles;

-- The "Admins can insert vehicles for any user" policy already covers both cases:
-- - Admins can insert for any user
-- - Users can insert their own vehicles (when auth.uid() = user_id)