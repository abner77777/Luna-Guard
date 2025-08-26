-- Create vehicle_events table for logging security and vehicle events
CREATE TABLE public.vehicle_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vehicle_id UUID,
  event_type TEXT NOT NULL,
  event_message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  category TEXT NOT NULL DEFAULT 'system',
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add check constraints for valid values
ALTER TABLE public.vehicle_events 
ADD CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high'));

ALTER TABLE public.vehicle_events 
ADD CONSTRAINT valid_category CHECK (category IN ('security', 'vehicle', 'system'));

ALTER TABLE public.vehicle_events 
ADD CONSTRAINT valid_event_type CHECK (event_type IN (
  'vehicle_locked', 
  'vehicle_unlocked', 
  'engine_connected', 
  'engine_disconnected', 
  'panic_button_activated', 
  'panic_button_deactivated',
  'system_connected',
  'system_disconnected',
  'unauthorized_access_attempt'
));

-- Enable Row Level Security
ALTER TABLE public.vehicle_events ENABLE ROW LEVEL SECURITY;

-- Create policies for vehicle_events
CREATE POLICY "Users can view their own vehicle events" 
ON public.vehicle_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicle events" 
ON public.vehicle_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all vehicle events" 
ON public.vehicle_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_vehicle_events_updated_at
BEFORE UPDATE ON public.vehicle_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key reference to vehicles table (optional, can be null for system events)
ALTER TABLE public.vehicle_events 
ADD CONSTRAINT fk_vehicle_events_vehicle_id 
FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_vehicle_events_user_id ON public.vehicle_events(user_id);
CREATE INDEX idx_vehicle_events_created_at ON public.vehicle_events(created_at DESC);
CREATE INDEX idx_vehicle_events_type ON public.vehicle_events(event_type);

-- Create function to log vehicle events
CREATE OR REPLACE FUNCTION public.log_vehicle_event(
  p_user_id UUID,
  p_vehicle_id UUID DEFAULT NULL,
  p_event_type TEXT,
  p_event_message TEXT,
  p_severity TEXT DEFAULT 'low',
  p_category TEXT DEFAULT 'system',
  p_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.vehicle_events (
    user_id, 
    vehicle_id, 
    event_type, 
    event_message, 
    severity, 
    category, 
    data
  )
  VALUES (
    p_user_id, 
    p_vehicle_id, 
    p_event_type, 
    p_event_message, 
    p_severity, 
    p_category, 
    p_data
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Insert some sample events for demo purposes
INSERT INTO public.vehicle_events (user_id, event_type, event_message, severity, category, data)
SELECT 
  p.user_id,
  'vehicle_locked',
  'Vehículo bloqueado exitosamente',
  'low',
  'security',
  '{"action": "lock", "method": "remote"}'::jsonb
FROM public.profiles p 
WHERE p.role = 'user'
LIMIT 1;

INSERT INTO public.vehicle_events (user_id, event_type, event_message, severity, category, data)
SELECT 
  p.user_id,
  'engine_disconnected',
  'Motor desconectado por usuario',
  'medium',
  'vehicle',
  '{"action": "disconnect", "reason": "user_request"}'::jsonb
FROM public.profiles p 
WHERE p.role = 'user'
LIMIT 1;

INSERT INTO public.vehicle_events (user_id, event_type, event_message, severity, category, data)
SELECT 
  p.user_id,
  'system_connected',
  'Conexión restablecida',
  'low',
  'system',
  '{"connection": "restored", "signal_strength": 4}'::jsonb
FROM public.profiles p 
WHERE p.role = 'user'
LIMIT 1;

INSERT INTO public.vehicle_events (user_id, event_type, event_message, severity, category, data)
SELECT 
  p.user_id,
  'unauthorized_access_attempt',
  'Intento de acceso no autorizado detectado',
  'high',
  'security',
  '{"ip": "192.168.1.100", "attempts": 3}'::jsonb
FROM public.profiles p 
WHERE p.role = 'user'
LIMIT 1;