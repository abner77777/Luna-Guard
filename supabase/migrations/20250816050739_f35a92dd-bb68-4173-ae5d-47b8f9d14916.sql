-- Create a security definer function to check admin role without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop and recreate the admin policies to use the new function
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete user profiles" ON public.profiles;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin' OR auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin' OR auth.uid() = user_id);

CREATE POLICY "Admins can delete user profiles" 
ON public.profiles 
FOR DELETE 
USING (public.get_current_user_role() = 'admin' AND auth.uid() <> user_id);