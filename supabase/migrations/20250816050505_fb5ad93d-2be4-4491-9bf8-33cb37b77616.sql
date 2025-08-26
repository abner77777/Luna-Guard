-- Add status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Update existing records to have active status
UPDATE public.profiles SET status = 'active' WHERE status IS NULL;