import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";
import { useTheme } from "@/hooks/useTheme";

export function ThemeDemo() {
  const { theme, isDark, isLight, isSystem } = useTheme();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Theme System Demo
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <ThemeToggleButton />
            </div>
          </CardTitle>
          <CardDescription>
            Current theme: <Badge variant="outline">{theme}</Badge>
            {isSystem && " (following system preference)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demo-input">Input Field</Label>
              <Input id="demo-input" placeholder="Type something..." />
            </div>
            <div className="space-y-2">
              <Label>Buttons</Label>
              <div className="flex space-x-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Light Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`h-20 rounded-lg ${isLight ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center`}>
                  {isLight ? '✓ Active' : 'Inactive'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Dark Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`h-20 rounded-lg ${isDark ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center`}>
                  {isDark ? '✓ Active' : 'Inactive'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">System Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`h-20 rounded-lg ${isSystem ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center`}>
                  {isSystem ? '✓ Active' : 'Inactive'}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 