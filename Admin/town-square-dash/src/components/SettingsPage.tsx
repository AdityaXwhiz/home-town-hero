// In src/components/SettingsPage.tsx
// ✅ THIS FILE IS ALREADY CORRECT. No changes were needed.
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const SettingsPage = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Change the look and feel of your dashboard to your preference.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
              <Sun />
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onCheckedChange={(isChecked) => setTheme(isChecked ? 'dark' : 'light')}
              />
              <Moon />
              <Label htmlFor="theme-toggle" className="font-semibold">
                {theme === 'dark' ? "Dark Mode" : "Light Mode"}
              </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};