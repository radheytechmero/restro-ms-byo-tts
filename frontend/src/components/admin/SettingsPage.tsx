/**
 * Premium Settings Page
 * System configuration and admin settings
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ThemeDemo } from '@/components/ui/theme-demo';
import { 
  Settings as SettingsIcon,
  Shield,
  Bell,
  Mail,
  Database,
  Save,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const [restaurant, setRestaurant] = useState({
    id: null,
    name: null,
    location: null,
    phone: null,
    mid: null,
    token: null,
    email: null,
    opening_hours: null,
    active: true,
    status: "active"
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getRestaurantById();
      console.log('Restaurant data:', response);
      
      if (response && response.restaurant) {
        setRestaurant(prev => ({ ...prev, ...response.restaurant }));
      } else if (response && response.data) {
        setRestaurant(prev => ({ ...prev, ...response.data }));
      } else if (response) {
        setRestaurant(prev => ({ ...prev, ...response }));
      }
    } catch (error) {
      console.error('Error loading restaurant settings:', error);
      toast({
        title: "Error",
        description: "Failed to load restaurant settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      if (!restaurant.id) {
        toast({
          title: "Error",
          description: "Restaurant ID not found. Please reload the page.",
          variant: "destructive",
        });
        return;
      }

      await apiService.updateRestaurant(restaurant.id, restaurant);
      
      toast({
        title: "Restaurant Settings Saved",
        description: "Your restaurant settings have been successfully updated",
      });
    } catch (error) {
      console.error('Error saving restaurant settings:', error);
      toast({
        title: "Error",
        description: "Failed to save restaurant settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (key: string, value: string | number | boolean) => {
    setRestaurant(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your application settings</p>
        </div>
        
        <Button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-gradient-to-r from-primary to-primary-glow"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5" />
              <span>General Settings</span>
            </CardTitle>
            <CardDescription>
              Basic application configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Restaurant Name</Label>
              <Input
                id="restaurantName"
                type="text"
                value={restaurant.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Restaurant Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restaurantEmail">Restaurant Email</Label>
              <Input
                id="restaurantEmail"
                type="email"
                value={restaurant.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="restaurant@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restaurantPhone">Phone Number</Label>
              <Input
                id="restaurantPhone"
                type="tel"
                value={restaurant.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Phone Number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restaurantLocation">Location</Label>
              <Input
                id="restaurantLocation"
                type="text"
                value={restaurant.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Restaurant Address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="openingHours">Opening Hours</Label>
              <Input
                id="openingHours"
                type="text"
                value={restaurant.opening_hours || ''}
                onChange={(e) => handleInputChange('opening_hours', e.target.value)}
                placeholder="e.g., 10:00-22:00"
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Restaurant Active</Label>
                <p className="text-sm text-muted-foreground">Enable/disable restaurant operations</p>
              </div>
              <Switch
                checked={restaurant.active || false}
                onCheckedChange={(checked) => handleInputChange('active', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Restaurant Configuration</span>
            </CardTitle>
            <CardDescription>
              Advanced restaurant settings and API configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="merchantId">Merchant ID</Label>
              <Input
                id="merchantId"
                type="text"
                value={restaurant.mid || ''}
                onChange={(e) => handleInputChange('mid', e.target.value)}
                placeholder="Merchant ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiToken">API Token</Label>
              <Input
                id="apiToken"
                type="password"
                value={restaurant.token || ''}
                onChange={(e) => handleInputChange('token', e.target.value)}
                placeholder="API Token"
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="restaurantStatus">Status</Label>
              <select
                id="restaurantStatus"
                value={restaurant.status || 'active'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div> */}
          </CardContent>
        </Card>

      </div>

    </div>
  );
};

export default SettingsPage;