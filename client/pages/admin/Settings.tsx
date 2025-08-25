import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  Building2,
  Users,
  DollarSign,
  Mail,
  Shield,
  Clock,
  Palette,
  Database,
  Bell,
  Globe,
  Save,
  RotateCcw,
} from "lucide-react";

interface SystemSettings {
  // Company Information
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  taxId: string;

  // Business Settings
  businessHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  timezone: string;
  currency: string;

  // Service Settings
  defaultServiceDuration: number;
  enableOnlineBooking: boolean;
  requireApprovalForOrders: boolean;
  autoAssignTechnicians: boolean;
  enableTimeTracking: boolean;

  // Pricing Settings
  defaultTaxRate: number;
  laborRate: number;
  enableDynamicPricing: boolean;
  discountThreshold: number;

  // Notification Settings
  emailNotifications: {
    newOrders: boolean;
    completedJobs: boolean;
    lowInventory: boolean;
    overdueJobs: boolean;
    customerReminders: boolean;
  };
  smsNotifications: {
    appointmentReminders: boolean;
    statusUpdates: boolean;
    promotions: boolean;
  };

  // System Settings
  enableAuditLog: boolean;
  dataRetentionDays: number;
  enableBackups: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  enableMaintenanceMode: boolean;

  // Integration Settings
  enablePaymentGateway: boolean;
  paymentProvider: string;
  enableInventorySync: boolean;
  enableAccountingSync: boolean;
}

const defaultSettings: SystemSettings = {
  companyName: "Professional Auto Service",
  companyAddress: "123 Main Street, City, State 12345",
  companyPhone: "+1 (555) 123-4567",
  companyEmail: "info@autoservice.com",
  companyWebsite: "www.autoservice.com",
  taxId: "12-3456789",

  businessHours: {
    monday: { open: "08:00", close: "18:00", closed: false },
    tuesday: { open: "08:00", close: "18:00", closed: false },
    wednesday: { open: "08:00", close: "18:00", closed: false },
    thursday: { open: "08:00", close: "18:00", closed: false },
    friday: { open: "08:00", close: "18:00", closed: false },
    saturday: { open: "09:00", close: "17:00", closed: false },
    sunday: { open: "10:00", close: "16:00", closed: true },
  },
  timezone: "America/New_York",
  currency: "USD",

  defaultServiceDuration: 60,
  enableOnlineBooking: true,
  requireApprovalForOrders: false,
  autoAssignTechnicians: true,
  enableTimeTracking: true,

  defaultTaxRate: 8.5,
  laborRate: 125.0,
  enableDynamicPricing: false,
  discountThreshold: 1000,

  emailNotifications: {
    newOrders: true,
    completedJobs: true,
    lowInventory: true,
    overdueJobs: true,
    customerReminders: true,
  },
  smsNotifications: {
    appointmentReminders: true,
    statusUpdates: false,
    promotions: false,
  },

  enableAuditLog: true,
  dataRetentionDays: 2555, // 7 years
  enableBackups: true,
  backupFrequency: "daily",
  enableMaintenanceMode: false,

  enablePaymentGateway: false,
  paymentProvider: "stripe",
  enableInventorySync: false,
  enableAccountingSync: false,
};

const dayNames = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const dayLabels = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Settings() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateSetting = (path: string, value: any) => {
    const keys = path.split(".");
    const newSettings = { ...settings };
    let current = newSettings as any;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setHasChanges(false);
    setIsSaving(false);

    // Show success message (you could use a toast here)
    alert("Settings saved successfully!");
  };

  const handleResetSettings = () => {
    if (
      confirm("Are you sure you want to reset all settings to default values?")
    ) {
      setSettings(defaultSettings);
      setHasChanges(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges || isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Company Information Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={settings.companyName}
                    onChange={(e) =>
                      updateSetting("companyName", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="tax-id">Tax ID</Label>
                  <Input
                    id="tax-id"
                    value={settings.taxId}
                    onChange={(e) => updateSetting("taxId", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company-address">Address</Label>
                <Textarea
                  id="company-address"
                  value={settings.companyAddress}
                  onChange={(e) =>
                    updateSetting("companyAddress", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input
                    id="company-phone"
                    value={settings.companyPhone}
                    onChange={(e) =>
                      updateSetting("companyPhone", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) =>
                      updateSetting("companyEmail", e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company-website">Website</Label>
                <Input
                  id="company-website"
                  value={settings.companyWebsite}
                  onChange={(e) =>
                    updateSetting("companyWebsite", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Settings Tab */}
        <TabsContent value="business">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dayNames.map((day, index) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-24">
                        <span className="font-medium">{dayLabels[index]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={
                            !settings.businessHours[
                              day as keyof typeof settings.businessHours
                            ].closed
                          }
                          onCheckedChange={(checked) =>
                            updateSetting(
                              `businessHours.${day}.closed`,
                              !checked,
                            )
                          }
                        />
                        <span className="text-sm">Open</span>
                      </div>
                      {!settings.businessHours[
                        day as keyof typeof settings.businessHours
                      ].closed && (
                        <>
                          <Input
                            type="time"
                            value={
                              settings.businessHours[
                                day as keyof typeof settings.businessHours
                              ].open
                            }
                            onChange={(e) =>
                              updateSetting(
                                `businessHours.${day}.open`,
                                e.target.value,
                              )
                            }
                            className="w-32"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={
                              settings.businessHours[
                                day as keyof typeof settings.businessHours
                              ].close
                            }
                            onChange={(e) =>
                              updateSetting(
                                `businessHours.${day}.close`,
                                e.target.value,
                              )
                            }
                            className="w-32"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Regional Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(v) => updateSetting("timezone", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">
                          Eastern Time
                        </SelectItem>
                        <SelectItem value="America/Chicago">
                          Central Time
                        </SelectItem>
                        <SelectItem value="America/Denver">
                          Mountain Time
                        </SelectItem>
                        <SelectItem value="America/Los_Angeles">
                          Pacific Time
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(v) => updateSetting("currency", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Service Settings Tab */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Service Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="default-duration">
                  Default Service Duration (minutes)
                </Label>
                <Input
                  id="default-duration"
                  type="number"
                  value={settings.defaultServiceDuration}
                  onChange={(e) =>
                    updateSetting(
                      "defaultServiceDuration",
                      parseInt(e.target.value) || 60,
                    )
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Service Features</h3>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enable Online Booking</div>
                    <div className="text-sm text-muted-foreground">
                      Allow customers to book appointments online
                    </div>
                  </div>
                  <Switch
                    checked={settings.enableOnlineBooking}
                    onCheckedChange={(checked) =>
                      updateSetting("enableOnlineBooking", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Require Order Approval</div>
                    <div className="text-sm text-muted-foreground">
                      All orders must be approved before work begins
                    </div>
                  </div>
                  <Switch
                    checked={settings.requireApprovalForOrders}
                    onCheckedChange={(checked) =>
                      updateSetting("requireApprovalForOrders", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto-assign Technicians</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically assign available technicians to new jobs
                    </div>
                  </div>
                  <Switch
                    checked={settings.autoAssignTechnicians}
                    onCheckedChange={(checked) =>
                      updateSetting("autoAssignTechnicians", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enable Time Tracking</div>
                    <div className="text-sm text-muted-foreground">
                      Track time spent on each job
                    </div>
                  </div>
                  <Switch
                    checked={settings.enableTimeTracking}
                    onCheckedChange={(checked) =>
                      updateSetting("enableTimeTracking", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Settings Tab */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    step="0.01"
                    value={settings.defaultTaxRate}
                    onChange={(e) =>
                      updateSetting(
                        "defaultTaxRate",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="labor-rate">Labor Rate ($/hour)</Label>
                  <Input
                    id="labor-rate"
                    type="number"
                    step="0.01"
                    value={settings.laborRate}
                    onChange={(e) =>
                      updateSetting(
                        "laborRate",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="discount-threshold">
                  Discount Threshold ($)
                </Label>
                <Input
                  id="discount-threshold"
                  type="number"
                  value={settings.discountThreshold}
                  onChange={(e) =>
                    updateSetting(
                      "discountThreshold",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Orders above this amount are eligible for discounts
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable Dynamic Pricing</div>
                  <div className="text-sm text-muted-foreground">
                    Adjust prices based on demand and availability
                  </div>
                </div>
                <Switch
                  checked={settings.enableDynamicPricing}
                  onCheckedChange={(checked) =>
                    updateSetting("enableDynamicPricing", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">New Orders</div>
                    <div className="text-sm text-muted-foreground">
                      Notify when new orders are received
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications.newOrders}
                    onCheckedChange={(checked) =>
                      updateSetting("emailNotifications.newOrders", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Completed Jobs</div>
                    <div className="text-sm text-muted-foreground">
                      Notify when jobs are completed
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications.completedJobs}
                    onCheckedChange={(checked) =>
                      updateSetting("emailNotifications.completedJobs", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Low Inventory</div>
                    <div className="text-sm text-muted-foreground">
                      Notify when inventory is running low
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications.lowInventory}
                    onCheckedChange={(checked) =>
                      updateSetting("emailNotifications.lowInventory", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Overdue Jobs</div>
                    <div className="text-sm text-muted-foreground">
                      Notify when jobs are overdue
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications.overdueJobs}
                    onCheckedChange={(checked) =>
                      updateSetting("emailNotifications.overdueJobs", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Customer Reminders</div>
                    <div className="text-sm text-muted-foreground">
                      Send appointment reminders to customers
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications.customerReminders}
                    onCheckedChange={(checked) =>
                      updateSetting(
                        "emailNotifications.customerReminders",
                        checked,
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  SMS Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Appointment Reminders</div>
                    <div className="text-sm text-muted-foreground">
                      Send SMS reminders for appointments
                    </div>
                  </div>
                  <Switch
                    checked={settings.smsNotifications.appointmentReminders}
                    onCheckedChange={(checked) =>
                      updateSetting(
                        "smsNotifications.appointmentReminders",
                        checked,
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Status Updates</div>
                    <div className="text-sm text-muted-foreground">
                      Send status updates for ongoing jobs
                    </div>
                  </div>
                  <Switch
                    checked={settings.smsNotifications.statusUpdates}
                    onCheckedChange={(checked) =>
                      updateSetting("smsNotifications.statusUpdates", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Promotions</div>
                    <div className="text-sm text-muted-foreground">
                      Send promotional messages
                    </div>
                  </div>
                  <Switch
                    checked={settings.smsNotifications.promotions}
                    onCheckedChange={(checked) =>
                      updateSetting("smsNotifications.promotions", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="retention-days">Data Retention (days)</Label>
                  <Input
                    id="retention-days"
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={(e) =>
                      updateSetting(
                        "dataRetentionDays",
                        parseInt(e.target.value) || 2555,
                      )
                    }
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    How long to keep historical data (default: 7 years)
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enable Audit Log</div>
                    <div className="text-sm text-muted-foreground">
                      Track all system changes and user actions
                    </div>
                  </div>
                  <Switch
                    checked={settings.enableAuditLog}
                    onCheckedChange={(checked) =>
                      updateSetting("enableAuditLog", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enable Backups</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically backup system data
                    </div>
                  </div>
                  <Switch
                    checked={settings.enableBackups}
                    onCheckedChange={(checked) =>
                      updateSetting("enableBackups", checked)
                    }
                  />
                </div>

                {settings.enableBackups && (
                  <div>
                    <Label htmlFor="backup-frequency">Backup Frequency</Label>
                    <Select
                      value={settings.backupFrequency}
                      onValueChange={(v) => updateSetting("backupFrequency", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Maintenance Mode</div>
                    <div className="text-sm text-muted-foreground">
                      Temporarily disable access for maintenance
                    </div>
                  </div>
                  <Switch
                    checked={settings.enableMaintenanceMode}
                    onCheckedChange={(checked) =>
                      updateSetting("enableMaintenanceMode", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Payment Gateway</div>
                    <div className="text-sm text-muted-foreground">
                      Enable online payment processing
                    </div>
                  </div>
                  <Switch
                    checked={settings.enablePaymentGateway}
                    onCheckedChange={(checked) =>
                      updateSetting("enablePaymentGateway", checked)
                    }
                  />
                </div>

                {settings.enablePaymentGateway && (
                  <div>
                    <Label htmlFor="payment-provider">Payment Provider</Label>
                    <Select
                      value={settings.paymentProvider}
                      onValueChange={(v) => updateSetting("paymentProvider", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Inventory Sync</div>
                    <div className="text-sm text-muted-foreground">
                      Sync with external inventory systems
                    </div>
                  </div>
                  <Switch
                    checked={settings.enableInventorySync}
                    onCheckedChange={(checked) =>
                      updateSetting("enableInventorySync", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Accounting Sync</div>
                    <div className="text-sm text-muted-foreground">
                      Sync with accounting software
                    </div>
                  </div>
                  <Switch
                    checked={settings.enableAccountingSync}
                    onCheckedChange={(checked) =>
                      updateSetting("enableAccountingSync", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Changes Bar */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-sm">You have unsaved changes</span>
            <Button size="sm" onClick={handleSaveSettings} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
