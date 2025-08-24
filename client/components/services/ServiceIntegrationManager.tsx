import React, { useState, useCallback, useMemo } from 'react';
import { Settings, Wrench, Car, Shield, MessageCircle, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { useVisitTracking } from '../../context/VisitTrackingContext';
import { useJobCardIntegration } from '../../hooks/useJobCardIntegration';
import { JobCard, JobStatus, JobPriority } from '@shared/types';
import { ServiceRecord } from '../../services/customerDataService';
import { cn } from '../../lib/utils';

interface ServiceIntegrationManagerProps {
  customerId: string;
  customerName: string;
  visitId?: string;
  onServiceCreate?: (service: ServiceRecord) => void;
}

export const ServiceIntegrationManager: React.FC<ServiceIntegrationManagerProps> = ({
  customerId,
  customerName,
  visitId,
  onServiceCreate
}) => {
  const [selectedServiceType, setSelectedServiceType] = useState<'car' | 'tire' | 'consultation' | 'custom'>('car');
  const [isCreatingService, setIsCreatingService] = useState(false);
  
  const { addVisit, estimateExpectedLeave } = useVisitTracking();
  const { createJobCardWithTracking } = useJobCardIntegration();
  
  // Service templates for different types
  const serviceTemplates = useMemo(() => ({
    car: [
      {
        name: 'Oil Change',
        description: 'Complete engine oil and filter replacement',
        estimatedDuration: 60,
        estimatedCost: 75,
        tasks: ['Drain old oil', 'Replace oil filter', 'Add new oil', 'Check fluid levels'],
        materials: [
          { name: 'Engine Oil (5 quarts)', quantity: 1, unitPrice: 35 },
          { name: 'Oil Filter', quantity: 1, unitPrice: 15 }
        ]
      },
      {
        name: 'Brake Service',
        description: 'Brake inspection and pad replacement',
        estimatedDuration: 120,
        estimatedCost: 250,
        tasks: ['Inspect brake pads', 'Replace worn pads', 'Check brake fluid', 'Test brakes'],
        materials: [
          { name: 'Brake Pads (Set)', quantity: 1, unitPrice: 80 },
          { name: 'Brake Fluid', quantity: 1, unitPrice: 25 }
        ]
      },
      {
        name: 'Engine Diagnostic',
        description: 'Comprehensive engine diagnostic and troubleshooting',
        estimatedDuration: 90,
        estimatedCost: 120,
        tasks: ['Connect diagnostic scanner', 'Check error codes', 'Inspect engine components', 'Provide recommendations'],
        materials: []
      },
      {
        name: 'Transmission Service',
        description: 'Transmission fluid change and inspection',
        estimatedDuration: 180,
        estimatedCost: 200,
        tasks: ['Drain transmission fluid', 'Replace filter', 'Add new fluid', 'Test transmission'],
        materials: [
          { name: 'Transmission Fluid', quantity: 1, unitPrice: 60 },
          { name: 'Transmission Filter', quantity: 1, unitPrice: 40 }
        ]
      }
    ],
    tire: [
      {
        name: 'Tire Installation',
        description: 'Install new tires with balancing and alignment',
        estimatedDuration: 90,
        estimatedCost: 300,
        tasks: ['Remove old tires', 'Mount new tires', 'Balance wheels', 'Check alignment'],
        materials: [
          { name: 'Tire (Each)', quantity: 4, unitPrice: 120 },
          { name: 'Valve Stems', quantity: 4, unitPrice: 5 }
        ]
      },
      {
        name: 'Tire Rotation',
        description: 'Rotate tires for even wear',
        estimatedDuration: 30,
        estimatedCost: 50,
        tasks: ['Remove wheels', 'Rotate positions', 'Check tire pressure', 'Inspect for wear'],
        materials: []
      },
      {
        name: 'Tire Repair',
        description: 'Patch or plug tire puncture',
        estimatedDuration: 45,
        estimatedCost: 25,
        tasks: ['Locate puncture', 'Remove tire', 'Apply patch/plug', 'Reinstall and test'],
        materials: [
          { name: 'Tire Patch Kit', quantity: 1, unitPrice: 10 }
        ]
      },
      {
        name: 'Wheel Alignment',
        description: 'Adjust wheel alignment for optimal handling',
        estimatedDuration: 60,
        estimatedCost: 100,
        tasks: ['Check current alignment', 'Adjust camber/caster/toe', 'Test drive', 'Final inspection'],
        materials: []
      }
    ],
    consultation: [
      {
        name: 'Vehicle Inspection',
        description: 'Comprehensive vehicle safety and maintenance inspection',
        estimatedDuration: 60,
        estimatedCost: 80,
        tasks: ['Visual inspection', 'Check fluids', 'Test systems', 'Provide detailed report'],
        materials: []
      },
      {
        name: 'Estimate Consultation',
        description: 'Detailed cost estimate for repairs or maintenance',
        estimatedDuration: 30,
        estimatedCost: 0,
        tasks: ['Assess vehicle condition', 'Research parts costs', 'Calculate labor', 'Prepare written estimate'],
        materials: []
      },
      {
        name: 'Maintenance Planning',
        description: 'Develop long-term maintenance schedule',
        estimatedDuration: 45,
        estimatedCost: 50,
        tasks: ['Review service history', 'Assess current condition', 'Create maintenance plan', 'Schedule future services'],
        materials: []
      }
    ],
    custom: []
  }), []);
  
  // Handle service creation with full integration
  const handleCreateService = useCallback(async (template: any) => {
    setIsCreatingService(true);
    
    try {
      // Create job card with tracking integration
      const result = await createJobCardWithTracking({
        title: template.name,
        description: template.description,
        customerId,
        customer: {
          id: customerId,
          name: customerName,
          phone: '',
          customerType: 'individual',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        priority: JobPriority.NORMAL,
        tasks: template.tasks,
        materialsUsed: template.materials.map((material: any, index: number) => ({
          id: `material-${index}`,
          name: material.name,
          quantity: material.quantity,
          unitPrice: material.unitPrice,
          totalPrice: material.quantity * material.unitPrice,
          category: 'parts',
        })),
        estimatedCost: {
          laborCost: template.estimatedCost * 0.6, // 60% labor
          materialsCost: template.materials.reduce((sum: number, m: any) => sum + (m.quantity * m.unitPrice), 0),
          additionalCosts: 0,
          tax: (template.estimatedCost * 0.08), // 8% tax
        }
      }, visitId);
      
      if (result.success && result.jobCard) {
        // Create service record
        const serviceRecord: ServiceRecord = {
          id: result.jobCard.id,
          serviceType: selectedServiceType,
          serviceName: template.name,
          date: new Date().toISOString(),
          status: 'Pending',
          cost: template.estimatedCost,
          duration: template.estimatedDuration,
          jobCardId: result.jobCard.id,
          visitId: visitId,
          notes: template.description,
        };
        
        onServiceCreate?.(serviceRecord);
        
        // If no visit exists, create one for this service
        if (!visitId) {
          const newVisit = addVisit({
            customerId,
            customerName,
            visitType: 'Service',
            service: template.name,
            arrivedAt: new Date().toISOString(),
          });
          
          console.log('Created new visit for service:', newVisit);
        }
      }
    } catch (error) {
      console.error('Error creating service:', error);
    } finally {
      setIsCreatingService(false);
    }
  }, [customerId, customerName, visitId, selectedServiceType, createJobCardWithTracking, addVisit, onServiceCreate]);
  
  return (
    <div className="space-y-6">
      {/* Service Type Selection */}
      <Tabs value={selectedServiceType} onValueChange={(value) => setSelectedServiceType(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="car" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Car Services
          </TabsTrigger>
          <TabsTrigger value="tire" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Tire Services
          </TabsTrigger>
          <TabsTrigger value="consultation" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Consultations
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Custom
          </TabsTrigger>
        </TabsList>
        
        {/* Service Templates */}
        {(['car', 'tire', 'consultation'] as const).map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceTemplates[type].map((template, index) => (
                <ServiceTemplateCard
                  key={index}
                  template={template}
                  onSelect={() => handleCreateService(template)}
                  isCreating={isCreatingService}
                />
              ))}
            </div>
          </TabsContent>
        ))}
        
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Custom service creation will be available in a future update. 
                For now, please use one of the predefined service templates and modify as needed.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ServiceTemplateCardProps {
  template: any;
  onSelect: () => void;
  isCreating: boolean;
}

const ServiceTemplateCard: React.FC<ServiceTemplateCardProps> = ({
  template,
  onSelect,
  isCreating
}) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(template.estimatedDuration)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              {formatCurrency(template.estimatedCost)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{template.description}</p>
        
        {/* Tasks */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Included Tasks:</h4>
          <div className="space-y-1">
            {template.tasks.slice(0, 3).map((task: string, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-3 w-3 text-green-600" />
                {task}
              </div>
            ))}
            {template.tasks.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{template.tasks.length - 3} more tasks
              </div>
            )}
          </div>
        </div>
        
        {/* Materials */}
        {template.materials.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Materials Included:</h4>
            <div className="space-y-1">
              {template.materials.slice(0, 2).map((material: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{material.name}</span>
                  <span className="text-muted-foreground">
                    {material.quantity}x {formatCurrency(material.unitPrice)}
                  </span>
                </div>
              ))}
              {template.materials.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{template.materials.length - 2} more items
                </div>
              )}
            </div>
          </div>
        )}
        
        <Button 
          className="w-full" 
          disabled={isCreating}
          variant="default"
        >
          {isCreating ? 'Creating Service...' : 'Start This Service'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceIntegrationManager;
