-- Add policy to allow admins to insert vehicles for any user
CREATE POLICY "Admins can insert vehicles for any user" 
ON public.vehicles 
FOR INSERT 
WITH CHECK (
  get_current_user_role() = 'admin' OR auth.uid() = user_id
);