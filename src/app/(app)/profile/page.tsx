"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { User, Mail, Building, Shield, Calendar, Edit } from "lucide-react";

export default function ProfilePage() {
  const { user, setAuth, orgId, token } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
  });

  useEffect(() => {
    if (user) {
      const nameParts = [user.firstName || "", user.lastName || ""]; 
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update user profile via API
      const response = await api.put("/v1/users/me", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });

      if (response.success) {
        // Update local auth state
        setAuth({ token: token || "", user: { ...user, firstName: formData.firstName, lastName: formData.lastName, email: formData.email } as any, orgId: orgId || undefined });
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const nameParts = [user?.firstName || "", user?.lastName || ""];
    setFormData({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your account status and security information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email Verified</span>
              <Badge variant={(user as any)?.emailVerified ? "default" : "destructive"}>
                {(user as any)?.emailVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">User ID</span>
              <span className="text-sm text-muted-foreground font-mono">
                {(user as any)._id}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Organization ID</span>
              <span className="text-sm text-muted-foreground font-mono">
                {orgId}
              </span>
            </div>
            <Separator />
            <div className="space-y-2">
              <span className="text-sm font-medium">Role</span>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary">{user.role || 'USER'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Organization Information
            </CardTitle>
            <CardDescription>
              Details about your current organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <div className="text-sm text-muted-foreground">
                  Loading organization details...
                </div>
              </div>
              <div className="space-y-2">
                <Label>Organization Code</Label>
                <div className="text-sm text-muted-foreground">
                  Loading organization details...
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
