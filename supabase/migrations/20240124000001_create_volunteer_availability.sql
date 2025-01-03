-- Create volunteer availability table
CREATE TABLE volunteer_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    volunteer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Create RLS policies
ALTER TABLE volunteer_availability ENABLE ROW LEVEL SECURITY;

-- Allow volunteers to view their own availability
CREATE POLICY "Volunteers can view their own availability"
    ON volunteer_availability
    FOR SELECT
    USING (auth.uid() = volunteer_id);

-- Allow volunteers to insert their own availability
CREATE POLICY "Volunteers can insert their own availability"
    ON volunteer_availability
    FOR INSERT
    WITH CHECK (auth.uid() = volunteer_id);

-- Allow volunteers to update their own availability
CREATE POLICY "Volunteers can update their own availability"
    ON volunteer_availability
    FOR UPDATE
    USING (auth.uid() = volunteer_id)
    WITH CHECK (auth.uid() = volunteer_id);

-- Allow volunteers to delete their own availability
CREATE POLICY "Volunteers can delete their own availability"
    ON volunteer_availability
    FOR DELETE
    USING (auth.uid() = volunteer_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_volunteer_availability_updated_at
    BEFORE UPDATE ON volunteer_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
