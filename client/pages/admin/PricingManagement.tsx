import React, { useState, useCallback, useMemo } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Target,
  Calculator,
  Edit,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Settings,
  Upload,
  Download,
} from 'lucide-react';
import { useFeedback } from '@/components/ui/status-popup';
import { cn } from '@/lib/utils';

interface PricingRule {
  id: string;
  name: string;
  description: string;
  type: 'markup' | 'margin' | 'fixed' | 'tiered' | 'bulk';
  
  // Rule Configuration
  isActive: boolean;
  priority: number;
  
  // Conditions
  categoryIds: string[];
  brandIds: string[];
  productIds: string[];
  minQuantity?: number;
  maxQuantity?: number;
  customerTypes: string[];
  
  // Pricing Parameters
  value: number; // Percentage for markup/margin, amount for fixed
  minPrice?: number;
  maxPrice?: number;
  roundingRule: 'none' | 'nearest_10' | 'nearest_100' | 'nearest_1000';
  
  // Tiered Pricing (for bulk orders)
  tiers?: PricingTier[];
  
  // Validity
  startDate?: string;
  endDate?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  timesApplied: number;
  totalRevenue: number;
}

interface PricingTier {
  minQuantity: number;
  maxQuantity?: number;
  value: number;
  type: 'percentage' | 'fixed';
}

interface TaxRate {
  id: string;
  name: string;
  description: string;
  rate: number; // Percentage
  
  // Configuration
  isActive: boolean;
  isDefault: boolean;
  
  // Applicability
  categoryIds: string[];
  regionIds: string[];
  customerTypes: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface DiscountRule {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y';
  
  // Configuration
  isActive: boolean;
  isAutoApply: boolean;
  requiresCoupon: boolean;
  couponCode?: string;
  
  // Discount Parameters
  value: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  
  // Buy X Get Y Configuration
  buyQuantity?: number;
  getQuantity?: number;
  getProductIds?: string[];
  
  // Conditions
  categoryIds: string[];
  productIds: string[];
  customerTypes: string[];
  
  // Usage Limits
  maxUsage?: number;
  maxUsagePerCustomer?: number;
  currentUsage: number;
  
  // Validity
  startDate?: string;
  endDate?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  totalSavings: number;
}

interface PriceUpdateRequest {
  productIds: string[];
  updateType: 'markup' | 'margin' | 'fixed' | 'percentage';
  value: number;
  reason: string;
  effectiveDate: string;
  approvedBy?: string;
}

// Mock data
const mockPricingRules: PricingRule[] = [
  {
    id: 'RULE-001',
    name: 'Standard Product Markup',
    description: 'Default 25% markup for all products',
    type: 'markup',
    isActive: true,
    priority: 1,
    categoryIds: [],
    brandIds: [],
    productIds: [],
    customerTypes: ['retail'],
    value: 25,
    minPrice: 1000,
    roundingRule: 'nearest_100',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Admin User',
    timesApplied: 1250,
    totalRevenue: 45600000,
  },
  {
    id: 'RULE-002',
    name: 'Premium Tire Markup',
    description: 'Higher markup for premium tire brands',
    type: 'markup',
    isActive: true,
    priority: 2,
    categoryIds: ['CAT-001'],
    brandIds: ['BRAND-001'],
    productIds: [],
    customerTypes: ['retail'],
    value: 35,
    minPrice: 50000,
    roundingRule: 'nearest_1000',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    createdBy: 'Admin User',
    timesApplied: 156,
    totalRevenue: 12400000,
  },
  {
    id: 'RULE-003',
    name: 'Bulk Discount',
    description: 'Discounted pricing for bulk orders',
    type: 'tiered',
    isActive: true,
    priority: 3,
    categoryIds: [],
    brandIds: [],
    productIds: [],
    customerTypes: ['wholesale', 'business'],
    value: 0,
    tiers: [
      { minQuantity: 10, maxQuantity: 49, value: 5, type: 'percentage' },
      { minQuantity: 50, maxQuantity: 99, value: 10, type: 'percentage' },
      { minQuantity: 100, value: 15, type: 'percentage' },
    ],
    roundingRule: 'nearest_100',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10',
    createdBy: 'Admin User',
    timesApplied: 89,
    totalRevenue: 8900000,
  }
];

const mockTaxRates: TaxRate[] = [
  {
    id: 'TAX-001',
    name: 'Standard VAT',
    description: 'Standard 18% VAT rate',
    rate: 18,
    isActive: true,
    isDefault: true,
    categoryIds: [],
    regionIds: ['UG'],
    customerTypes: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'TAX-002',
    name: 'Zero Rated',
    description: 'Zero rated items (exports, medicines)',
    rate: 0,
    isActive: true,
    isDefault: false,
    categoryIds: ['CAT-MEDICINE'],
    regionIds: ['EXPORT'],
    customerTypes: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  }
];

const mockDiscountRules: DiscountRule[] = [
  {
    id: 'DISC-001',
    name: 'First Time Customer',
    description: '10% discount for first-time customers',
    type: 'percentage',
    isActive: true,
    isAutoApply: true,
    requiresCoupon: false,
    value: 10,
    maxDiscountAmount: 50000,
    minOrderAmount: 100000,
    categoryIds: [],
    productIds: [],
    customerTypes: ['new'],
    maxUsagePerCustomer: 1,
    currentUsage: 456,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    totalSavings: 2280000,
  },
  {
    id: 'DISC-002',
    name: 'Seasonal Sale',
    description: '15% off all tires during tire season',
    type: 'percentage',
    isActive: true,
    isAutoApply: false,
    requiresCoupon: true,
    couponCode: 'TIRES2024',
    value: 15,
    maxDiscountAmount: 100000,
    categoryIds: ['CAT-001'],
    productIds: [],
    customerTypes: [],
    maxUsage: 1000,
    currentUsage: 234,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-20',
    totalSavings: 3510000,
  }
];

export default function PricingManagement() {
  const { success, error } = useFeedback();
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(mockPricingRules);
  const [taxRates, setTaxRates] = useState<TaxRate[]>(mockTaxRates);
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>(mockDiscountRules);
  const [activeTab, setActiveTab] = useState("rules");

  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [showAddRuleDialog, setShowAddRuleDialog] = useState(false);
  const [showAddTaxDialog, setShowAddTaxDialog] = useState(false);
  const [showAddDiscountDialog, setShowAddDiscountDialog] = useState(false);

  // Forms
  const [bulkUpdateForm, setBulkUpdateForm] = useState<PriceUpdateRequest>({
    productIds: [],
    updateType: 'markup',
    value: 0,
    reason: '',
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  const [ruleForm, setRuleForm] = useState({
    name: '',
    description: '',
    type: 'markup' as 'markup' | 'margin' | 'fixed' | 'tiered',
    value: 0,
    categoryIds: [] as string[],
    customerTypes: [] as string[],
    minPrice: 0,
    maxPrice: 0,
    roundingRule: 'nearest_100' as 'none' | 'nearest_10' | 'nearest_100' | 'nearest_1000',
    isActive: true,
  });

  const [taxForm, setTaxForm] = useState({
    name: '',
    description: '',
    rate: 18,
    isDefault: false,
    categoryIds: [] as string[],
    customerTypes: [] as string[],
    isActive: true,
  });

  const [discountForm, setDiscountForm] = useState({
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    maxDiscountAmount: 0,
    minOrderAmount: 0,
    requiresCoupon: false,
    couponCode: '',
    categoryIds: [] as string[],
    customerTypes: [] as string[],
    maxUsage: 0,
    maxUsagePerCustomer: 1,
    startDate: '',
    endDate: '',
    isActive: true,
  });

  // Calculate pricing statistics
  const pricingStats = useMemo(() => {
    const totalRules = pricingRules.length;
    const activeRules = pricingRules.filter(r => r.isActive).length;
    const totalApplications = pricingRules.reduce((sum, r) => sum + r.timesApplied, 0);
    const totalRevenue = pricingRules.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalDiscounts = discountRules.filter(d => d.isActive).length;
    const totalSavings = discountRules.reduce((sum, d) => sum + d.totalSavings, 0);

    return {
      totalRules,
      activeRules,
      totalApplications,
      totalRevenue,
      totalDiscounts,
      totalSavings,
    };
  }, [pricingRules, discountRules]);

  // Handle bulk price update
  const handleBulkUpdate = useCallback(async () => {
    try {
      if (!bulkUpdateForm.productIds.length || !bulkUpdateForm.reason || !bulkUpdateForm.value) {
        error('Please fill in all required fields');
        return;
      }

      // In real app, this would call an API
      success(`Bulk price update applied to ${bulkUpdateForm.productIds.length} products`);
      setBulkUpdateForm({
        productIds: [],
        updateType: 'markup',
        value: 0,
        reason: '',
        effectiveDate: new Date().toISOString().split('T')[0],
      });
      setShowBulkUpdateDialog(false);
    } catch (err) {
      console.error('Error applying bulk update:', err);
      error('Failed to apply bulk price update. Please try again.');
    }
  }, [bulkUpdateForm, success, error]);

  // Handle add pricing rule
  const handleAddRule = useCallback(async () => {
    try {
      if (!ruleForm.name || !ruleForm.description || !ruleForm.value) {
        error('Please fill in all required fields');
        return;
      }

      const newRule: PricingRule = {
        id: `RULE-${Date.now()}`,
        ...ruleForm,
        priority: pricingRules.length + 1,
        brandIds: [],
        productIds: [],
        minQuantity: undefined,
        maxQuantity: undefined,
        timesApplied: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Admin User',
      };

      setPricingRules(prev => [...prev, newRule]);
      success(`Pricing rule ${newRule.name} created successfully!`);
      setRuleForm({
        name: '', description: '', type: 'markup', value: 0,
        categoryIds: [], customerTypes: [], minPrice: 0, maxPrice: 0,
        roundingRule: 'nearest_100', isActive: true,
      });
      setShowAddRuleDialog(false);
    } catch (err) {
      console.error('Error adding pricing rule:', err);
      error('Failed to create pricing rule. Please try again.');
    }
  }, [ruleForm, pricingRules, success, error]);

  // Handle add tax rate
  const handleAddTax = useCallback(async () => {
    try {
      if (!taxForm.name || !taxForm.description) {
        error('Please fill in all required fields');
        return;
      }

      const newTax: TaxRate = {
        id: `TAX-${Date.now()}`,
        ...taxForm,
        regionIds: ['UG'],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      setTaxRates(prev => [...prev, newTax]);
      success(`Tax rate ${newTax.name} created successfully!`);
      setTaxForm({
        name: '', description: '', rate: 18, isDefault: false,
        categoryIds: [], customerTypes: [], isActive: true,
      });
      setShowAddTaxDialog(false);
    } catch (err) {
      console.error('Error adding tax rate:', err);
      error('Failed to create tax rate. Please try again.');
    }
  }, [taxForm, success, error]);

  // Handle add discount rule
  const handleAddDiscount = useCallback(async () => {
    try {
      if (!discountForm.name || !discountForm.description || !discountForm.value) {
        error('Please fill in all required fields');
        return;
      }

      const newDiscount: DiscountRule = {
        id: `DISC-${Date.now()}`,
        ...discountForm,
        isAutoApply: !discountForm.requiresCoupon,
        productIds: [],
        currentUsage: 0,
        totalSavings: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      setDiscountRules(prev => [...prev, newDiscount]);
      success(`Discount rule ${newDiscount.name} created successfully!`);
      setDiscountForm({
        name: '', description: '', type: 'percentage', value: 0,
        maxDiscountAmount: 0, minOrderAmount: 0, requiresCoupon: false, couponCode: '',
        categoryIds: [], customerTypes: [], maxUsage: 0, maxUsagePerCustomer: 1,
        startDate: '', endDate: '', isActive: true,
      });
      setShowAddDiscountDialog(false);
    } catch (err) {
      console.error('Error adding discount rule:', err);
      error('Failed to create discount rule. Please try again.');
    }
  }, [discountForm, success, error]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pricing Management</h2>
          <p className="text-muted-foreground">
            Manage pricing rules, tax rates, and discount policies across all products and services
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Prices
          </Button>
          <Button variant="outline" onClick={() => setShowBulkUpdateDialog(true)}>
            <Calculator className="h-4 w-4 mr-2" />
            Bulk Update
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pricing Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pricingStats.totalRules}</div>
            <p className="text-xs text-muted-foreground">
              {pricingStats.activeRules} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pricingStats.totalApplications.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">UGX {pricingStats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Discounts</CardTitle>
            <Percent className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pricingStats.totalDiscounts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Savings</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">UGX {pricingStats.totalSavings.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Margin</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">28.5%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules">Pricing Rules ({pricingRules.length})</TabsTrigger>
          <TabsTrigger value="taxes">Tax Rates ({taxRates.length})</TabsTrigger>
          <TabsTrigger value="discounts">Discounts ({discountRules.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Pricing Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Pricing Rules</h3>
            <Button onClick={() => setShowAddRuleDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>

          <div className="grid gap-4">
            {pricingRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {rule.name}
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">Priority {rule.priority}</Badge>
                      </CardTitle>
                      <CardDescription>{rule.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Switch checked={rule.isActive} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="font-bold text-blue-600 text-lg">
                        {rule.type === 'markup' || rule.type === 'margin' ? `${rule.value}%` : 
                         rule.type === 'fixed' ? `UGX ${rule.value.toLocaleString()}` : 'Tiered'}
                      </div>
                      <p className="text-xs text-gray-600 capitalize">{rule.type} Rule</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="font-bold text-green-600 text-lg">{rule.timesApplied}</div>
                      <p className="text-xs text-gray-600">Times Applied</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="font-bold text-purple-600 text-lg">UGX {rule.totalRevenue.toLocaleString()}</div>
                      <p className="text-xs text-gray-600">Revenue Impact</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="font-bold text-orange-600 text-lg capitalize">{rule.roundingRule.replace('_', ' ')}</div>
                      <p className="text-xs text-gray-600">Rounding</p>
                    </div>
                  </div>

                  {rule.customerTypes.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Customer Types:</h4>
                      <div className="flex flex-wrap gap-1">
                        {rule.customerTypes.map(type => (
                          <Badge key={type} variant="outline" className="text-xs capitalize">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {rule.tiers && rule.tiers.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Pricing Tiers:</h4>
                      <div className="space-y-2">
                        {rule.tiers.map((tier, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                            <span>
                              {tier.minQuantity}+ {tier.maxQuantity ? `- ${tier.maxQuantity}` : ''} units
                            </span>
                            <Badge variant="outline">
                              {tier.type === 'percentage' ? `${tier.value}% off` : `UGX ${tier.value} off`}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tax Rates Tab */}
        <TabsContent value="taxes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Tax Rates</h3>
            <Button onClick={() => setShowAddTaxDialog(true)}>
              <Percent className="h-4 w-4 mr-2" />
              Add Tax Rate
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tax Name</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Applies To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxRates.map((tax) => (
                    <TableRow key={tax.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            {tax.name}
                            {tax.isDefault && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{tax.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-lg">{tax.rate}%</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {tax.categoryIds.length > 0 ? (
                            <div className="text-sm">Specific categories</div>
                          ) : (
                            <div className="text-sm">All products</div>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {tax.regionIds.map(region => (
                              <Badge key={region} variant="outline" className="text-xs">
                                {region}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={tax.isActive ? "default" : "secondary"}>
                            {tax.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Switch checked={tax.isActive} size="sm" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discounts Tab */}
        <TabsContent value="discounts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Discount Rules</h3>
            <Button onClick={() => setShowAddDiscountDialog(true)}>
              <Percent className="h-4 w-4 mr-2" />
              Add Discount
            </Button>
          </div>

          <div className="grid gap-4">
            {discountRules.map((discount) => (
              <Card key={discount.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {discount.name}
                        <Badge variant={discount.isActive ? "default" : "secondary"}>
                          {discount.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {discount.requiresCoupon && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800">
                            Coupon: {discount.couponCode}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{discount.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Switch checked={discount.isActive} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="font-bold text-blue-600 text-lg">
                        {discount.type === 'percentage' ? `${discount.value}%` : `UGX ${discount.value.toLocaleString()}`}
                      </div>
                      <p className="text-xs text-gray-600">Discount Value</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="font-bold text-green-600 text-lg">{discount.currentUsage}</div>
                      <p className="text-xs text-gray-600">Times Used</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="font-bold text-purple-600 text-lg">UGX {discount.totalSavings.toLocaleString()}</div>
                      <p className="text-xs text-gray-600">Total Savings</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="font-bold text-orange-600 text-lg">
                        {discount.maxUsage ? `${discount.maxUsage - discount.currentUsage}` : '∞'}
                      </div>
                      <p className="text-xs text-gray-600">Remaining Uses</p>
                    </div>
                  </div>

                  {(discount.startDate || discount.endDate) && (
                    <div className="mt-4 text-sm">
                      <span className="text-gray-600">Valid: </span>
                      {discount.startDate && new Date(discount.startDate).toLocaleDateString()} 
                      {discount.startDate && discount.endDate && ' - '}
                      {discount.endDate && new Date(discount.endDate).toLocaleDateString()}
                    </div>
                  )}

                  {discount.minOrderAmount && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Minimum order: </span>
                      UGX {discount.minOrderAmount.toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Rule Performance</CardTitle>
                <CardDescription>Revenue impact by pricing rule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pricingRules
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)
                    .slice(0, 5)
                    .map(rule => (
                      <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Applied {rule.timesApplied} times
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">UGX {rule.totalRevenue.toLocaleString()}</div>
                          <Badge variant="outline" className="text-xs">
                            {rule.type} {rule.value}{rule.type === 'markup' || rule.type === 'margin' ? '%' : ''}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discount Impact</CardTitle>
                <CardDescription>Customer savings by discount rule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {discountRules
                    .sort((a, b) => b.totalSavings - a.totalSavings)
                    .slice(0, 5)
                    .map(discount => (
                      <div key={discount.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{discount.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Used {discount.currentUsage} times
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-orange-600">UGX {discount.totalSavings.toLocaleString()}</div>
                          <Badge variant="outline" className="text-xs">
                            {discount.value}{discount.type === 'percentage' ? '%' : ''} off
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bulk Update Dialog */}
      <Dialog open={showBulkUpdateDialog} onOpenChange={setShowBulkUpdateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Price Update</DialogTitle>
            <DialogDescription>
              Apply pricing changes to multiple products at once.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="update-type">Update Type</Label>
              <Select 
                value={bulkUpdateForm.updateType} 
                onValueChange={(value) => setBulkUpdateForm(prev => ({ ...prev, updateType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markup">Markup Percentage</SelectItem>
                  <SelectItem value="margin">Margin Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="percentage">Percentage Change</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-value">Value</Label>
              <Input
                id="update-value"
                type="number"
                value={bulkUpdateForm.value}
                onChange={(e) => setBulkUpdateForm(prev => ({ ...prev, value: Number(e.target.value) }))}
                placeholder="Enter value"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-reason">Reason for Update</Label>
              <Textarea
                id="update-reason"
                value={bulkUpdateForm.reason}
                onChange={(e) => setBulkUpdateForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Explain why you're updating prices..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="effective-date">Effective Date</Label>
              <Input
                id="effective-date"
                type="date"
                value={bulkUpdateForm.effectiveDate}
                onChange={(e) => setBulkUpdateForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate}>
              <Save className="h-4 w-4 mr-2" />
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Pricing Rule Dialog */}
      <Dialog open={showAddRuleDialog} onOpenChange={setShowAddRuleDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Pricing Rule</DialogTitle>
            <DialogDescription>
              Create a new pricing rule for products or categories.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter rule name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rule-type">Rule Type</Label>
                <Select 
                  value={ruleForm.type} 
                  onValueChange={(value) => setRuleForm(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markup">Markup Percentage</SelectItem>
                    <SelectItem value="margin">Margin Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="tiered">Tiered Pricing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-description">Description</Label>
              <Textarea
                id="rule-description"
                value={ruleForm.description}
                onChange={(e) => setRuleForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this pricing rule..."
                rows={2}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rule-value">Value</Label>
                <Input
                  id="rule-value"
                  type="number"
                  value={ruleForm.value}
                  onChange={(e) => setRuleForm(prev => ({ ...prev, value: Number(e.target.value) }))}
                  placeholder="Enter value"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rule-rounding">Rounding Rule</Label>
                <Select 
                  value={ruleForm.roundingRule} 
                  onValueChange={(value) => setRuleForm(prev => ({ ...prev, roundingRule: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Rounding</SelectItem>
                    <SelectItem value="nearest_10">Nearest 10</SelectItem>
                    <SelectItem value="nearest_100">Nearest 100</SelectItem>
                    <SelectItem value="nearest_1000">Nearest 1000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rule-min-price">Minimum Price</Label>
                <Input
                  id="rule-min-price"
                  type="number"
                  value={ruleForm.minPrice}
                  onChange={(e) => setRuleForm(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rule-max-price">Maximum Price</Label>
                <Input
                  id="rule-max-price"
                  type="number"
                  value={ruleForm.maxPrice}
                  onChange={(e) => setRuleForm(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="rule-active"
                checked={ruleForm.isActive}
                onCheckedChange={(checked) => setRuleForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="rule-active">Rule is active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRule}>
              <Settings className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tax Rate Dialog */}
      <Dialog open={showAddTaxDialog} onOpenChange={setShowAddTaxDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Tax Rate</DialogTitle>
            <DialogDescription>
              Create a new tax rate configuration.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tax-name">Tax Name</Label>
              <Input
                id="tax-name"
                value={taxForm.name}
                onChange={(e) => setTaxForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Standard VAT"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-description">Description</Label>
              <Input
                id="tax-description"
                value={taxForm.description}
                onChange={(e) => setTaxForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tax description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                value={taxForm.rate}
                onChange={(e) => setTaxForm(prev => ({ ...prev, rate: Number(e.target.value) }))}
                placeholder="18"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="tax-default"
                  checked={taxForm.isDefault}
                  onCheckedChange={(checked) => setTaxForm(prev => ({ ...prev, isDefault: checked }))}
                />
                <Label htmlFor="tax-default">Default tax rate</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="tax-active"
                  checked={taxForm.isActive}
                  onCheckedChange={(checked) => setTaxForm(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="tax-active">Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTaxDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTax}>
              <Percent className="h-4 w-4 mr-2" />
              Create Tax Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Discount Dialog */}
      <Dialog open={showAddDiscountDialog} onOpenChange={setShowAddDiscountDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Discount Rule</DialogTitle>
            <DialogDescription>
              Create a new discount rule for customers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="discount-name">Discount Name</Label>
                <Input
                  id="discount-name"
                  value={discountForm.name}
                  onChange={(e) => setDiscountForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter discount name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount-type">Discount Type</Label>
                <Select 
                  value={discountForm.type} 
                  onValueChange={(value) => setDiscountForm(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount-description">Description</Label>
              <Textarea
                id="discount-description"
                value={discountForm.description}
                onChange={(e) => setDiscountForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this discount..."
                rows={2}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="discount-value">Discount Value</Label>
                <Input
                  id="discount-value"
                  type="number"
                  value={discountForm.value}
                  onChange={(e) => setDiscountForm(prev => ({ ...prev, value: Number(e.target.value) }))}
                  placeholder="Enter value"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount-max">Max Discount Amount</Label>
                <Input
                  id="discount-max"
                  type="number"
                  value={discountForm.maxDiscountAmount}
                  onChange={(e) => setDiscountForm(prev => ({ ...prev, maxDiscountAmount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount-min-order">Min Order Amount</Label>
                <Input
                  id="discount-min-order"
                  type="number"
                  value={discountForm.minOrderAmount}
                  onChange={(e) => setDiscountForm(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="discount-coupon"
                  checked={discountForm.requiresCoupon}
                  onCheckedChange={(checked) => setDiscountForm(prev => ({ ...prev, requiresCoupon: checked }))}
                />
                <Label htmlFor="discount-coupon">Requires coupon code</Label>
              </div>

              {discountForm.requiresCoupon && (
                <div className="space-y-2">
                  <Label htmlFor="coupon-code">Coupon Code</Label>
                  <Input
                    id="coupon-code"
                    value={discountForm.couponCode}
                    onChange={(e) => setDiscountForm(prev => ({ ...prev, couponCode: e.target.value }))}
                    placeholder="SAVE2024"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="discount-start">Start Date</Label>
                <Input
                  id="discount-start"
                  type="date"
                  value={discountForm.startDate}
                  onChange={(e) => setDiscountForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discount-end">End Date</Label>
                <Input
                  id="discount-end"
                  type="date"
                  value={discountForm.endDate}
                  onChange={(e) => setDiscountForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDiscountDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDiscount}>
              <Percent className="h-4 w-4 mr-2" />
              Create Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
