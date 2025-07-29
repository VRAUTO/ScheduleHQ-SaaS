-- Create user_availability table
CREATE TABLE user_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, start_time, end_time)
);

-- Enable Row Level Security
ALTER TABLE user_availability ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own availability" ON user_availability
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own availability" ON user_availability
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own availability" ON user_availability
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own availability" ON user_availability
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_availability_user_date ON user_availability(user_id, date);
CREATE INDEX idx_user_availability_date_range ON user_availability(date, start_time, end_time);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_availability_updated_at 
  BEFORE UPDATE ON user_availability 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
