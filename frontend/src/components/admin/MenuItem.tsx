import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const MenuItemsPage = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { toast } = useToast();

  let restaurantId = JSON.parse(localStorage.getItem('admin_user')).id

  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    ingredients: '',
    // servesPeople: '',
    spiceLevel: '',
    allergens: '',
    // imageUrl: '',
    isAvailable: true,
  });

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getMenus(restaurantId, 1, 50);
      setMenuItems(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load menu items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      const categoriesData = await apiService.getCategories();
      
      // Handle different response formats
      let categoriesArray: any[] = [];
      if (categoriesData && typeof categoriesData === 'object' && 'data' in categoriesData) {
        categoriesArray = (categoriesData as any).data || [];
      } else if (categoriesData && Array.isArray(categoriesData)) {
        categoriesArray = categoriesData;
      } else {
        console.warn('Unexpected categories data format:', categoriesData);
        categoriesArray = [];
      }
      
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
      setCategories([]);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadMenuItems();
    loadCategories();
  }, []);

  const handleCreateMenuItem = async () => {
    try {
      // Validate required fields
      if (!newMenuItem.name || !newMenuItem.price || !newMenuItem.categoryId) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields (Name, Price, Category)',
          variant: 'destructive',
        });
        return;
      }

      const menuItemData = {
        restaurantId: restaurantId,
        categoryId: parseInt(newMenuItem.categoryId),
        name: newMenuItem.name,
        description: newMenuItem.description,
        price: parseFloat(newMenuItem.price),
        imageUrl: '', // You can add image upload functionality later
        isAvailable: newMenuItem.isAvailable,
        ingredients: newMenuItem.ingredients,
        spiceLevel: newMenuItem.spiceLevel,
        allergens: newMenuItem.allergens,
      };

      const response = await apiService.createMenuItem(menuItemData);
      
      toast({
        title: 'Success',
        description: 'Menu item created successfully',
      });
      
      setIsCreateDialogOpen(false);
      setNewMenuItem({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        ingredients: '',
        spiceLevel: '',
        allergens: '',
        isAvailable: true,
      });
      loadMenuItems();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create item',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAvailability = async (id: number) => {
    try {
      const item = menuItems.find(item => item.id === id);
      const updatedItem = { isAvailable: !item.isAvailable };
      await apiService.updateMenuItem(id, updatedItem);
      toast({
        title: 'Success',
        description: 'Availability updated successfully',
      });
      loadMenuItems();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive',
      });
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      categoryId: item.categoryId?.toString() || '',
      ingredients: item.ingredients || '',
      spiceLevel: item.spiceLevel || '',
      allergens: item.allergens || '',
      isAvailable: item.isAvailable,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateMenuItem = async () => {
    try {
      if (!editingItem.name || !editingItem.price || !editingItem.categoryId) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      const updateData = {
        name: editingItem.name,
        description: editingItem.description,
        price: parseFloat(editingItem.price),
        categoryId: parseInt(editingItem.categoryId),
        ingredients: editingItem.ingredients,
        spiceLevel: editingItem.spiceLevel,
        allergens: editingItem.allergens,
        isAvailable: editingItem.isAvailable,
      };

      await apiService.updateMenuItem(editingItem.id, updateData);
      
      toast({
        title: 'Success',
        description: 'Menu item updated successfully',
      });
      
      setIsEditDialogOpen(false);
      setEditingItem(null);
      loadMenuItems();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update item',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      await apiService.deleteMenuItem(id);
      toast({
        title: 'Success',
        description: 'Menu item deleted successfully',
      });
      loadMenuItems();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete menu item',
        variant: 'destructive',
      });
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || item.categoryId?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Items</h1>
          <p className="text-muted-foreground">Manage your restaurant's menu items</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadMenuItems} disabled={isLoading} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary-glow">
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add Menu Item</DialogTitle>
                <DialogDescription>Fill in the details below to add a new item</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                                 <div className="space-y-2">
                   <Label htmlFor="name">Name *</Label>
                   <Input
                     id="name"
                     value={newMenuItem.name}
                     onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                     placeholder="Enter item name"
                     required
                   />
                 </div>
                
                                 <div className="space-y-2">
                   <Label htmlFor="categoryId">Category *</Label>
                   <Select
                     value={newMenuItem.categoryId}
                     onValueChange={(value) => setNewMenuItem(prev => ({ ...prev, categoryId: value }))}
                     disabled={isCategoriesLoading}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder={isCategoriesLoading ? "Loading categories..." : "Select a category"} />
                     </SelectTrigger>
                     <SelectContent>
                       {Array.isArray(categories) && categories.map((category) => (
                         <SelectItem key={category.id} value={category.id.toString()}>
                           {category.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>

                                 <div className="space-y-2">
                   <Label htmlFor="price">Price *</Label>
                   <Input
                     id="price"
                     type="number"
                     step="0.01"
                     min="0"
                     value={newMenuItem.price}
                     onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: e.target.value }))}
                     placeholder="0.00"
                     required
                   />
                 </div>

                <div className="space-y-2">
                  <Label htmlFor="spiceLevel">Spice Level</Label>
                  <Select
                    value={newMenuItem.spiceLevel}
                    onValueChange={(value) => setNewMenuItem(prev => ({ ...prev, spiceLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select spice level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="extra-hot">Extra Hot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newMenuItem.description}
                    onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="ingredients">Ingredients</Label>
                  <Textarea
                    id="ingredients"
                    value={newMenuItem.ingredients}
                    onChange={(e) => setNewMenuItem(prev => ({ ...prev, ingredients: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="allergens">Allergens</Label>
                  <Input
                    id="allergens"
                    value={newMenuItem.allergens}
                    onChange={(e) => setNewMenuItem(prev => ({ ...prev, allergens: e.target.value }))}
                    placeholder="e.g., Nuts, Dairy, Gluten"
                  />
                </div>

                <div className="flex items-center space-x-2 md:col-span-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={newMenuItem.isAvailable}
                    onChange={(e) => setNewMenuItem(prev => ({ ...prev, isAvailable: e.target.checked }))}
                  />
                  <Label htmlFor="isAvailable">Available</Label>
                </div>
              </div>
              <div className="flex justify-end pt-4 space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateMenuItem}>Save</Button>
              </div>
                         </DialogContent>
           </Dialog>

           {/* Edit Dialog */}
           <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
             <DialogContent className="max-w-3xl">
               <DialogHeader>
                 <DialogTitle>Edit Menu Item</DialogTitle>
                 <DialogDescription>Update the details below</DialogDescription>
               </DialogHeader>
               {editingItem && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                   <div className="space-y-2">
                     <Label htmlFor="edit-name">Name *</Label>
                     <Input
                       id="edit-name"
                       value={editingItem.name}
                       onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                       placeholder="Enter item name"
                       required
                     />
                   </div>
                   
                   <div className="space-y-2">
                     <Label htmlFor="edit-categoryId">Category *</Label>
                     <Select
                       value={editingItem.categoryId}
                       onValueChange={(value) => setEditingItem(prev => ({ ...prev, categoryId: value }))}
                       disabled={isCategoriesLoading}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder={isCategoriesLoading ? "Loading categories..." : "Select a category"} />
                       </SelectTrigger>
                       <SelectContent>
                         {Array.isArray(categories) && categories.map((category) => (
                           <SelectItem key={category.id} value={category.id.toString()}>
                             {category.name}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="edit-price">Price *</Label>
                     <Input
                       id="edit-price"
                       type="number"
                       step="0.01"
                       min="0"
                       value={editingItem.price}
                       onChange={(e) => setEditingItem(prev => ({ ...prev, price: e.target.value }))}
                       placeholder="0.00"
                       required
                     />
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="edit-spiceLevel">Spice Level</Label>
                     <Select
                       value={editingItem.spiceLevel}
                       onValueChange={(value) => setEditingItem(prev => ({ ...prev, spiceLevel: value }))}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select spice level" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="mild">Mild</SelectItem>
                         <SelectItem value="medium">Medium</SelectItem>
                         <SelectItem value="hot">Hot</SelectItem>
                         <SelectItem value="extra-hot">Extra Hot</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2 md:col-span-2">
                     <Label htmlFor="edit-description">Description</Label>
                     <Textarea
                       id="edit-description"
                       value={editingItem.description}
                       onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                     />
                   </div>

                   <div className="space-y-2 md:col-span-2">
                     <Label htmlFor="edit-ingredients">Ingredients</Label>
                     <Textarea
                       id="edit-ingredients"
                       value={editingItem.ingredients}
                       onChange={(e) => setEditingItem(prev => ({ ...prev, ingredients: e.target.value }))}
                     />
                   </div>

                   <div className="space-y-2 md:col-span-2">
                     <Label htmlFor="edit-allergens">Allergens</Label>
                     <Input
                       id="edit-allergens"
                       value={editingItem.allergens}
                       onChange={(e) => setEditingItem(prev => ({ ...prev, allergens: e.target.value }))}
                       placeholder="e.g., Nuts, Dairy, Gluten"
                     />
                   </div>

                   <div className="flex items-center space-x-2 md:col-span-2">
                     <input
                       type="checkbox"
                       id="edit-isAvailable"
                       checked={editingItem.isAvailable}
                       onChange={(e) => setEditingItem(prev => ({ ...prev, isAvailable: e.target.checked }))}
                     />
                     <Label htmlFor="edit-isAvailable">Available</Label>
                   </div>
                 </div>
               )}
               <div className="flex justify-end pt-4 space-x-2">
                 <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                   Cancel
                 </Button>
                 <Button onClick={handleUpdateMenuItem}>Update</Button>
               </div>
             </DialogContent>
           </Dialog>
         </div>
       </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
                 <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isCategoriesLoading}>
           <SelectTrigger className="w-[200px]">
             <SelectValue placeholder={isCategoriesLoading ? "Loading categories..." : "Filter by category"} />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">All Categories</SelectItem>
             {Array.isArray(categories) && categories.map((category) => (
               <SelectItem key={category.id} value={category.id.toString()}>
                 {category.name}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" /> Filter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>{filteredMenuItems.length} items found</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading menu items...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Spice</TableHead>
                  <TableHead>Serves</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenuItems.map((item) => {
                  const category = Array.isArray(categories) ? categories.find(cat => cat.id === item.categoryId) : null;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {category?.name || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      <TableCell>${item.price}</TableCell>
                      <TableCell>{item.spiceLevel}</TableCell>
                      <TableCell>{item.servesPeople}</TableCell>
                      <TableCell>
                        <Badge variant={item.isAvailable ? 'default' : 'destructive'}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                                                     <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => alert(JSON.stringify(item, null, 2))}>
                               <Eye className="w-4 h-4 mr-2" /> View
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleEditItem(item)}>
                               <Edit className="w-4 h-4 mr-2" /> Edit
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleToggleAvailability(item.id)}>
                               <RefreshCw className="w-4 h-4 mr-2" /> Toggle Availability
                             </DropdownMenuItem>
                             <DropdownMenuItem 
                               onClick={() => handleDeleteItem(item.id)}
                               className="text-destructive focus:text-destructive"
                             >
                               <Trash2 className="w-4 h-4 mr-2" /> Delete
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuItemsPage;