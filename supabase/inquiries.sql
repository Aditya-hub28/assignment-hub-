-- ==============================================================================
-- ASSIGNMENT HUB — INQUIRIES & INQUIRY MESSAGES TABLE & RLS POLICIES
-- Phase: Academic Desk Inquiries & Request-Linked Chat Center
-- ==============================================================================

-- 1. Inquiries Table (Exactly ONE inquiry per service request)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id TEXT PRIMARY KEY, -- INQ-YYYYMMDD-XXX (e.g. INQ-20261004-001)
    request_id TEXT NOT NULL UNIQUE REFERENCES public.service_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    user_name TEXT,
    title TEXT NOT NULL,
    subject TEXT,
    service TEXT,
    deadline TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in-progress', 'resolved', 'closed')),
    status_label TEXT DEFAULT 'In Progress',
    assigned_specialist TEXT DEFAULT 'Admin',
    latest_message TEXT,
    latest_message_time TIMESTAMPTZ DEFAULT NOW(),
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON public.inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_request_id ON public.inquiries(request_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_updated_at ON public.inquiries(updated_at DESC);

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER update_inquiries_updated_at
    BEFORE UPDATE ON public.inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Inquiry Messages Table
CREATE TABLE IF NOT EXISTS public.inquiry_messages (
    id TEXT PRIMARY KEY, -- MSG-timestamp-random
    inquiry_id TEXT NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
    request_id TEXT NOT NULL,
    sender_id TEXT,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'student', 'team', 'coordinator', 'specialist', 'system')),
    sender_name TEXT NOT NULL,
    sender_badge TEXT,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiry_messages_inquiry_id ON public.inquiry_messages(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_messages_created_at ON public.inquiry_messages(created_at ASC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_messages ENABLE ROW LEVEL SECURITY;

-- 4. Inquiries RLS Policies
DROP POLICY IF EXISTS "Users can view own inquiries" ON public.inquiries;
CREATE POLICY "Users can view own inquiries"
    ON public.inquiries FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id 
        OR user_email = (auth.jwt() ->> 'email')
    );

DROP POLICY IF EXISTS "Users can insert own inquiries" ON public.inquiries;
CREATE POLICY "Users can insert own inquiries"
    ON public.inquiries FOR INSERT TO authenticated
    WITH CHECK (
        auth.uid() = user_id 
        OR user_id IS NULL
    );

DROP POLICY IF EXISTS "Users can update own inquiries" ON public.inquiries;
CREATE POLICY "Users can update own inquiries"
    ON public.inquiries FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all inquiries" ON public.inquiries;
CREATE POLICY "Admins can manage all inquiries"
    ON public.inquiries FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Inquiry Messages RLS Policies
DROP POLICY IF EXISTS "Users can view messages for own inquiries" ON public.inquiry_messages;
CREATE POLICY "Users can view messages for own inquiries"
    ON public.inquiry_messages FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.inquiries i
            WHERE i.id = inquiry_messages.inquiry_id
            AND (i.user_id = auth.uid() OR i.user_email = (auth.jwt() ->> 'email'))
        )
    );

DROP POLICY IF EXISTS "Users can insert messages into own inquiries" ON public.inquiry_messages;
CREATE POLICY "Users can insert messages into own inquiries"
    ON public.inquiry_messages FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.inquiries i
            WHERE i.id = inquiry_messages.inquiry_id
            AND (i.user_id = auth.uid() OR i.user_email = (auth.jwt() ->> 'email'))
        )
    );

DROP POLICY IF EXISTS "Admins can manage all inquiry messages" ON public.inquiry_messages;
CREATE POLICY "Admins can manage all inquiry messages"
    ON public.inquiry_messages FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 6. Enable Supabase Realtime for live chat updates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'inquiry_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiry_messages;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- In environments without supabase_realtime publication, continue gracefully
END $$;
