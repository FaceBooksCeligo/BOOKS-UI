"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  Send
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";

export default function TaxReturnsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Please log in to access tax returns</p>
              <Button onClick={() => router.push('/auth/login')}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tax Returns & Filings</h1>
          <p className="text-gray-600">Manage and track your tax filings</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Return
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Returns</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Filed This Year</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Soon</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold">48</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Returns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tax Returns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sample data - would be replaced with actual API data */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <FileText className="h-10 w-10 text-gray-400" />
                <div>
                  <div className="font-medium">Q4 2024 Sales Tax Return</div>
                  <div className="text-sm text-gray-500">Due: January 31, 2025</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">Draft</Badge>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <FileText className="h-10 w-10 text-gray-400" />
                <div>
                  <div className="font-medium">Q3 2024 Sales Tax Return</div>
                  <div className="text-sm text-gray-500">Filed: October 28, 2024</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="default">Filed</Badge>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <FileText className="h-10 w-10 text-gray-400" />
                <div>
                  <div className="font-medium">Annual GST Return 2024</div>
                  <div className="text-sm text-gray-500">Due: March 31, 2025</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">Not Started</Badge>
                <Button variant="outline" size="sm">
                  Start
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <FileText className="h-10 w-10 text-gray-400" />
                <div>
                  <div className="font-medium">Q2 2024 VAT Return</div>
                  <div className="text-sm text-gray-500">Filed: July 25, 2024</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="default">Filed</Badge>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Upload className="h-12 w-12 text-blue-500 mx-auto" />
              <h3 className="font-semibold">Import Tax Data</h3>
              <p className="text-sm text-gray-600">Import tax data from external sources</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Calendar className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="font-semibold">Filing Calendar</h3>
              <p className="text-sm text-gray-600">View upcoming tax filing deadlines</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Send className="h-12 w-12 text-purple-500 mx-auto" />
              <h3 className="font-semibold">E-File Returns</h3>
              <p className="text-sm text-gray-600">Submit returns electronically</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
