-- Fix the INSERT policy to handle authentication issues more gracefully
DROP POLICY "Admins can insert vehicles for any user" ON public.vehicles;

-- Create a more robust policy that handles both admin and user cases
CREATE POLICY "Users and admins can insert vehicles" ON public.vehicles
FOR INSERT TO authenticated 
WITH CHECK (
  -- Allow if user is admin
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  OR 
  -- Allow if user is inserting their own vehicle
  user_id = auth.uid()
);