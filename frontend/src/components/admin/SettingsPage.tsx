/**
 * Premium Settings Page
 * System configuration and admin settings
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ThemeDemo } from '@/components/ui/theme-demo';
import { 
  Settings as SettingsIcon,
  Shield,
  Bell,
  Mail,
  Database,
  Save,
  Trash2,
  AlertTriangle,
  Play,
  Square,
  Volume2
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const backgroundNoiseOptions = [
  {
    id: 'cafe-ambience',
    name: 'Cafe Ambiant',
    description: 'Light conversation bed for casual ordering calls.',
    preview: 'Cafe ambience',
    audioSrc: '/cafe-ambience.mp3'
  },
  {
    id: 'restaurant-ambience',
    name: 'Restaurant Ambiance',
    description: 'Soft table chatter and room tone for a natural dining-room feel.',
    preview: 'Restaurant ambience',
    audioSrc: '/restaurant-ambience.mp3'
  }
];

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
    status: "active",
    stt_model: 'deepgram',
    stt_deepgram_language: 'en',
    stt_deepgram_voice: 'aura',
    stt_elevenlabs_api_key: '',
    stt_elevenlabs_voice_id: '',
    stt_elevenlabs_model_id: '',
    stt_openai_base_url: '',
    stt_openai_api_key: '',
    stt_openai_model: 'tts-1',
    stt_openai_voice: 'alloy',
    background_noise_enabled: false,
    background_noise_type: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewingNoise, setPreviewingNoise] = useState<string | null>(null);
  const previewCleanupRef = useRef<(() => void) | null>(null);
  const { toast } = useToast();

  const stopNoisePreview = () => {
    previewCleanupRef.current?.();
    previewCleanupRef.current = null;
    setPreviewingNoise(null);
  };

  useEffect(() => {
    return () => {
      previewCleanupRef.current?.();
      previewCleanupRef.current = null;
    };
  }, []);

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
      const cleanedRestuarant = Object.fromEntries(
  Object.entries(restaurant).filter(([_, v]) => v != null)
);
      console.log('Saving restaurant settings:', cleanedRestuarant);     
      if (!restaurant.id) {
        toast({
          title: "Error",
          description: "Restaurant ID not found. Please reload the page.",
          variant: "destructive",
        });
        return;
      }

      await apiService.updateRestaurant(restaurant.id, cleanedRestuarant);
      
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

  const handleBackgroundNoiseToggle = (checked: boolean) => {
    setRestaurant(prev => ({
      ...prev,
      background_noise_enabled: checked,
      background_noise_type: checked ? prev.background_noise_type || backgroundNoiseOptions[0].id : ''
    }));

    if (!checked) {
      stopNoisePreview();
    }
  };

  const handleNoiseSelection = (noiseId: string) => {
    handleInputChange('background_noise_type', noiseId);
  };

  const playNoisePreview = (noiseId: string) => {
    if (previewingNoise === noiseId) {
      stopNoisePreview();
      return;
    }

    stopNoisePreview();

    try {
      const selectedNoise = backgroundNoiseOptions.find((noise) => noise.id === noiseId);

      if (!selectedNoise) {
        return;
      }

      const audio = new Audio(selectedNoise.audioSrc);
      audio.loop = true;
      audio.volume = 0.55;

      audio.play().catch((error) => {
        console.error('Error playing background noise preview:', error);
        stopNoisePreview();
        toast({
          title: "Preview unavailable",
          description: "Your browser blocked the audio preview. Please try again.",
          variant: "destructive",
        });
      });

      previewCleanupRef.current = () => {
        audio.pause();
        audio.currentTime = 0;
      };
      setPreviewingNoise(noiseId);
    } catch (error) {
      console.error('Error playing background noise preview:', error);
      toast({
        title: "Preview unavailable",
        description: "Your browser blocked the audio preview. Please try again.",
        variant: "destructive",
      });
    }
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
          disabled={isSaving || isLoading}
          className="bg-gradient-to-r from-primary to-primary-glow"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : isLoading ? 'Loading...' : 'Save Changes'}
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {!isLoading && (
        <>
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

      {/* AI Speech Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5" />
            <span>AI Speech Settings</span>
          </CardTitle>
          <CardDescription>
            Configure speech-to-text models and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>STT Model</Label>
            <select
              value={restaurant.stt_model || 'deepgram'}
              onChange={(e) => handleInputChange('stt_model', e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="deepgram">Deepgram</option>
              <option value="elevenlabs">Eleven Labs</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>

          {restaurant.stt_model === 'deepgram' && (
            <>
              <div className="space-y-2">
                <Label>Language</Label>
                <select
                  value={restaurant.stt_deepgram_language || 'en'}
                  onChange={(e) => handleInputChange('stt_deepgram_language', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="de">German</option>
                  <option value="fr">French</option>
                  <option value="nl">Dutch</option>
                  <option value="it">Italian</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Voice</Label>
                <select
                  value={restaurant.stt_deepgram_voice || 'aura'}
                  onChange={(e) => handleInputChange('stt_deepgram_voice', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="aura">Aura Default</option>
                  <option value="aura-bright">Aura Bright</option>
                  <option value="aura-warm">Aura Warm</option>
                  <option value="aura-clear">Aura Clear</option>
                  <option value="aura-deep">Aura Deep</option>
                </select>
              </div>
            </>
          )}

          {restaurant.stt_model === 'elevenlabs' && (
            <>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={restaurant.stt_elevenlabs_api_key || ''}
                  onChange={(e) => handleInputChange('stt_elevenlabs_api_key', e.target.value)}
                  placeholder="Eleven Labs API Key"
                />
              </div>
              <div className="space-y-2">
                <Label>Voice ID</Label>
                <Input
                  type="text"
                  value={restaurant.stt_elevenlabs_voice_id || ''}
                  onChange={(e) => handleInputChange('stt_elevenlabs_voice_id', e.target.value)}
                  placeholder="Voice ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="elevenlabsModelId">Model ID</Label>
                <Input
                  id="elevenlabsModelId"
                  type="text"
                  value={restaurant.stt_elevenlabs_model_id || ''}
                  onChange={(e) => handleInputChange('stt_elevenlabs_model_id', e.target.value)}
                  placeholder="e.g. eleven_turbo_v2_5"
                />
              </div>
            </>
          )}

          {restaurant.stt_model === 'openai' && (
            <>
              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input
                  type="text"
                  value={restaurant.stt_openai_base_url || ''}
                  onChange={(e) => handleInputChange('stt_openai_base_url', e.target.value)}
                  placeholder="https://api.openai.com/v1"
                />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={restaurant.stt_openai_api_key || ''}
                  onChange={(e) => handleInputChange('stt_openai_api_key', e.target.value)}
                  placeholder="OpenAI API Key"
                />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <select
                  value={restaurant.stt_openai_model || 'tts-1'}
                  onChange={(e) => handleInputChange('stt_openai_model', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="tts-1">TTS-1</option>
                  <option value="tts-1-hd">TTS-1-HD</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Voice</Label>
                <select
                  value={restaurant.stt_openai_voice || 'alloy'}
                  onChange={(e) => handleInputChange('stt_openai_voice', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="alloy">Alloy</option>
                  <option value="echo">Echo</option>
                  <option value="fable">Fable</option>
                  <option value="onyx">Onyx</option>
                  <option value="nova">Nova</option>
                  <option value="shimmer">Shimmer</option>
                </select>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label>Background Noise</Label>
                <p className="text-sm text-muted-foreground">Ask whether calls should include ambience behind the voice.</p>
              </div>
              <Switch
                checked={restaurant.background_noise_enabled || false}
                onCheckedChange={handleBackgroundNoiseToggle}
              />
            </div>

            {restaurant.background_noise_enabled && (
              <div className="grid gap-3 md:grid-cols-2">
                {backgroundNoiseOptions.map((noise) => {
                  const isSelected = restaurant.background_noise_type === noise.id;
                  const isPreviewing = previewingNoise === noise.id;

                  return (
                    <div
                      key={noise.id}
                      onClick={() => handleNoiseSelection(noise.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleNoiseSelection(noise.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={`rounded-md border p-4 text-left transition-colors hover:bg-accent ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border bg-background'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-primary" />
                            <span className="font-medium">{noise.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{noise.description}</p>
                        </div>
                        {isSelected && <Badge variant="default">Selected</Badge>}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <Badge variant="secondary">{noise.preview}</Badge>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            playNoisePreview(noise.id);
                          }}
                        >
                          {isPreviewing ? (
                            <>
                              <Square className="h-4 w-4" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              Preview
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
        </>
      )}

    </div>
  );
};

export default SettingsPage;
