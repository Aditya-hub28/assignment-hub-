-- ==============================================================================
-- ASSIGNMENT HUB — ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. Profiles Policies
-- ------------------------------------------------------------------------------

-- Allow users to view their own profile
CREATE POLICY "Users can read own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can read all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow users to update their own profile (protecting role and college_id from escalation)
CREATE POLICY "Users can update own basic profile details"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
        AND college_id IS NOT DISTINCT FROM (SELECT p.college_id FROM public.profiles p WHERE p.id = auth.uid())
    );

-- Allow admins to update any profile
CREATE POLICY "Admins can update all profiles"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ------------------------------------------------------------------------------
-- 3. Colleges Policies
-- ------------------------------------------------------------------------------

-- Authenticated users can view active colleges
CREATE POLICY "Authenticated users can view colleges"
    ON public.colleges
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Admins have full access to colleges table
CREATE POLICY "Admins can manage colleges"
    ON public.colleges
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ------------------------------------------------------------------------------
-- 4. OTP Verifications Policies
-- ------------------------------------------------------------------------------
-- OTP verifications table has RLS enabled with NO public or authenticated policies.
-- It can ONLY be accessed by the backend using the Supabase service_role key.
