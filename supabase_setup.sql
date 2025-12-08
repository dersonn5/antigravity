-- 1. Create the Notifications Table
CREATE TABLE IF NOT EXISTS system_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- 'NEW_LEAD', 'STATUS_CHANGE', 'SALE'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all notifications (for now, or filter by user if needed later)
CREATE POLICY "Users can read notifications" ON system_notifications
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Service role/Triggers can insert
CREATE POLICY "Service role can insert notifications" ON system_notifications
    FOR INSERT
    TO authenticated, service_role
    WITH CHECK (true);
    
-- Policy: Users can update 'read' status
CREATE POLICY "Users can update notifications" ON system_notifications
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- 2. Function to handle New Leads
CREATE OR REPLACE FUNCTION handle_new_lead()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO system_notifications (type, title, message, metadata)
    VALUES (
        'NEW_LEAD',
        'Novo Lead na Mesa! 🔔',
        NEW.name || ' acabou de chegar.',
        jsonb_build_object(
            'lead_id', NEW.id,
            'lead_name', NEW.name,
            'vendedor', NEW.vendedor
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger for New Leads
DROP TRIGGER IF EXISTS on_lead_created ON jalves_leads;
CREATE TRIGGER on_lead_created
    AFTER INSERT ON jalves_leads
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_lead();


-- 4. Function to handle Status Changes
CREATE OR REPLACE FUNCTION handle_lead_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Special case for Sales (Fechado)
        IF NEW.status = 'fechado' THEN
             INSERT INTO system_notifications (type, title, message, metadata)
            VALUES (
                'SALE',
                'Venda Realizada! 🏆',
                COALESCE(NEW.vendedor, 'Alguém') || ' fechou com ' || NEW.name || '!',
                jsonb_build_object(
                    'lead_id', NEW.id,
                    'lead_name', NEW.name,
                    'vendedor', NEW.vendedor,
                    'old_status', OLD.status,
                    'new_status', NEW.status
                )
            );
        ELSE
            -- Normal status change
             INSERT INTO system_notifications (type, title, message, metadata)
            VALUES (
                'STATUS_CHANGE',
                'Mudança de Status 🔄',
                NEW.name || ' moveu para ' || NEW.status,
                jsonb_build_object(
                    'lead_id', NEW.id,
                    'lead_name', NEW.name,
                    'vendedor', NEW.vendedor,
                    'old_status', OLD.status,
                    'new_status', NEW.status
                )
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger for Status Changes
DROP TRIGGER IF EXISTS on_lead_status_change ON jalves_leads;
CREATE TRIGGER on_lead_status_change
    AFTER UPDATE ON jalves_leads
    FOR EACH ROW
    EXECUTE FUNCTION handle_lead_status_change();
