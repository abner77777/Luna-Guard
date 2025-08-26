-- Fix the function search path issue
CREATE OR REPLACE FUNCTION public.create_sample_notification()
RETURNS VOID AS $$
DECLARE
    sample_user_id UUID;
BEGIN
    -- Get the first user (for demo purposes)
    SELECT user_id INTO sample_user_id FROM public.profiles LIMIT 1;
    
    -- Only create if we have a user
    IF sample_user_id IS NOT NULL THEN
        INSERT INTO public.push_notifications (user_id, title, message, type, data)
        VALUES (
            sample_user_id,
            'Bienvenido a Car-Guard',
            'Tu sistema de seguridad vehicular está completamente configurado y listo para usar.',
            'system',
            '{"welcome": true, "version": "1.0"}'
        );
        
        INSERT INTO public.push_notifications (user_id, title, message, type, data)
        VALUES (
            sample_user_id,
            'Vehículo conectado',
            'Tu vehículo se ha conectado exitosamente al sistema de monitoreo.',
            'vehicle',
            '{"status": "connected", "timestamp": "' || now() || '"}'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;