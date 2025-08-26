import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role?: 'user' | 'admin';
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== FUNCTION START V2 ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', { 
      hasUrl: !!supabaseUrl, 
      hasServiceKey: !!supabaseServiceKey 
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const body = await req.json();
    console.log('Request body:', body);
    
    const { email, password = 'TempPassword123!', first_name = '', last_name = '', role = 'user' }: CreateUserRequest = body;

    console.log('Creating user with bypassed email verification:', { email, role });

    // Create user with bypassed email verification
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // This bypasses email verification
      user_metadata: {
        first_name,
        last_name,
        role
      }
    });

    if (userError) {
      console.error('Error creating user:', userError);
      return new Response(
        JSON.stringify({ error: userError.message }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('User created successfully:', userData.user?.id);

    // The profile should be created automatically by the trigger
    // Let's verify it was created
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', userData.user!.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      // If profile doesn't exist, create it manually
      const { error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userData.user!.id,
          email: userData.user!.email!,
          first_name,
          last_name,
          role
        });

      if (createProfileError) {
        console.error('Error creating profile manually:', createProfileError);
      }
    }

    const response = {
      success: true,
      user: {
        id: userData.user!.id,
        email: userData.user!.email,
        created_at: userData.user!.created_at
      },
      message: 'Usuario creado exitosamente sin verificación de email'
    };

    console.log('Sending response:', response);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in create-user-bypass-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);