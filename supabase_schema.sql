-- Supabase Database Schema for PDFTablePro
-- Run this in your Supabase SQL Editor

-- Create user_profiles table
CREATE TABLE user_profiles (
    id uuid REFERENCES auth.users PRIMARY KEY,
    tier text DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'professional', 'business', 'enterprise')),
    pages_used_today integer DEFAULT 0,
    pages_used_month integer DEFAULT 0,
    last_reset_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id, tier, pages_used_today, pages_used_month)
    VALUES (new.id, 'free', 0, 0);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to reset daily usage (run this daily via cron)
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS void AS $$
BEGIN
    UPDATE user_profiles 
    SET pages_used_today = 0, 
        last_reset_date = CURRENT_DATE
    WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Create function to reset monthly usage (run this monthly via cron)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE user_profiles 
    SET pages_used_month = 0
    WHERE EXTRACT(day FROM CURRENT_DATE) = 1;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_tier ON user_profiles(tier);
CREATE INDEX idx_user_profiles_last_reset ON user_profiles(last_reset_date);

-- Insert some test data (optional)
-- This will only work if you have test users already created
-- INSERT INTO user_profiles (id, tier, pages_used_today, pages_used_month) 
-- VALUES ('test-user-uuid', 'free', 0, 0);

-- Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;