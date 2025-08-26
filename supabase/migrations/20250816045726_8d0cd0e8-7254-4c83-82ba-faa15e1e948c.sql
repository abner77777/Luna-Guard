-- First, drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete user profiles" ON public.profiles;

-- Create security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  public.is_current_user_admin() OR auth.uid() = user_id
);

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE 
TO authenticated
USING (
  public.is_current_user_admin() OR auth.uid() = user_id
);

CREATE POLICY "Admins can delete user profiles"
ON public.profiles
FOR DELETE 
TO authenticated
USING (
  public.is_current_user_admin() AND auth.uid() != user_id
);