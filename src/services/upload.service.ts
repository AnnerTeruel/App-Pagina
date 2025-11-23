import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadService = {
    async uploadFile(file: File, folder: string = 'images'): Promise<string> {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('uploads')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                throw error;
            }

            // Manually construct the public URL to ensure it's correct
            // Format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[file]
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${fileName}`;

            return publicUrl;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }
};
