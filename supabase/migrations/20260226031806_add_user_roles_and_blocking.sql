-- Add role column to profiles table
ALTER TABLE profiles
ADD COLUMN role TEXT CHECK (role IN ('user', 'editor', 'admin', 'owner')) DEFAULT 'user';

-- Add is_blocked column to profiles table
ALTER TABLE profiles
ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE;

-- Enable RLS on the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policy for profiles table
CREATE POLICY "Users can view their own profile." ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles." ON profiles
FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner')));

CREATE POLICY "Users can update their own profile." ON profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles." ON profiles
FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'owner')));
