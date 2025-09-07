"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Settings, User, Bell, Shield, Globe, Palette } from "lucide-react";

export default function SettingsPage() {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // User preferences
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
    language: "en",
    
    // Notification preferences
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    
    // Security settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    
    // Display preferences
    theme: "system",
    compactMode: false,
  });

  const [organizations, setOrganizations] = useState([]);
  const { orgId } = useAuthStore();
  const [currentOrg, setCurrentOrg] = useState(orgId || "");

  useEffect(() => {
    loadUserSettings();
    loadOrganizations();
  }, []);

  const loadUserSettings = async () => {
    try {
      const response = await api.get("/v1/users/me/settings");
      if (response.success) {
        setSettings({ ...settings, ...response.data });
      }
    } catch (error) {
      console.error("Failed to load user settings:", error);
    }
  };

  const loadOrganizations = async () => {
    try {
      console.log("Loading organizations in settings...");
      const response = await api.get("/v1/organizations");
      console.log("Organizations response in settings:", response);
      
      if (response.success) {
        // Transform the data to ensure consistent ID field
        const transformedOrgs = response.data.map((org: any) => ({
          ...org,
          id: org._id || org.id
        }));
        console.log("Transformed organizations in settings:", transformedOrgs);
        setOrganizations(transformedOrgs);
      }
    } catch (error) {
      console.error("Failed to load organizations:", error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const response = await api.put("/v1/users/me/settings", settings);
      if (response.success) {
        toast.success("Settings saved successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleOrgSwitch = async (orgId: string) => {
    setLoading(true);
    try {
      // For now, just update the local state since the API endpoint doesn't exist
      const newOrg = organizations.find(org => org.id === orgId);
      if (newOrg) {
        setCurrentOrg(orgId);
        setAuth({
          ...user,
          orgId: orgId,
        });
        toast.success("Organization switched successfully!");
        // Reload the page to update all data
        window.location.reload();
      } else {
        toast.error("Organization not found");
      }
    } catch (error: any) {
      console.error("Error switching organization:", error);
      toast.error("Failed to switch organization");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // This would typically open a modal or redirect to a password change page
    toast("Password change functionality coming soon!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Organization Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Organization
            </CardTitle>
            <CardDescription>
              Switch between organizations and manage organization settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Current Organization</Label>
              <Select
                value={currentOrg}
                onValueChange={handleOrgSwitch}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org: any) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name} ({org.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Switching organizations will reload the application with the new organization's data.
            </div>
          </CardContent>
        </Card>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              General
            </CardTitle>
            <CardDescription>
              Your general preferences and display settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) =>
                    setSettings({ ...settings, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  value={settings.dateFormat}
                  onValueChange={(value) =>
                    setSettings({ ...settings, dateFormat: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select
                  value={settings.currency}
                  onValueChange={(value) =>
                    setSettings({ ...settings, currency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) =>
                    setSettings({ ...settings, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Receive important updates via email
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Receive notifications in your browser
                </div>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, pushNotifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <div className="text-sm text-muted-foreground">
                  Receive product updates and marketing content
                </div>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, marketingEmails: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your security settings and authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <div className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </div>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, twoFactorAuth: checked })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    sessionTimeout: parseInt(e.target.value) || 30,
                  })
                }
                min="5"
                max="480"
              />
            </div>
            <Button variant="outline" onClick={handleChangePassword}>
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Display
            </CardTitle>
            <CardDescription>
              Customize the appearance of your interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) =>
                  setSettings({ ...settings, theme: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact Mode</Label>
                <div className="text-sm text-muted-foreground">
                  Use a more compact interface layout
                </div>
              </div>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, compactMode: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
