-- Create donations table
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES public.donor_profiles(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_provider TEXT NOT NULL,
  payment_provider_id TEXT,
  payment_provider_fee NUMERIC(10,2),
  project_id UUID,
  donation_type TEXT NOT NULL DEFAULT 'one-time',
  is_anonymous BOOLEAN DEFAULT FALSE,
  donor_message TEXT,
  donor_name TEXT,
  donor_email TEXT NOT NULL,
  receipt_sent BOOLEAN DEFAULT FALSE,
  receipt_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create donation_metadata table for additional flexible data
CREATE TABLE IF NOT EXISTS public.donation_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recurring_donations table for subscription management
CREATE TABLE IF NOT EXISTS public.recurring_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES public.donor_profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  frequency TEXT NOT NULL DEFAULT 'monthly',
  payment_method TEXT NOT NULL,
  payment_provider TEXT NOT NULL,
  payment_provider_subscription_id TEXT,
  project_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  next_payment_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for donations
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Policy: Donors can read their own donations
CREATE POLICY donations_select_own ON public.donations
  FOR SELECT USING (donor_id = auth.uid());

-- Policy: Admins can read all donations
CREATE POLICY donations_select_admin ON public.donations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Admins can update donations
CREATE POLICY donations_update_admin ON public.donations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: System can insert donations (for payment webhooks)
CREATE POLICY donations_insert_system ON public.donations
  FOR INSERT WITH CHECK (true);

-- Add RLS policies for donation_metadata
ALTER TABLE public.donation_metadata ENABLE ROW LEVEL SECURITY;

-- Policy: Donors can read their own donation metadata
CREATE POLICY donation_metadata_select_own ON public.donation_metadata
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.donations
      WHERE donations.id = donation_metadata.donation_id AND donations.donor_id = auth.uid()
    )
  );

-- Policy: Admins can read all donation metadata
CREATE POLICY donation_metadata_select_admin ON public.donation_metadata
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: System can insert donation metadata
CREATE POLICY donation_metadata_insert_system ON public.donation_metadata
  FOR INSERT WITH CHECK (true);

-- Add RLS policies for recurring_donations
ALTER TABLE public.recurring_donations ENABLE ROW LEVEL SECURITY;

-- Policy: Donors can read their own recurring donations
CREATE POLICY recurring_donations_select_own ON public.recurring_donations
  FOR SELECT USING (donor_id = auth.uid());

-- Policy: Donors can update their own recurring donations
CREATE POLICY recurring_donations_update_own ON public.recurring_donations
  FOR UPDATE USING (donor_id = auth.uid());

-- Policy: Admins can read all recurring donations
CREATE POLICY recurring_donations_select_admin ON public.recurring_donations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Admins can update all recurring donations
CREATE POLICY recurring_donations_update_admin ON public.recurring_donations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Add triggers to update the updated_at timestamp
CREATE TRIGGER update_donations_updated_at
BEFORE UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_donations_updated_at
BEFORE UPDATE ON public.recurring_donations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX idx_donations_payment_status ON public.donations(payment_status);
CREATE INDEX idx_donations_created_at ON public.donations(created_at);
CREATE INDEX idx_donation_metadata_donation_id ON public.donation_metadata(donation_id);
CREATE INDEX idx_recurring_donations_donor_id ON public.recurring_donations(donor_id);
CREATE INDEX idx_recurring_donations_next_payment_date ON public.recurring_donations(next_payment_date);
