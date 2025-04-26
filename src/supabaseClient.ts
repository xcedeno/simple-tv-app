// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://prxzjevldfpjwscwuarx.supabase.co'; // Reemplaza con tu URL de Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeHpqZXZsZGZwandzY3d1YXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MTkwOTcsImV4cCI6MjA2MTE5NTA5N30.Q5-tam2XO055t8Vmf9YPG5kzglthR11ikp0rvdjhzuE'; // Reemplaza con tu API Key

export const supabase = createClient(supabaseUrl, supabaseKey);

export const checkSupabaseConnection = async () => {
try {
    const { error } = await supabase.from('accounts').select('*').limit(1); // Intenta obtener 1 registro
    if (error) {
    throw new Error(error.message);
    }
    return { connected: true, message: 'Conexión exitosa.' };
} catch (error) {
    return { connected: false, message: error instanceof Error ? error.message : 'Error desconocido.' };
}
};