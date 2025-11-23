'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Category } from '@/types';
import { categoryService } from '@/services/category.service';
import { uploadService } from '@/services/upload.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Eye, EyeOff, Image as ImageIcon, Loader2, Upload } from 'lucide-react';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newImage, setNewImage] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategoriesAdmin();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const isAdmin = (currentUser?.role && currentUser.role.trim().toLowerCase() === 'admin') || currentUser?.isAdmin;
      if (!isAdmin) {
        // router.push('/');
        return;
      }
      fetchCategories();
    };

    if (currentUser) {
      checkAuthAndFetch();
    }
  }, [currentUser]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    try {
      setUploading(true);
      const url = await uploadService.uploadFile(file, 'categories');
      setNewImage(url);
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName || !newSlug) {
      toast.error('Nombre y Slug son obligatorios');
      return;
    }

    try {
      await categoryService.createCategory({
        name: newName,
        slug: newSlug.toLowerCase().replace(/\s+/g, '-'),
        image: newImage,
        is_active: true
      });
      
      toast.success('Categoría creada');
      setIsDialogOpen(false);
      setNewName('');
      setNewSlug('');
      setNewImage('');
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Error al crear categoría');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      await categoryService.deleteCategory(id);
      toast.success('Categoría eliminada');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error al eliminar categoría');
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await categoryService.updateCategory(category.id, { is_active: !category.is_active });
      toast.success(`Categoría ${category.is_active ? 'desactivada' : 'activada'}`);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Error al actualizar categoría');
    }
  };

  const isAdmin = (currentUser?.role && currentUser.role.trim().toLowerCase() === 'admin') || currentUser?.isAdmin;

  if (!isAdmin) {
    return <div className="p-8 text-center">Acceso Denegado</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Categorías</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Categoría</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input 
                  value={newName} 
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (!newSlug) {
                      setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  placeholder="Ej: Camisas" 
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input 
                  value={newSlug} 
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="ej: camisas-deportivas" 
                />
              </div>
              <div className="space-y-2">
                <Label>Imagen</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {newImage && (
                  <div className="mt-2 relative h-20 w-20 rounded overflow-hidden border">
                    <img src={newImage} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                )}
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={uploading}>
                {uploading ? 'Subiendo...' : 'Guardar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categorías Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="h-10 w-10 object-cover rounded" />
                      ) : (
                        <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {category.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleToggleActive(category)}>
                        {category.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No hay categorías creadas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
