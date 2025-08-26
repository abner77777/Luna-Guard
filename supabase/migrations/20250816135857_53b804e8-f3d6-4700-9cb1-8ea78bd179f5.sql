-- Drop the temporary policy and create a proper one
DROP POLICY "Temporary permissive insert policy" ON public.vehicles;

-- Create a simple policy that actually works
CREATE POLICY "Allow authenticated users to insert vehicles" ON public.vehicles
FOR INSERT TO authenticated 
WITH CHECK (true);

-- Also ensure SELECT works properly for admins
DROP POLICY "Users can view their own vehicles" ON public.vehicles;

CREATE POLICY "Admin can view all vehicles, users can view their own" ON public.vehicles
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR 
  user_id = auth.uid()
);