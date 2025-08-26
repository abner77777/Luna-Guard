-- Add policy to allow admins to view all user profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  (auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role = 'admin'
  )) OR 
  (auth.uid() = user_id)
);

-- Add policy to allow admins to update all user profiles  
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE 
TO authenticated
USING (
  (auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role = 'admin'
  )) OR 
  (auth.uid() = user_id)
);

-- Add policy to allow admins to delete user profiles (not their own)
CREATE POLICY "Admins can delete user profiles"
ON public.profiles
FOR DELETE 
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role = 'admin'
  ) AND auth.uid() != user_id
);