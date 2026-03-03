-- Create block_user function
CREATE OR REPLACE FUNCTION block_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET is_blocked = TRUE
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
