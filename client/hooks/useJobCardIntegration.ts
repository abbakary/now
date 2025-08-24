import { useCallback, useEffect } from 'react';
import { JobCard, JobStatus } from '@shared/types';
import { handleJobCardStatusChange } from '@/services/invoiceService';
import { useVisitTracking } from '@/context/VisitTrackingContext';
import { toast } from '@/components/ui/use-toast';

/**
 * Hook for integrating job card status changes with invoice auto-generation
 * and visit tracking updates
 */
export const useJobCardIntegration = () => {
  const { updateExpectedLeave } = useVisitTracking();
  
  /**
   * Handles job card status changes and triggers appropriate integrations
   */
  const handleJobCardUpdate = useCallback(
    async (oldJobCard: JobCard, newJobCard: JobCard) => {
      try {
        // Auto-generate invoice if job was completed
        const invoice = handleJobCardStatusChange(oldJobCard, newJobCard);
        
        if (invoice) {
          toast({
            title: "Invoice Generated",
            description: `Invoice ${invoice.invoiceNumber} has been automatically generated for job ${newJobCard.jobNumber}`,
          });
          
          // In a real application, you would save the invoice to your backend here
          // Example: await saveInvoice(invoice);
        }
        
        // Update visit tracking if job completion affects expected leave time
        if (newJobCard.status === JobStatus.COMPLETED && oldJobCard.status !== JobStatus.COMPLETED) {
          // If job is completed, customer might leave earlier
          // Find related visit and potentially update expected leave time
          const relatedVisitId = findRelatedVisit(newJobCard);
          if (relatedVisitId) {
            // Reduce expected leave time since job is done
            updateExpectedLeave(relatedVisitId, { addMinutes: -30 });
            
            toast({
              title: "Visit Updated",
              description: "Expected leave time updated due to job completion",
            });
          }
        }
        
        // Handle other status changes
        if (newJobCard.status === JobStatus.WAITING_PARTS && oldJobCard.status !== JobStatus.WAITING_PARTS) {
          // Job is waiting for parts - might extend visit time
          const relatedVisitId = findRelatedVisit(newJobCard);
          if (relatedVisitId) {
            updateExpectedLeave(relatedVisitId, { addMinutes: 60 });
            
            toast({
              title: "Visit Extended",
              description: "Expected leave time extended due to waiting for parts",
              variant: "default",
            });
          }
        }
        
        return { success: true, invoice };
      } catch (error) {
        console.error('Error handling job card update:', error);
        toast({
          title: "Integration Error",
          description: "Failed to process job card update integrations",
          variant: "destructive",
        });
        return { success: false, error };
      }
    },
    [updateExpectedLeave]
  );
  
  /**
   * Creates a new job card with automatic visit tracking integration
   */
  const createJobCardWithTracking = useCallback(
    async (jobCardData: Partial<JobCard>, visitId?: string) => {
      try {
        // Generate job number
        const jobNumber = generateJobNumber();
        
        const newJobCard: JobCard = {
          id: generateUniqueId(),
          jobNumber,
          title: jobCardData.title || 'New Job',
          description: jobCardData.description || '',
          customerId: jobCardData.customerId || '',
          customer: jobCardData.customer!,
          assignedTechnicianId: jobCardData.assignedTechnicianId,
          assignedTechnician: jobCardData.assignedTechnician,
          createdBy: 'system', // In real app, this would be current user
          createdAt: new Date(),
          status: JobStatus.PENDING,
          priority: jobCardData.priority || 'normal',
          tasks: jobCardData.tasks || [],
          laborEntries: [],
          materialsUsed: [],
          attachments: [],
          notes: [],
          approvals: [],
          digitalSignatures: [],
          lastUpdatedBy: 'system',
          lastUpdatedAt: new Date(),
          ...jobCardData,
        } as JobCard;
        
        // If visitId is provided, extend the expected visit time
        if (visitId) {
          // Estimate additional time needed based on job complexity
          const estimatedHours = estimateJobDuration(newJobCard);
          const additionalMinutes = estimatedHours * 60;
          
          updateExpectedLeave(visitId, { addMinutes: additionalMinutes });
          
          toast({
            title: "Visit Time Extended",
            description: `Expected leave time extended by ${estimatedHours} hours for new job`,
          });
        }
        
        toast({
          title: "Job Card Created",
          description: `Job card ${jobNumber} has been created successfully`,
        });
        
        return { success: true, jobCard: newJobCard };
      } catch (error) {
        console.error('Error creating job card:', error);
        toast({
          title: "Creation Error",
          description: "Failed to create job card",
          variant: "destructive",
        });
        return { success: false, error };
      }
    },
    [updateExpectedLeave]
  );
  
  return {
    handleJobCardUpdate,
    createJobCardWithTracking,
  };
};

/**
 * Estimates job duration based on job card data
 */
const estimateJobDuration = (jobCard: JobCard): number => {
  // Basic estimation logic - in real app this would be more sophisticated
  let baseHours = 1; // Base time for any job
  
  // Add time based on number of tasks
  baseHours += jobCard.tasks.length * 0.5;
  
  // Add time based on materials complexity
  baseHours += jobCard.materialsUsed.length * 0.25;
  
  // Adjust based on priority
  if (jobCard.priority === 'urgent') {
    baseHours *= 0.8; // Urgent jobs might be done faster
  } else if (jobCard.priority === 'low') {
    baseHours *= 1.2; // Low priority might take longer
  }
  
  return Math.max(0.5, Math.min(8, baseHours)); // Between 30 minutes and 8 hours
};

/**
 * Finds a related visit for a job card
 */
const findRelatedVisit = (jobCard: JobCard): string | null => {
  // In real implementation, you would search through visits to find
  // one that matches the customer and is currently active
  // For now, return null as we don't have access to visits context here
  return null;
};

/**
 * Generates a unique job number
 */
const generateJobNumber = (): string => {
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `JOB-${year}-${random}`;
};

/**
 * Generates a unique ID
 */
const generateUniqueId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * Hook for auto-saving job card changes with integration
 */
export const useJobCardAutoSave = (jobCard: JobCard | null) => {
  const { handleJobCardUpdate } = useJobCardIntegration();
  
  useEffect(() => {
    if (!jobCard) return;
    
    // Auto-save logic would go here
    // For now, we just set up the integration handler
    const saveInterval = setInterval(async () => {
      // In real app, you would compare with last saved state
      // and call handleJobCardUpdate if there are changes
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearInterval(saveInterval);
  }, [jobCard, handleJobCardUpdate]);
};

/**
 * Hook for bulk job card operations with tracking integration
 */
export const useBulkJobCardOperations = () => {
  const { handleJobCardUpdate } = useJobCardIntegration();
  
  const updateMultipleJobCards = useCallback(
    async (updates: Array<{ oldJobCard: JobCard; newJobCard: JobCard }>) => {
      const results = [];
      
      for (const { oldJobCard, newJobCard } of updates) {
        const result = await handleJobCardUpdate(oldJobCard, newJobCard);
        results.push(result);
      }
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      toast({
        title: "Bulk Update Complete",
        description: `${successful} jobs updated successfully${failed > 0 ? `, ${failed} failed` : ''}`,
        variant: failed > 0 ? "destructive" : "default",
      });
      
      return results;
    },
    [handleJobCardUpdate]
  );
  
  return {
    updateMultipleJobCards,
  };
};

export default useJobCardIntegration;
