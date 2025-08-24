import React, { useState, useCallback, useMemo } from 'react';
import { Search, Plus, Filter, FileText, Clock, DollarSign, User, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { JobCard, JobStatus, JobPriority } from '@shared/types';
import { useJobCardIntegration } from '@/hooks/useJobCardIntegration';
import { useCustomerStore } from '@/context/CustomerStoreContext';
import { useVisitTracking } from '@/context/VisitTrackingContext';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

/**
 * Enhanced Job Cards page with auto-invoice integration and tracking
 */
export default function EnhancedJobCards() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<JobStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<JobPriority | 'all'>('all');
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  const { customers } = useCustomerStore();
  const { visits } = useVisitTracking();
  const { handleJobCardUpdate, createJobCardWithTracking } = useJobCardIntegration();
  
  // Mock job cards data (in real app, this would come from an API or context)
  const [jobCards, setJobCards] = useState<JobCard[]>([
    // Sample data would be loaded here
  ]);
  
  // Calculate job card statistics
  const jobCardStats = useMemo(() => {
    const stats = {
      total: jobCards.length,
      pending: jobCards.filter(jc => jc.status === JobStatus.PENDING).length,
      inProgress: jobCards.filter(jc => jc.status === JobStatus.IN_PROGRESS).length,
      completed: jobCards.filter(jc => jc.status === JobStatus.COMPLETED).length,
      onHold: jobCards.filter(jc => jc.status === JobStatus.ON_HOLD).length,
      waitingParts: jobCards.filter(jc => jc.status === JobStatus.WAITING_PARTS).length,
      totalRevenue: 0,
      avgCompletion: 0,
    };
    
    const completedJobCards = jobCards.filter(jc => jc.status === JobStatus.COMPLETED);
    stats.totalRevenue = completedJobCards.reduce((sum, jc) => 
      sum + (jc.actualCost?.total || jc.estimatedCost?.total || 0), 0
    );
    
    if (completedJobCards.length > 0) {
      const totalDays = completedJobCards.reduce((sum, jc) => {
        if (jc.actualCompletionDate && jc.actualStartDate) {
          const days = (jc.actualCompletionDate.getTime() - jc.actualStartDate.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }
        return sum;
      }, 0);
      stats.avgCompletion = totalDays / completedJobCards.length;
    }
    
    return stats;
  }, [jobCards]);
  
  // Filter job cards
  const filteredJobCards = useMemo(() => {
    let filtered = jobCards;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(jc => 
        jc.title.toLowerCase().includes(term) ||
        jc.jobNumber.toLowerCase().includes(term) ||
        jc.customer.name.toLowerCase().includes(term) ||
        jc.description.toLowerCase().includes(term)
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(jc => jc.status === filterStatus);
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(jc => jc.priority === filterPriority);
    }
    
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [jobCards, searchTerm, filterStatus, filterPriority]);
  
  // Handle job card status change with auto-invoice integration
  const handleStatusChange = useCallback(async (jobCard: JobCard, newStatus: JobStatus) => {
    const oldJobCard = { ...jobCard };
    const newJobCard = { 
      ...jobCard, 
      status: newStatus,
      lastUpdatedAt: new Date(),
      lastUpdatedBy: 'current-user' // In real app, get from auth context
    };
    
    // If completing the job, also set actual completion date
    if (newStatus === JobStatus.COMPLETED && oldJobCard.status !== JobStatus.COMPLETED) {
      newJobCard.actualCompletionDate = new Date();
    }
    
    try {
      // Use the integration hook to handle status change and auto-invoice generation
      const result = await handleJobCardUpdate(oldJobCard, newJobCard);
      
      if (result.success) {
        // Update the job card in state
        setJobCards(prev => prev.map(jc => 
          jc.id === jobCard.id ? newJobCard : jc
        ));
        
        if (result.invoice) {
          toast({
            title: "Job Completed & Invoice Generated",
            description: `Job ${jobCard.jobNumber} completed and invoice ${result.invoice.invoiceNumber} generated automatically.`,
          });
        } else {
          toast({
            title: "Job Status Updated",
            description: `Job ${jobCard.jobNumber} status changed to ${newStatus}`,
          });
        }
      }
    } catch (error) {
      console.error('Error updating job card status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update job card status. Please try again.",
        variant: "destructive",
      });
    }
  }, [handleJobCardUpdate]);
  
  // Create a new job card
  const handleCreateJobCard = useCallback(async (jobCardData: Partial<JobCard>) => {
    try {
      const result = await createJobCardWithTracking(jobCardData);
      
      if (result.success && result.jobCard) {
        setJobCards(prev => [result.jobCard!, ...prev]);
        toast({
          title: "Job Card Created",
          description: `Job card ${result.jobCard.jobNumber} created successfully`,
        });
      }
    } catch (error) {
      console.error('Error creating job card:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create job card. Please try again.",
        variant: "destructive",
      });
    }
  }, [createJobCardWithTracking]);
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Get status color
  const getStatusColor = (status: JobStatus): string => {
    switch (status) {
      case JobStatus.PENDING: return 'bg-yellow-500';
      case JobStatus.IN_PROGRESS: return 'bg-blue-500';
      case JobStatus.COMPLETED: return 'bg-green-500';
      case JobStatus.ON_HOLD: return 'bg-orange-500';
      case JobStatus.WAITING_PARTS: return 'bg-purple-500';
      case JobStatus.WAITING_APPROVAL: return 'bg-indigo-500';
      case JobStatus.CANCELLED: return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority: JobPriority): string => {
    switch (priority) {
      case JobPriority.LOW: return 'text-gray-600';
      case JobPriority.NORMAL: return 'text-blue-600';
      case JobPriority.HIGH: return 'text-orange-600';
      case JobPriority.URGENT: return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Cards</h1>
          <p className="text-muted-foreground">
            Manage service job cards with auto-invoice generation and tracking integration
          </p>
        </div>
        <Button onClick={() => {/* Handle create new job card */}}>
          <Plus className="h-4 w-4 mr-2" />
          New Job Card
        </Button>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Job Cards</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{jobCardStats.total}</p>
                  <Badge variant="secondary" className="ml-2">
                    {jobCardStats.inProgress} Active
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{jobCardStats.completed}</p>
                  <div className="ml-2">
                    <Progress 
                      value={jobCardStats.total > 0 ? (jobCardStats.completed / jobCardStats.total) * 100 : 0} 
                      className="w-16 h-2" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(jobCardStats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">{jobCardStats.avgCompletion.toFixed(1)} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search job cards, customers, descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={JobStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={JobStatus.IN_PROGRESS}>In Progress</SelectItem>
            <SelectItem value={JobStatus.COMPLETED}>Completed</SelectItem>
            <SelectItem value={JobStatus.ON_HOLD}>On Hold</SelectItem>
            <SelectItem value={JobStatus.WAITING_PARTS}>Waiting Parts</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as any)}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value={JobPriority.LOW}>Low</SelectItem>
            <SelectItem value={JobPriority.NORMAL}>Normal</SelectItem>
            <SelectItem value={JobPriority.HIGH}>High</SelectItem>
            <SelectItem value={JobPriority.URGENT}>Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Job Cards List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {filteredJobCards.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Job Cards Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'Create your first job card to get started.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredJobCards.map((jobCard) => (
              <JobCardItem
                key={jobCard.id}
                jobCard={jobCard}
                onStatusChange={handleStatusChange}
                onViewDetails={(jc) => {
                  setSelectedJobCard(jc);
                  setIsDetailsDialogOpen(true);
                }}
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
              />
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Job Card Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Job Card Details - {selectedJobCard?.jobNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedJobCard && (
            <JobCardDetails 
              jobCard={selectedJobCard}
              onStatusChange={handleStatusChange}
              formatCurrency={formatCurrency}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface JobCardItemProps {
  jobCard: JobCard;
  onStatusChange: (jobCard: JobCard, newStatus: JobStatus) => void;
  onViewDetails: (jobCard: JobCard) => void;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: JobStatus) => string;
  getPriorityColor: (priority: JobPriority) => string;
}

const JobCardItem: React.FC<JobCardItemProps> = ({
  jobCard,
  onStatusChange,
  onViewDetails,
  formatCurrency,
  getStatusColor,
  getPriorityColor
}) => {
  const totalCost = jobCard.actualCost?.total || jobCard.estimatedCost?.total || 0;
  const progressPercentage = calculateJobProgress(jobCard);
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{jobCard.title}</h4>
              <Badge variant="outline" className="text-xs">
                {jobCard.jobNumber}
              </Badge>
              <div className={cn(
                "w-2 h-2 rounded-full",
                getStatusColor(jobCard.status)
              )} />
              <Badge variant="secondary" className="text-xs">
                {jobCard.status.replace('_', ' ')}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn("text-xs", getPriorityColor(jobCard.priority))}
              >
                {jobCard.priority}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Customer: {jobCard.customer.name}</p>
              <p>Created: {jobCard.createdAt.toLocaleDateString()}</p>
              {jobCard.assignedTechnician && (
                <p>Technician: {jobCard.assignedTechnician.name}</p>
              )}
              <p className="truncate">Description: {jobCard.description}</p>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>
          
          <div className="text-right space-y-2">
            <div className="text-lg font-semibold">{formatCurrency(totalCost)}</div>
            
            {/* Quick status change buttons */}
            <div className="flex flex-col gap-1">
              {jobCard.status === JobStatus.PENDING && (
                <Button 
                  size="sm" 
                  onClick={() => onStatusChange(jobCard, JobStatus.IN_PROGRESS)}
                >
                  Start
                </Button>
              )}
              {jobCard.status === JobStatus.IN_PROGRESS && (
                <Button 
                  size="sm"
                  onClick={() => onStatusChange(jobCard, JobStatus.COMPLETED)}
                >
                  Complete
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onViewDetails(jobCard)}
              >
                Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface JobCardDetailsProps {
  jobCard: JobCard;
  onStatusChange: (jobCard: JobCard, newStatus: JobStatus) => void;
  formatCurrency: (amount: number) => string;
}

const JobCardDetails: React.FC<JobCardDetailsProps> = ({
  jobCard,
  onStatusChange,
  formatCurrency
}) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Job Information</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Job Number:</strong> {jobCard.jobNumber}</div>
            <div><strong>Title:</strong> {jobCard.title}</div>
            <div><strong>Status:</strong> {jobCard.status}</div>
            <div><strong>Priority:</strong> {jobCard.priority}</div>
            <div><strong>Created:</strong> {jobCard.createdAt.toLocaleDateString()}</div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Customer & Assignment</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Customer:</strong> {jobCard.customer.name}</div>
            <div><strong>Phone:</strong> {jobCard.customer.phone}</div>
            {jobCard.assignedTechnician && (
              <div><strong>Technician:</strong> {jobCard.assignedTechnician.name}</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tasks */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Tasks</h3>
        <div className="space-y-2">
          {jobCard.tasks.map((task, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">{task}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Materials */}
      {jobCard.materialsUsed.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Materials</h3>
          <div className="space-y-2">
            {jobCard.materialsUsed.map((material) => (
              <div key={material.id} className="flex items-center justify-between text-sm">
                <span>{material.name}</span>
                <span>{material.quantity}x {formatCurrency(material.unitPrice)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Cost Information */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Cost Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobCard.estimatedCost && (
            <div>
              <h4 className="font-medium">Estimated Cost</h4>
              <div className="space-y-1 text-sm">
                <div>Labor: {formatCurrency(jobCard.estimatedCost.laborCost)}</div>
                <div>Materials: {formatCurrency(jobCard.estimatedCost.materialsCost)}</div>
                <div>Tax: {formatCurrency(jobCard.estimatedCost.tax)}</div>
                <div className="font-semibold">Total: {formatCurrency(jobCard.estimatedCost.total)}</div>
              </div>
            </div>
          )}
          
          {jobCard.actualCost && (
            <div>
              <h4 className="font-medium">Actual Cost</h4>
              <div className="space-y-1 text-sm">
                <div>Labor: {formatCurrency(jobCard.actualCost.laborCost)}</div>
                <div>Materials: {formatCurrency(jobCard.actualCost.materialsCost)}</div>
                <div>Tax: {formatCurrency(jobCard.actualCost.tax)}</div>
                <div className="font-semibold">Total: {formatCurrency(jobCard.actualCost.total)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Change Actions */}
      <div className="flex gap-2 pt-4 border-t">
        {Object.values(JobStatus).map((status) => (
          <Button
            key={status}
            variant={jobCard.status === status ? "default" : "outline"}
            size="sm"
            onClick={() => onStatusChange(jobCard, status)}
            disabled={jobCard.status === status}
          >
            {status.replace('_', ' ')}
          </Button>
        ))}
      </div>
    </div>
  );
};

/**
 * Calculate job progress percentage based on completion status
 */
const calculateJobProgress = (jobCard: JobCard): number => {
  switch (jobCard.status) {
    case JobStatus.PENDING: return 0;
    case JobStatus.IN_PROGRESS: return 50;
    case JobStatus.WAITING_APPROVAL: return 75;
    case JobStatus.WAITING_PARTS: return 60;
    case JobStatus.ON_HOLD: return 40;
    case JobStatus.COMPLETED: return 100;
    case JobStatus.CANCELLED: return 0;
    default: return 0;
  }
};
