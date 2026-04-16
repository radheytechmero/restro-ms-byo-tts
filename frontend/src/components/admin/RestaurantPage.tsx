import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, Plus, RefreshCw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

const RestaurantPage = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    active: true,
  });

  const loadRestaurants = async () => {
    try {
      setIsLoading(true);
      const data:any = await apiService.getRestaurants();
      const arr = Array.isArray(data) ? data : (data?.data ?? []);
      setRestaurants(arr);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load restaurants', variant: 'destructive' });
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.phone) {
      toast({ title: 'Validation', description: 'Name and phone are required', variant: 'destructive' });
      return;
    }
    try {
      await apiService.createRestaurant({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        description: form.description,
        active: form.active,
        password: '1234', // default password
        location:"test"
      });
      toast({ title: 'Success', description: 'Restaurant created' });
      setIsCreateOpen(false);
      setForm({ name: '', email: '', phone: '', address: '', description: '', active: true });
      loadRestaurants();
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to create restaurant', variant: 'destructive' });
    }
  };

  const startEdit = (r: any) => {
    setEditing({
      id: r.id,
      name: r.name || '',
      email: r.email || '',
      phone: r.phone || '',
      address: r.address || '',
      description: r.description || '',
      active: r.active !== undefined ? r.active : true,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editing?.id || !editing.name || !editing.phone) {
      toast({ title: 'Validation', description: 'Name and phone are required', variant: 'destructive' });
      return;
    }
    try {
      await apiService.updateRestaurant(editing.id, {
        name: editing.name,
        email: editing.email,
        phone: editing.phone,
        address: editing.address,
        description: editing.description,
        active: editing.active,
      });
      toast({ title: 'Success', description: 'Restaurant updated' });
      setIsEditOpen(false);
      setEditing(null);
      loadRestaurants();
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to update restaurant', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this restaurant?')) return;
    try {
      await apiService.deleteRestaurant(id);
      toast({ title: 'Deleted', description: 'Restaurant removed' });
      loadRestaurants();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const filtered = restaurants.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.phone || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Restaurants</h1>
          <p className="text-muted-foreground">Create, edit, and manage restaurants</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadRestaurants} disabled={isLoading} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary-glow">
                <Plus className="w-4 h-4 mr-2" /> Add Restaurant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Add Restaurant</DialogTitle>
                <DialogDescription>Enter details to create a restaurant</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="r-name">Name *</Label>
                  <Input id="r-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-email">Email</Label>
                  <Input id="r-email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-phone">Phone *</Label>
                  <Input id="r-phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="r-address">Address</Label>
                  <Textarea id="r-address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="r-desc">Description</Label>
                  <Textarea id="r-desc" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="r-active"
                      checked={form.active}
                      onCheckedChange={(checked) => setForm((p) => ({ ...p, active: checked }))}
                    />
                    <Label htmlFor="r-active">Active</Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4 space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Search by name, email, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restaurants</CardTitle>
          <CardDescription>{filtered.length} found</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading restaurants...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.email || '-'}</TableCell>
                    <TableCell>{r.phone || '-'}</TableCell>
                    <TableCell className="max-w-[320px] truncate">{r.address || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={r.active ? "default" : "secondary"}>
                        {r.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">⋯</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => alert(JSON.stringify(r, null, 2))}>
                            <Eye className="w-4 h-4 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => startEdit(r)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(r.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Restaurant</DialogTitle>
            <DialogDescription>Update details</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="e-name">Name *</Label>
                <Input id="e-name" value={editing.name} onChange={(e) => setEditing((p: any) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-email">Email</Label>
                <Input id="e-email" type="email" value={editing.email} onChange={(e) => setEditing((p: any) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-phone">Phone *</Label>
                <Input id="e-phone" value={editing.phone} onChange={(e) => setEditing((p: any) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="e-address">Address</Label>
                <Textarea id="e-address" value={editing.address} onChange={(e) => setEditing((p: any) => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="e-desc">Description</Label>
                <Textarea id="e-desc" value={editing.description} onChange={(e) => setEditing((p: any) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="e-active"
                    checked={editing.active}
                    onCheckedChange={(checked) => setEditing((p: any) => ({ ...p, active: checked }))}
                  />
                  <Label htmlFor="e-active">Active</Label>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end pt-4 space-x-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestaurantPage;


