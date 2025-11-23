'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { contentService } from '@/services/content.service';
import { uploadService } from '@/services/upload.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

export default function AdminContentPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hero Content State
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [heroCtaText, setHeroCtaText] = useState('Explorar Tienda');
  const [heroCtaLink, setHeroCtaLink] = useState('/shop');

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const isAdmin = (currentUser?.role && currentUser.role.trim().toLowerCase() === 'admin') || currentUser?.isAdmin;
      if (!isAdmin) {
        // router.push('/');
        return;
      }
      
      try {
        const block = await contentService.getContentBlock('hero_home');
        if (block && block.content) {
          setHeroTitle(block.content.title || '');
          setHeroSubtitle(block.content.subtitle || '');
          setHeroImage(block.content.image || '');
          setHeroCtaText(block.content.ctaText || 'Explorar Tienda');
          setHeroCtaLink(block.content.ctaLink || '/shop');
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        toast.error('Error al cargar contenido');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      checkAuthAndFetch();
    }
  }, [currentUser]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await contentService.updateContentBlock('hero_home', {
        title: heroTitle,
        subtitle: heroSubtitle,
        image: heroImage,
        ctaText: heroCtaText,
        ctaLink: heroCtaLink
      });
      toast.success('Contenido actualizado correctamente');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Error al guardar contenido');
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = (currentUser?.role && currentUser.role.trim().toLowerCase() === 'admin') || currentUser?.isAdmin;

  if (!isAdmin) {
    return <div className="p-8 text-center">Acceso Denegado</div>;
  }

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Contenido</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar Cambios
        </Button>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Banner Principal (Hero Section)</CardTitle>
            <CardDescription>Personaliza el texto e imagen principal de la página de inicio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Título Principal</Label>
              <Input 
                value={heroTitle} 
                onChange={(e) => setHeroTitle(e.target.value)} 
                placeholder="Ej: Tu Estilo, Tu Diseño"
              />
              <p className="text-xs text-muted-foreground">Se recomienda un título corto y llamativo.</p>
            </div>

            <div className="space-y-2">
              <Label>Subtítulo / Descripción</Label>
              <Textarea 
                value={heroSubtitle} 
                onChange={(e) => setHeroSubtitle(e.target.value)} 
                placeholder="Ej: Personaliza ropa y accesorios..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Imagen de Fondo</Label>
              <div className="flex gap-4 items-center">
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                    if (!e.target.files || e.target.files.length === 0) return;
                    const file = e.target.files[0];
                    try {
                      setSaving(true);
                      const url = await uploadService.uploadFile(file, 'hero');
                      setHeroImage(url);
                      toast.success('Imagen subida correctamente');
                    } catch (error) {
                      console.error('Error uploading file:', error);
                      toast.error('Error al subir imagen');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                />
              </div>
              {heroImage && (
                <div className="mt-4 relative h-48 w-full rounded-lg overflow-hidden bg-muted">
                  <img src={heroImage} alt="Preview" className="object-cover w-full h-full" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Texto del Botón</Label>
                <Input 
                  value={heroCtaText} 
                  onChange={(e) => setHeroCtaText(e.target.value)} 
                  placeholder="Ej: Explorar Tienda" 
                />
              </div>
              <div className="space-y-2">
                <Label>Enlace del Botón</Label>
                <Input 
                  value={heroCtaLink} 
                  onChange={(e) => setHeroCtaLink(e.target.value)} 
                  placeholder="Ej: /shop" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
