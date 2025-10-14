"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Calendar, DollarSign, Users, Settings, Save, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Customer {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [formData, setFormData] = useState({
    // Basic Information
    projectNumber: "",
    name: "",
    description: "",
    type: "TIME_AND_MATERIALS",
    status: "NOT_STARTED",
    priority: "MEDIUM",
    
    // Customer & Billing
    customerId: "",
    billingMethod: "TIME_AND_MATERIALS",
    contractValue: "",
    
    // Dates
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    // Project Management
    projectManagerId: "",
    departmentId: "",
    
    // Budget
    budget: {
      totalBudget: "",
      laborBudget: "",
      materialsBudget: "",
      expensesBudget: "",
      contingency: ""
    },
    
    // Time Tracking
    timeTracking: {
      estimatedHours: ""
    },
    
    // Settings
    settings: {
      allowTimeEntry: true,
      allowExpenses: true,
      requireApproval: false,
      emailNotifications: true,
      trackInventory: false,
      useProjectTasks: true
    }
  });

  useEffect(() => {
    loadData();
    generateProjectNumber();
  }, []);

  const loadData = async () => {
    try {
      const [customersRes, usersRes] = await Promise.all([
        api.get<Customer[]>("/v1/contacts", { 'filter[type]': 'CUSTOMER', 'filter[status]': 'ACTIVE' }),
        api.get<User[]>("/v1/users")
      ]);

      if (customersRes.success && customersRes.data) {
        setCustomers(customersRes.data as Customer[]);
      }
      
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data as User[]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    }
  };

  const generateProjectNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    setFormData(prev => ({
      ...prev,
      projectNumber: `PRJ-${timestamp}`
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.customerId || !formData.projectManagerId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        contractValue: formData.contractValue ? parseFloat(formData.contractValue) : undefined,
        budget: {
          totalBudget: formData.budget.totalBudget ? {
            txn: parseFloat(formData.budget.totalBudget),
            base: parseFloat(formData.budget.totalBudget)
          } : undefined,
          laborBudget: formData.budget.laborBudget ? {
            txn: parseFloat(formData.budget.laborBudget),
            base: parseFloat(formData.budget.laborBudget)
          } : undefined,
          materialsBudget: formData.budget.materialsBudget ? {
            txn: parseFloat(formData.budget.materialsBudget),
            base: parseFloat(formData.budget.materialsBudget)
          } : undefined,
          expensesBudget: formData.budget.expensesBudget ? {
            txn: parseFloat(formData.budget.expensesBudget),
            base: parseFloat(formData.budget.expensesBudget)
          } : undefined,
          contingency: formData.budget.contingency ? {
            txn: parseFloat(formData.budget.contingency),
            base: parseFloat(formData.budget.contingency)
          } : undefined
        },
        timeTracking: {
          estimatedHours: formData.timeTracking.estimatedHours ? 
            parseFloat(formData.timeTracking.estimatedHours) : undefined
        }
      };

      const response = await api.post("/v1/projects", dataToSubmit);
      
      if (response.success) {
        toast.success("Project created successfully");
        router.push("/projects");
      } else {
        toast.error("Failed to create project");
      }
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast.error(error.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/projects")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
            <p className="text-muted-foreground">
              Create a new project and define its parameters
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the basic details for this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectNumber">Project Number *</Label>
                    <Input
                      id="projectNumber"
                      value={formData.projectNumber}
                      onChange={(e) => setFormData({...formData, projectNumber: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Project Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({...formData, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIXED_PRICE">Fixed Price</SelectItem>
                        <SelectItem value="TIME_AND_MATERIALS">Time & Materials</SelectItem>
                        <SelectItem value="COST_PLUS">Cost Plus</SelectItem>
                        <SelectItem value="MILESTONE">Milestone</SelectItem>
                        <SelectItem value="INTERNAL">Internal</SelectItem>
                        <SelectItem value="CAPITAL">Capital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({...formData, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({...formData, priority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer & Billing</CardTitle>
                <CardDescription>
                  Select the customer and billing method for this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerId">Customer *</Label>
                    <Select
                      value={formData.customerId}
                      onValueChange={(value) => setFormData({...formData, customerId: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer._id} value={customer._id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectManagerId">Project Manager *</Label>
                    <Select
                      value={formData.projectManagerId}
                      onValueChange={(value) => setFormData({...formData, projectManagerId: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billingMethod">Billing Method</Label>
                    <Select
                      value={formData.billingMethod}
                      onValueChange={(value) => setFormData({...formData, billingMethod: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIXED_FEE">Fixed Fee</SelectItem>
                        <SelectItem value="HOURLY">Hourly</SelectItem>
                        <SelectItem value="MILESTONE">Milestone</SelectItem>
                        <SelectItem value="PERCENT_COMPLETE">Percent Complete</SelectItem>
                        <SelectItem value="COST_PLUS">Cost Plus</SelectItem>
                        <SelectItem value="TIME_AND_MATERIALS">Time & Materials</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractValue">Contract Value</Label>
                    <Input
                      id="contractValue"
                      type="number"
                      step="0.01"
                      value={formData.contractValue}
                      onChange={(e) => setFormData({...formData, contractValue: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Budget</CardTitle>
                <CardDescription>
                  Define the budget allocation for this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalBudget">Total Budget</Label>
                    <Input
                      id="totalBudget"
                      type="number"
                      step="0.01"
                      value={formData.budget.totalBudget}
                      onChange={(e) => setFormData({
                        ...formData,
                        budget: {...formData.budget, totalBudget: e.target.value}
                      })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="laborBudget">Labor Budget</Label>
                    <Input
                      id="laborBudget"
                      type="number"
                      step="0.01"
                      value={formData.budget.laborBudget}
                      onChange={(e) => setFormData({
                        ...formData,
                        budget: {...formData.budget, laborBudget: e.target.value}
                      })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="materialsBudget">Materials Budget</Label>
                    <Input
                      id="materialsBudget"
                      type="number"
                      step="0.01"
                      value={formData.budget.materialsBudget}
                      onChange={(e) => setFormData({
                        ...formData,
                        budget: {...formData.budget, materialsBudget: e.target.value}
                      })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expensesBudget">Expenses Budget</Label>
                    <Input
                      id="expensesBudget"
                      type="number"
                      step="0.01"
                      value={formData.budget.expensesBudget}
                      onChange={(e) => setFormData({
                        ...formData,
                        budget: {...formData.budget, expensesBudget: e.target.value}
                      })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contingency">Contingency</Label>
                    <Input
                      id="contingency"
                      type="number"
                      step="0.01"
                      value={formData.budget.contingency}
                      onChange={(e) => setFormData({
                        ...formData,
                        budget: {...formData.budget, contingency: e.target.value}
                      })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Schedule</CardTitle>
                <CardDescription>
                  Set the timeline and milestones for this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    step="0.5"
                    value={formData.timeTracking.estimatedHours}
                    onChange={(e) => setFormData({
                      ...formData,
                      timeTracking: {...formData.timeTracking, estimatedHours: e.target.value}
                    })}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>
                  Configure project features and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Time Entry</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow team members to log time against this project
                      </p>
                    </div>
                    <Switch
                      checked={formData.settings.allowTimeEntry}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        settings: {...formData.settings, allowTimeEntry: checked}
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Expenses</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow expense tracking for this project
                      </p>
                    </div>
                    <Switch
                      checked={formData.settings.allowExpenses}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        settings: {...formData.settings, allowExpenses: checked}
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        Require approval for time entries and expenses
                      </p>
                    </div>
                    <Switch
                      checked={formData.settings.requireApproval}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        settings: {...formData.settings, requireApproval: checked}
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send email updates for project activities
                      </p>
                    </div>
                    <Switch
                      checked={formData.settings.emailNotifications}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        settings: {...formData.settings, emailNotifications: checked}
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Use Project Tasks</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable task management for this project
                      </p>
                    </div>
                    <Switch
                      checked={formData.settings.useProjectTasks}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        settings: {...formData.settings, useProjectTasks: checked}
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/projects")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>Creating...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Project
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
