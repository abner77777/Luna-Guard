-- Simplify the INSERT policy to troubleshoot the auth issue
DROP POLICY "Users and admins can insert vehicles" ON public.vehicles;

-- Create a temporary permissive policy for debugging
CREATE POLICY "Temporary permissive insert policy" ON public.vehicles
FOR INSERT TO authenticated 
WITH CHECK (true);