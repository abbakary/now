import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Settings,
  Globe,
  Shield,
  Bell,
  Database,
  Mail,
  Smartphone,
  CreditCard,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Lock,
  Key,
  Server,
  Cloud,
  Zap,
  Users,
  Calendar,
  Clock,
  DollarSign,
} from 'lucide-react';
import { useFeedback } from '@/components/ui/status-popup';

interface SystemConfig {
  // Company Information
  company: {
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
    currency: string;
    timezone: string;
    language: string;
  };

  // Business Settings
  business: {
    businessHours: {
      monday: { open: string; close: string; closed: boolean };
      tuesday: { open: string; close: string; closed: boolean };
      wednesday: { open: string; close: string; closed: boolean };
      thursday: { open: string; close: string; closed: boolean };
      friday: { open: string; close: string; closed: boolean };
      saturday: { open: string; close: string; closed: boolean };
      sunday: { open: string; close: string; closed: boolean };
    };
    defaultTaxRate: number;
    defaultMarkup: number;
    defaultWarranty: number;
    invoicePrefix: string;
    jobCardPrefix: string;
    receiptPrefix: string;
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
  };

  // Inventory Settings
  inventory: {
    enableLowStockAlerts: boolean;
    lowStockThreshold: number;
    enableAutoReorder: boolean;
    autoReorderPoint: number;
    enableBarcodeScanning: boolean;
    enableSerialTracking: boolean;
    enableExpiryTracking: boolean;
    defaultStockLocation: string;
  };

  // Payment Settings
  payment: {
    enableCash: boolean;
    enableCard: boolean;
    enableMobileMoney: boolean;
    enableCredit: boolean;
    creditTerms: number;
    creditLimit: number;
    paymentMethods: string[];
    mobileMoneyCodes: string[];
  };

  // Notification Settings
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    orderUpdates: boolean;
    inventoryAlerts: boolean;
    paymentReminders: boolean;
    systemAlerts: boolean;
    marketingEmails: boolean;
  };

  // Security Settings
  security: {
    requireStrongPasswords: boolean;
    passwordExpiry: number;
    sessionTimeout: number;
    enableTwoFactor: boolean;
    enableAuditLog: boolean;
    enableIpWhitelist: boolean;
    allowedIps: string[];
    enableDataEncryption: boolean;
  };

  // Integration Settings
  integrations: {
    emailService: 'smtp' | 'sendgrid' | 'mailgun';
    smsService: 'twilio' | 'africas_talking' | 'custom';
    paymentGateway: 'stripe' | 'paypal' | 'flutterwave' | 'pesapal';
    accountingSystem: 'quickbooks' | 'sage' | 'xero' | 'none';
    backupService: 'dropbox' | 'google_drive' | 'aws_s3' | 'local';
  };
}

// Mock system configuration
const mockSystemConfig: SystemConfig = {
  company: {
    name: 'Auto Service Pro',
    logo: '/company-logo.png',
    address: 'Plot 123, Industrial Area, Kampala',
    phone: '+256 414 123 456',
    email: 'info@autoservicepro.ug',
    website: 'www.autoservicepro.ug',
    taxId: 'TIN-123456789',
    currency: 'UGX',
    timezone: 'Africa/Kampala',
    language: 'en',
  },
  business: {
    businessHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '14:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true },
    },
    defaultTaxRate: 18,
    defaultMarkup: 25,
    defaultWarranty: 90,
    invoicePrefix: 'INV',
    jobCardPrefix: 'JOB',
    receiptPrefix: 'RCP',
    autoBackup: true,
    backupFrequency: 'daily',
  },
  inventory: {
    enableLowStockAlerts: true,
    lowStockThreshold: 10,
    enableAutoReorder: false,
    autoReorderPoint: 5,
    enableBarcodeScanning: true,
    enableSerialTracking: true,
    enableExpiryTracking: true,
    defaultStockLocation: 'Main Warehouse',
  },
  payment: {
    enableCash: true,
    enableCard: true,
    enableMobileMoney: true,
    enableCredit: true,
    creditTerms: 30,
    creditLimit: 1000000,
    paymentMethods: ['Cash', 'Visa', 'Mastercard', 'MTN Mobile Money', 'Airtel Money'],
    mobileMoneyCodes: ['*165#', '*185#'],
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    inventoryAlerts: true,
    paymentReminders: true,
    systemAlerts: true,
    marketingEmails: false,
  },
  security: {
    requireStrongPasswords: true,
    passwordExpiry: 90,
    sessionTimeout: 60,
    enableTwoFactor: false,
    enableAuditLog: true,
    enableIpWhitelist: false,
    allowedIps: [],
    enableDataEncryption: true,
  },
  integrations: {
    emailService: 'smtp',
    smsService: 'africas_talking',
    paymentGateway: 'flutterwave',
    accountingSystem: 'none',
    backupService: 'local',
  },
};

export default function SystemSettings() {
  const { success, error } = useFeedback();
  const [config, setConfig] = useState<SystemConfig>(mockSystemConfig);
  const [activeTab, setActiveTab] = useState("company");
  const [isSaving, setIsSaving] = useState(false);

  // Handle configuration updates
  const updateConfig = useCallback((section: keyof SystemConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  }, []);

  // Handle nested configuration updates
  const updateNestedConfig = useCallback((section: keyof SystemConfig, subsection: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [field]: value,
        },
      },
    }));
  }, []);

  // Handle saving configuration
  const handleSaveConfig = useCallback(async () => {
    setIsSaving(true);
    try {
      // In real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('System configuration updated successfully!');
    } catch (err) {
      console.error('Error saving configuration:', err);
      error('Failed to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [success, error]);

  // Handle system backup
  const handleBackup = useCallback(async () => {
    try {
      // In real app, this would trigger a backup
      success('System backup initiated successfully!');
    } catch (err) {
      console.error('Error creating backup:', err);
      error('Failed to create backup. Please try again.');
    }
  }, [success, error]);

  // Handle system restore
  const handleRestore = useCallback(async () => {
    if (window.confirm('Are you sure you want to restore from backup? This will overwrite current data.')) {
      try {
        // In real app, this would restore from backup
        success('System restored from backup successfully!');
      } catch (err) {
        console.error('Error restoring backup:', err);
        error('Failed to restore from backup. Please try again.');
      }
    }
  }, [success, error]);

  // System status data
  const systemStatus = {
    diskUsage: 68,
    memoryUsage: 45,
    cpuUsage: 23,
    uptime: '15 days, 8 hours',
    lastBackup: '2024-01-22 02:30:00',
    version: 'v2.1.4',
    database: 'Connected',
    apiStatus: 'Healthy',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleBackup}>
            <Download className="h-4 w-4 mr-2" />
            Backup
          </Button>
          <Button variant="outline" onClick={handleRestore}>
            <Upload className="h-4 w-4 mr-2" />
            Restore
          </Button>
          <Button onClick={handleSaveConfig} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>Current system health and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Disk Usage</span>
                <span>{systemStatus.diskUsage}%</span>
              </div>
              <Progress value={systemStatus.diskUsage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Memory Usage</span>
                <span>{systemStatus.memoryUsage}%</span>
              </div>
              <Progress value={systemStatus.memoryUsage} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>CPU Usage</span>
                <span>{systemStatus.cpuUsage}%</span>
              </div>
              <Progress value={systemStatus.cpuUsage} className="h-2" />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Uptime</span>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {systemStatus.uptime}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Version</span>
              <Badge variant="outline">{systemStatus.version}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Database</span>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                {systemStatus.database}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>API Status</span>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                {systemStatus.apiStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Backup</span>
              <span className="text-muted-foreground">{systemStatus.lastBackup}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Company Information Tab */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>Basic company details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={config.company.name}
                    onChange={(e) => updateConfig('company', 'name', e.target.value)}
                    placeholder="Your Company Name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tax-id">Tax ID / TIN</Label>
                  <Input
                    id="tax-id"
                    value={config.company.taxId}
                    onChange={(e) => updateConfig('company', 'taxId', e.target.value)}
                    placeholder="TIN-123456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-address">Address</Label>
                <Textarea
                  id="company-address"
                  value={config.company.address}
                  onChange={(e) => updateConfig('company', 'address', e.target.value)}
                  placeholder="Company address..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input
                    id="company-phone"
                    value={config.company.phone}
                    onChange={(e) => updateConfig('company', 'phone', e.target.value)}
                    placeholder="+256 414 123 456"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={config.company.email}
                    onChange={(e) => updateConfig('company', 'email', e.target.value)}
                    placeholder="info@company.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="company-website">Website</Label>
                  <Input
                    id="company-website"
                    value={config.company.website}
                    onChange={(e) => updateConfig('company', 'website', e.target.value)}
                    placeholder="www.company.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-currency">Currency</Label>
                  <Select 
                    value={config.company.currency} 
                    onValueChange={(value) => updateConfig('company', 'currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UGX">Ugandan Shilling (UGX)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="KES">Kenyan Shilling (KES)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-timezone">Timezone</Label>
                  <Select 
                    value={config.company.timezone} 
                    onValueChange={(value) => updateConfig('company', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Kampala">Africa/Kampala (EAT)</SelectItem>
                      <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Settings Tab */}
        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Business Hours
              </CardTitle>
              <CardDescription>Set your business operating hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(config.business.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium capitalize">{day}</div>
                    <Switch
                      checked={!hours.closed}
                      onCheckedChange={(checked) => 
                        updateNestedConfig('business', 'businessHours', day, { ...hours, closed: !checked })
                      }
                    />
                    {!hours.closed && (
                      <>
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => 
                            updateNestedConfig('business', 'businessHours', day, { ...hours, open: e.target.value })
                          }
                          className="w-32"
                        />
                        <span className="text-sm text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => 
                            updateNestedConfig('business', 'businessHours', day, { ...hours, close: e.target.value })
                          }
                          className="w-32"
                        />
                      </>
                    )}
                    {hours.closed && (
                      <span className="text-sm text-muted-foreground">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Business Defaults
              </CardTitle>
              <CardDescription>Default values for business operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="default-tax">Default Tax Rate (%)</Label>
                  <Input
                    id="default-tax"
                    type="number"
                    value={config.business.defaultTaxRate}
                    onChange={(e) => updateConfig('business', 'defaultTaxRate', Number(e.target.value))}
                    placeholder="18"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-markup">Default Markup (%)</Label>
                  <Input
                    id="default-markup"
                    type="number"
                    value={config.business.defaultMarkup}
                    onChange={(e) => updateConfig('business', 'defaultMarkup', Number(e.target.value))}
                    placeholder="25"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-warranty">Default Warranty (days)</Label>
                  <Input
                    id="default-warranty"
                    type="number"
                    value={config.business.defaultWarranty}
                    onChange={(e) => updateConfig('business', 'defaultWarranty', Number(e.target.value))}
                    placeholder="90"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select 
                    value={config.business.backupFrequency} 
                    onValueChange={(value) => updateConfig('business', 'backupFrequency', value)}
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
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
                  <Input
                    id="invoice-prefix"
                    value={config.business.invoicePrefix}
                    onChange={(e) => updateConfig('business', 'invoicePrefix', e.target.value)}
                    placeholder="INV"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="job-prefix">Job Card Prefix</Label>
                  <Input
                    id="job-prefix"
                    value={config.business.jobCardPrefix}
                    onChange={(e) => updateConfig('business', 'jobCardPrefix', e.target.value)}
                    placeholder="JOB"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt-prefix">Receipt Prefix</Label>
                  <Input
                    id="receipt-prefix"
                    value={config.business.receiptPrefix}
                    onChange={(e) => updateConfig('business', 'receiptPrefix', e.target.value)}
                    placeholder="RCP"
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-backup"
                    checked={config.business.autoBackup}
                    onCheckedChange={(checked) => updateConfig('business', 'autoBackup', checked)}
                  />
                  <Label htmlFor="auto-backup">Enable automatic backups</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Settings Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Inventory Configuration
              </CardTitle>
              <CardDescription>Configure inventory management settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
                    <Input
                      id="low-stock-threshold"
                      type="number"
                      value={config.inventory.lowStockThreshold}
                      onChange={(e) => updateConfig('inventory', 'lowStockThreshold', Number(e.target.value))}
                      placeholder="10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="auto-reorder-point">Auto Reorder Point</Label>
                    <Input
                      id="auto-reorder-point"
                      type="number"
                      value={config.inventory.autoReorderPoint}
                      onChange={(e) => updateConfig('inventory', 'autoReorderPoint', Number(e.target.value))}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-location">Default Stock Location</Label>
                  <Input
                    id="default-location"
                    value={config.inventory.defaultStockLocation}
                    onChange={(e) => updateConfig('inventory', 'defaultStockLocation', e.target.value)}
                    placeholder="Main Warehouse"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Inventory Features</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="low-stock-alerts"
                        checked={config.inventory.enableLowStockAlerts}
                        onCheckedChange={(checked) => updateConfig('inventory', 'enableLowStockAlerts', checked)}
                      />
                      <Label htmlFor="low-stock-alerts">Enable low stock alerts</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-reorder"
                        checked={config.inventory.enableAutoReorder}
                        onCheckedChange={(checked) => updateConfig('inventory', 'enableAutoReorder', checked)}
                      />
                      <Label htmlFor="auto-reorder">Enable auto reorder</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="barcode-scanning"
                        checked={config.inventory.enableBarcodeScanning}
                        onCheckedChange={(checked) => updateConfig('inventory', 'enableBarcodeScanning', checked)}
                      />
                      <Label htmlFor="barcode-scanning">Enable barcode scanning</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="serial-tracking"
                        checked={config.inventory.enableSerialTracking}
                        onCheckedChange={(checked) => updateConfig('inventory', 'enableSerialTracking', checked)}
                      />
                      <Label htmlFor="serial-tracking">Enable serial number tracking</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="expiry-tracking"
                        checked={config.inventory.enableExpiryTracking}
                        onCheckedChange={(checked) => updateConfig('inventory', 'enableExpiryTracking', checked)}
                      />
                      <Label htmlFor="expiry-tracking">Enable expiry date tracking</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>Configure accepted payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-cash"
                      checked={config.payment.enableCash}
                      onCheckedChange={(checked) => updateConfig('payment', 'enableCash', checked)}
                    />
                    <Label htmlFor="enable-cash">Accept Cash Payments</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-card"
                      checked={config.payment.enableCard}
                      onCheckedChange={(checked) => updateConfig('payment', 'enableCard', checked)}
                    />
                    <Label htmlFor="enable-card">Accept Card Payments</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-mobile"
                      checked={config.payment.enableMobileMoney}
                      onCheckedChange={(checked) => updateConfig('payment', 'enableMobileMoney', checked)}
                    />
                    <Label htmlFor="enable-mobile">Accept Mobile Money</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-credit"
                      checked={config.payment.enableCredit}
                      onCheckedChange={(checked) => updateConfig('payment', 'enableCredit', checked)}
                    />
                    <Label htmlFor="enable-credit">Allow Credit Sales</Label>
                  </div>
                </div>

                {config.payment.enableCredit && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="credit-terms">Default Credit Terms (days)</Label>
                      <Input
                        id="credit-terms"
                        type="number"
                        value={config.payment.creditTerms}
                        onChange={(e) => updateConfig('payment', 'creditTerms', Number(e.target.value))}
                        placeholder="30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="credit-limit">Default Credit Limit</Label>
                      <Input
                        id="credit-limit"
                        type="number"
                        value={config.payment.creditLimit}
                        onChange={(e) => updateConfig('payment', 'creditLimit', Number(e.target.value))}
                        placeholder="1000000"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="email-notifications"
                      checked={config.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateConfig('notifications', 'emailNotifications', checked)}
                    />
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sms-notifications"
                      checked={config.notifications.smsNotifications}
                      onCheckedChange={(checked) => updateConfig('notifications', 'smsNotifications', checked)}
                    />
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="push-notifications"
                      checked={config.notifications.pushNotifications}
                      onCheckedChange={(checked) => updateConfig('notifications', 'pushNotifications', checked)}
                    />
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Notification Types</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="order-updates"
                        checked={config.notifications.orderUpdates}
                        onCheckedChange={(checked) => updateConfig('notifications', 'orderUpdates', checked)}
                      />
                      <Label htmlFor="order-updates">Order Updates</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="inventory-alerts"
                        checked={config.notifications.inventoryAlerts}
                        onCheckedChange={(checked) => updateConfig('notifications', 'inventoryAlerts', checked)}
                      />
                      <Label htmlFor="inventory-alerts">Inventory Alerts</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="payment-reminders"
                        checked={config.notifications.paymentReminders}
                        onCheckedChange={(checked) => updateConfig('notifications', 'paymentReminders', checked)}
                      />
                      <Label htmlFor="payment-reminders">Payment Reminders</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="system-alerts"
                        checked={config.notifications.systemAlerts}
                        onCheckedChange={(checked) => updateConfig('notifications', 'systemAlerts', checked)}
                      />
                      <Label htmlFor="system-alerts">System Alerts</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="marketing-emails"
                        checked={config.notifications.marketingEmails}
                        onCheckedChange={(checked) => updateConfig('notifications', 'marketingEmails', checked)}
                      />
                      <Label htmlFor="marketing-emails">Marketing Emails</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure system security and access controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                    <Input
                      id="password-expiry"
                      type="number"
                      value={config.security.passwordExpiry}
                      onChange={(e) => updateConfig('security', 'passwordExpiry', Number(e.target.value))}
                      placeholder="90"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={config.security.sessionTimeout}
                      onChange={(e) => updateConfig('security', 'sessionTimeout', Number(e.target.value))}
                      placeholder="60"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Security Features</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="strong-passwords"
                        checked={config.security.requireStrongPasswords}
                        onCheckedChange={(checked) => updateConfig('security', 'requireStrongPasswords', checked)}
                      />
                      <Label htmlFor="strong-passwords">Require Strong Passwords</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="two-factor"
                        checked={config.security.enableTwoFactor}
                        onCheckedChange={(checked) => updateConfig('security', 'enableTwoFactor', checked)}
                      />
                      <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="audit-log"
                        checked={config.security.enableAuditLog}
                        onCheckedChange={(checked) => updateConfig('security', 'enableAuditLog', checked)}
                      />
                      <Label htmlFor="audit-log">Enable Audit Logging</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="data-encryption"
                        checked={config.security.enableDataEncryption}
                        onCheckedChange={(checked) => updateConfig('security', 'enableDataEncryption', checked)}
                      />
                      <Label htmlFor="data-encryption">Enable Data Encryption</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="ip-whitelist"
                        checked={config.security.enableIpWhitelist}
                        onCheckedChange={(checked) => updateConfig('security', 'enableIpWhitelist', checked)}
                      />
                      <Label htmlFor="ip-whitelist">Enable IP Whitelist</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                System Integrations
              </CardTitle>
              <CardDescription>Configure external service integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email-service">Email Service</Label>
                    <Select 
                      value={config.integrations.emailService} 
                      onValueChange={(value) => updateConfig('integrations', 'emailService', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smtp">SMTP</SelectItem>
                        <SelectItem value="sendgrid">SendGrid</SelectItem>
                        <SelectItem value="mailgun">Mailgun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sms-service">SMS Service</Label>
                    <Select 
                      value={config.integrations.smsService} 
                      onValueChange={(value) => updateConfig('integrations', 'smsService', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="africas_talking">Africa's Talking</SelectItem>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="payment-gateway">Payment Gateway</Label>
                    <Select 
                      value={config.integrations.paymentGateway} 
                      onValueChange={(value) => updateConfig('integrations', 'paymentGateway', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flutterwave">Flutterwave</SelectItem>
                        <SelectItem value="pesapal">PesaPal</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accounting-system">Accounting System</Label>
                    <Select 
                      value={config.integrations.accountingSystem} 
                      onValueChange={(value) => updateConfig('integrations', 'accountingSystem', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="quickbooks">QuickBooks</SelectItem>
                        <SelectItem value="sage">Sage</SelectItem>
                        <SelectItem value="xero">Xero</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-service">Backup Service</Label>
                  <Select 
                    value={config.integrations.backupService} 
                    onValueChange={(value) => updateConfig('integrations', 'backupService', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Storage</SelectItem>
                      <SelectItem value="dropbox">Dropbox</SelectItem>
                      <SelectItem value="google_drive">Google Drive</SelectItem>
                      <SelectItem value="aws_s3">AWS S3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
