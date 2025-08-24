import { Customer, JobCard, ServiceOrder, JobStatus } from '@shared/types';
import { CustomerRecord } from '../context/CustomerStoreContext';
import { VisitRecord } from '../context/VisitTrackingContext';
import { Invoice } from './invoiceService';

/**
 * Comprehensive customer data integration service
 * Aggregates all customer-related data from different systems
 */

export interface UnifiedCustomerData {
  // Basic customer info
  customer: Customer;
  
  // Visit tracking data
  visitHistory: VisitRecord[];
  activeVisits: VisitRecord[];
  overdueVisits: VisitRecord[];
  visitStats: {
    totalVisits: number;
    serviceVisits: number;
    salesVisits: number;
    inquiryVisits: number;
    completedVisits: number;
    totalSalesAmount: number;
    averageVisitDuration: number;
    lastVisitDate?: string;
  };
  
  // Service history
  serviceHistory: {
    carServices: ServiceRecord[];
    tireServices: ServiceRecord[];
    consultations: ServiceRecord[];
    customServices: ServiceRecord[];
  };
  
  // Order and job card data
  orders: ServiceOrder[];
  jobCards: JobCard[];
  activeJobCards: JobCard[];
  completedJobCards: JobCard[];
  
  // Invoice data
  invoices: Invoice[];
  pendingInvoices: Invoice[];
  paidInvoices: Invoice[];
  totalRevenue: number;
  
  // Time tracking
  timeTracking: {
    totalHoursWorked: number;
    totalLaborCost: number;
    averageHourlyRate: number;
    recentTimeEntries: any[];
  };
  
  // Analytics
  analytics: {
    customerLifetimeValue: number;
    averageOrderValue: number;
    visitFrequency: string;
    preferredServices: string[];
    riskLevel: 'low' | 'medium' | 'high';
    satisfactionScore?: number;
  };
}

export interface ServiceRecord {
  id: string;
  serviceType: string;
  serviceName: string;
  date: string;
  status: string;
  cost: number;
  duration?: number;
  technician?: string;
  jobCardId?: string;
  invoiceId?: string;
  visitId?: string;
  notes?: string;
}

export interface SearchResult {
  type: 'customer' | 'service' | 'order' | 'invoice' | 'visit';
  id: string;
  title: string;
  subtitle: string;
  relevance: number;
  data: any;
  category: string;
  lastActivity?: string;
}

/**
 * Converts CustomerRecord to unified Customer format
 */
export const normalizeCustomerData = (customerRecord: CustomerRecord): Customer => {
  return {
    id: customerRecord.id,
    name: customerRecord.name,
    email: customerRecord.email || '',
    phone: customerRecord.phone || '',
    address: customerRecord.location || '',
    company: customerRecord.type === 'Private' ? undefined : customerRecord.name,
    customerType: customerRecord.type === 'Personal' ? 'individual' : 'business',
    notes: customerRecord.subType || '',
    createdAt: customerRecord.registeredDate ? new Date(customerRecord.registeredDate) : new Date(),
    updatedAt: customerRecord.lastVisit ? new Date(customerRecord.lastVisit) : new Date(),
  };
};

/**
 * Generates comprehensive customer profile
 */
export const generateUnifiedCustomerData = (
  customerId: string,
  customers: CustomerRecord[],
  visits: VisitRecord[],
  jobCards: JobCard[] = [],
  orders: ServiceOrder[] = [],
  invoices: Invoice[] = []
): UnifiedCustomerData => {
  
  const customerRecord = customers.find(c => c.id === customerId);
  if (!customerRecord) {
    throw new Error(`Customer not found: ${customerId}`);
  }
  
  const customer = normalizeCustomerData(customerRecord);
  
  // Filter customer-specific data
  const customerVisits = visits.filter(v => 
    v.customerId === customerId || v.customerName === customer.name
  );
  
  const customerJobCards = jobCards.filter(jc => jc.customerId === customerId);
  const customerOrders = orders.filter(o => o.customerId === customerId);
  const customerInvoices = invoices.filter(inv => inv.customerId === customerId);
  
  // Calculate visit statistics
  const visitStats = calculateVisitStats(customerVisits);
  
  // Categorize visits by status
  const activeVisits = customerVisits.filter(v => v.status === 'Active');
  const overdueVisits = customerVisits.filter(v => v.status === 'Overdue');
  
  // Generate service history from visits and job cards
  const serviceHistory = generateServiceHistory(customerVisits, customerJobCards);
  
  // Categorize job cards
  const activeJobCards = customerJobCards.filter(jc => 
    jc.status === JobStatus.IN_PROGRESS || jc.status === JobStatus.PENDING
  );
  const completedJobCards = customerJobCards.filter(jc => 
    jc.status === JobStatus.COMPLETED
  );
  
  // Calculate invoice statistics
  const pendingInvoices = customerInvoices.filter(inv => inv.status === 'pending');
  const paidInvoices = customerInvoices.filter(inv => inv.status === 'paid');
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  
  // Calculate time tracking data
  const timeTracking = calculateTimeTracking(customerJobCards);
  
  // Generate analytics
  const analytics = generateCustomerAnalytics(
    customer, customerVisits, customerJobCards, customerInvoices, totalRevenue
  );
  
  return {
    customer,
    visitHistory: customerVisits,
    activeVisits,
    overdueVisits,
    visitStats,
    serviceHistory,
    orders: customerOrders,
    jobCards: customerJobCards,
    activeJobCards,
    completedJobCards,
    invoices: customerInvoices,
    pendingInvoices,
    paidInvoices,
    totalRevenue,
    timeTracking,
    analytics,
  };
};

/**
 * Calculate visit statistics
 */
const calculateVisitStats = (visits: VisitRecord[]) => {
  const serviceVisits = visits.filter(v => v.visitType === 'Service');
  const salesVisits = visits.filter(v => v.visitType === 'Sales');
  const inquiryVisits = visits.filter(v => v.visitType === 'Ask');
  const completedVisits = visits.filter(v => v.status === 'Completed');
  
  const totalSalesAmount = salesVisits.reduce((sum, visit) => 
    sum + (visit.salesDetails?.amount || 0), 0
  );
  
  const averageVisitDuration = completedVisits.length > 0 
    ? completedVisits.reduce((sum, visit) => {
        if (visit.leftAt && visit.arrivedAt) {
          const duration = new Date(visit.leftAt).getTime() - new Date(visit.arrivedAt).getTime();
          return sum + (duration / (1000 * 60)); // minutes
        }
        return sum;
      }, 0) / completedVisits.length
    : 0;
  
  const lastVisitDate = visits.length > 0 
    ? visits.sort((a, b) => new Date(b.arrivedAt).getTime() - new Date(a.arrivedAt).getTime())[0].arrivedAt
    : undefined;
  
  return {
    totalVisits: visits.length,
    serviceVisits: serviceVisits.length,
    salesVisits: salesVisits.length,
    inquiryVisits: inquiryVisits.length,
    completedVisits: completedVisits.length,
    totalSalesAmount,
    averageVisitDuration,
    lastVisitDate,
  };
};

/**
 * Generate service history from visits and job cards
 */
const generateServiceHistory = (visits: VisitRecord[], jobCards: JobCard[]) => {
  const serviceHistory = {
    carServices: [] as ServiceRecord[],
    tireServices: [] as ServiceRecord[],
    consultations: [] as ServiceRecord[],
    customServices: [] as ServiceRecord[],
  };
  
  // Add services from visits
  visits.forEach(visit => {
    if (visit.visitType === 'Service' && visit.service) {
      const serviceRecord: ServiceRecord = {
        id: visit.id,
        serviceType: categorizeService(visit.service),
        serviceName: visit.service,
        date: visit.arrivedAt,
        status: visit.status,
        cost: visit.salesDetails?.amount || 0,
        visitId: visit.id,
        notes: visit.notes,
      };
      
      // Categorize service
      if (serviceRecord.serviceType === 'tire') {
        serviceHistory.tireServices.push(serviceRecord);
      } else if (serviceRecord.serviceType === 'car') {
        serviceHistory.carServices.push(serviceRecord);
      } else if (serviceRecord.serviceType === 'consultation') {
        serviceHistory.consultations.push(serviceRecord);
      } else {
        serviceHistory.customServices.push(serviceRecord);
      }
    }
  });
  
  // Add services from job cards
  jobCards.forEach(jobCard => {
    const serviceRecord: ServiceRecord = {
      id: jobCard.id,
      serviceType: categorizeJobCardService(jobCard),
      serviceName: jobCard.title,
      date: jobCard.createdAt.toISOString(),
      status: jobCard.status,
      cost: jobCard.actualCost?.total || jobCard.estimatedCost?.total || 0,
      duration: jobCard.laborEntries.reduce((sum, entry) => sum + entry.hours, 0),
      technician: jobCard.assignedTechnician?.name,
      jobCardId: jobCard.id,
      invoiceId: jobCard.invoiceId,
      notes: jobCard.notes.join('; '),
    };
    
    // Avoid duplicates and categorize
    const existingService = Object.values(serviceHistory).flat()
      .find(s => s.jobCardId === jobCard.id);
    
    if (!existingService) {
      if (serviceRecord.serviceType === 'tire') {
        serviceHistory.tireServices.push(serviceRecord);
      } else if (serviceRecord.serviceType === 'car') {
        serviceHistory.carServices.push(serviceRecord);
      } else if (serviceRecord.serviceType === 'consultation') {
        serviceHistory.consultations.push(serviceRecord);
      } else {
        serviceHistory.customServices.push(serviceRecord);
      }
    }
  });
  
  return serviceHistory;
};

/**
 * Categorize service based on service name
 */
const categorizeService = (serviceName: string): string => {
  const tireKeywords = ['tire', 'tyre', 'wheel', 'rim'];
  const carKeywords = ['oil', 'engine', 'brake', 'transmission', 'ac', 'battery'];
  const consultationKeywords = ['consultation', 'advice', 'estimate', 'inspection'];
  
  const service = serviceName.toLowerCase();
  
  if (tireKeywords.some(keyword => service.includes(keyword))) {
    return 'tire';
  } else if (carKeywords.some(keyword => service.includes(keyword))) {
    return 'car';
  } else if (consultationKeywords.some(keyword => service.includes(keyword))) {
    return 'consultation';
  }
  
  return 'custom';
};

/**
 * Categorize job card service type
 */
const categorizeJobCardService = (jobCard: JobCard): string => {
  // Check asset type first
  if (jobCard.asset?.type === 'vehicle') {
    return 'car';
  }
  
  // Check service description
  return categorizeService(jobCard.title + ' ' + jobCard.description);
};

/**
 * Calculate time tracking statistics
 */
const calculateTimeTracking = (jobCards: JobCard[]) => {
  const allLaborEntries = jobCards.flatMap(jc => jc.laborEntries);
  
  const totalHoursWorked = allLaborEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalLaborCost = allLaborEntries.reduce((sum, entry) => 
    sum + (entry.hours * entry.hourlyRate), 0
  );
  
  const averageHourlyRate = allLaborEntries.length > 0 
    ? allLaborEntries.reduce((sum, entry) => sum + entry.hourlyRate, 0) / allLaborEntries.length
    : 0;
  
  const recentTimeEntries = allLaborEntries
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 10);
  
  return {
    totalHoursWorked,
    totalLaborCost,
    averageHourlyRate,
    recentTimeEntries,
  };
};

/**
 * Generate customer analytics
 */
const generateCustomerAnalytics = (
  customer: Customer,
  visits: VisitRecord[],
  jobCards: JobCard[],
  invoices: Invoice[],
  totalRevenue: number
) => {
  const customerLifetimeValue = totalRevenue;
  
  const averageOrderValue = invoices.length > 0 
    ? totalRevenue / invoices.length 
    : 0;
  
  // Calculate visit frequency
  const firstVisit = visits.length > 0 
    ? visits.sort((a, b) => new Date(a.arrivedAt).getTime() - new Date(b.arrivedAt).getTime())[0]
    : null;
  
  let visitFrequency = 'New Customer';
  if (firstVisit && visits.length > 1) {
    const daysSinceFirst = (Date.now() - new Date(firstVisit.arrivedAt).getTime()) / (1000 * 60 * 60 * 24);
    const frequency = visits.length / (daysSinceFirst / 30); // visits per month
    
    if (frequency > 2) visitFrequency = 'Very Regular';
    else if (frequency > 1) visitFrequency = 'Regular';
    else if (frequency > 0.5) visitFrequency = 'Occasional';
    else visitFrequency = 'Infrequent';
  }
  
  // Identify preferred services
  const serviceCount = new Map<string, number>();
  visits.forEach(visit => {
    if (visit.service) {
      serviceCount.set(visit.service, (serviceCount.get(visit.service) || 0) + 1);
    }
  });
  
  const preferredServices = Array.from(serviceCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([service]) => service);
  
  // Calculate risk level based on overdue visits and payment history
  const overdueVisits = visits.filter(v => v.status === 'Overdue').length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
  
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (overdueVisits > 2 || overdueInvoices > 1) {
    riskLevel = 'high';
  } else if (overdueVisits > 0 || overdueInvoices > 0) {
    riskLevel = 'medium';
  }
  
  return {
    customerLifetimeValue,
    averageOrderValue,
    visitFrequency,
    preferredServices,
    riskLevel,
  };
};

/**
 * Global search across all customer data
 */
export const globalSearch = (
  searchTerm: string,
  customers: CustomerRecord[],
  visits: VisitRecord[],
  jobCards: JobCard[] = [],
  orders: ServiceOrder[] = [],
  invoices: Invoice[] = []
): SearchResult[] => {
  const results: SearchResult[] = [];
  const term = searchTerm.toLowerCase().trim();
  
  if (!term) return results;
  
  // Search customers
  customers.forEach(customer => {
    const relevance = calculateCustomerRelevance(customer, term);
    if (relevance > 0) {
      results.push({
        type: 'customer',
        id: customer.id,
        title: customer.name,
        subtitle: `${customer.type} - ${customer.phone || customer.email || ''}`,
        relevance,
        data: customer,
        category: 'Customer',
        lastActivity: customer.lastVisit,
      });
    }
  });
  
  // Search visits
  visits.forEach(visit => {
    const relevance = calculateVisitRelevance(visit, term);
    if (relevance > 0) {
      results.push({
        type: 'visit',
        id: visit.id,
        title: `${visit.customerName} - ${visit.visitType}`,
        subtitle: `${visit.service || 'General'} - ${visit.status}`,
        relevance,
        data: visit,
        category: 'Visit',
        lastActivity: visit.arrivedAt,
      });
    }
  });
  
  // Search job cards
  jobCards.forEach(jobCard => {
    const relevance = calculateJobCardRelevance(jobCard, term);
    if (relevance > 0) {
      results.push({
        type: 'order',
        id: jobCard.id,
        title: jobCard.title,
        subtitle: `${jobCard.jobNumber} - ${jobCard.status}`,
        relevance,
        data: jobCard,
        category: 'Job Card',
        lastActivity: jobCard.lastUpdatedAt.toISOString(),
      });
    }
  });
  
  // Search invoices
  invoices.forEach(invoice => {
    const relevance = calculateInvoiceRelevance(invoice, term);
    if (relevance > 0) {
      results.push({
        type: 'invoice',
        id: invoice.id,
        title: invoice.invoiceNumber,
        subtitle: `$${invoice.total.toFixed(2)} - ${invoice.status}`,
        relevance,
        data: invoice,
        category: 'Invoice',
        lastActivity: invoice.issueDate.toISOString(),
      });
    }
  });
  
  // Sort by relevance and recency
  return results.sort((a, b) => {
    if (b.relevance !== a.relevance) {
      return b.relevance - a.relevance;
    }
    return new Date(b.lastActivity || 0).getTime() - new Date(a.lastActivity || 0).getTime();
  });
};

/**
 * Calculate customer relevance score
 */
const calculateCustomerRelevance = (customer: CustomerRecord, term: string): number => {
  let score = 0;
  
  if (customer.name.toLowerCase().includes(term)) score += 10;
  if (customer.id.toLowerCase().includes(term)) score += 8;
  if (customer.email?.toLowerCase().includes(term)) score += 6;
  if (customer.phone?.includes(term)) score += 6;
  if (customer.type.toLowerCase().includes(term)) score += 4;
  if (customer.location?.toLowerCase().includes(term)) score += 3;
  if (customer.subType?.toLowerCase().includes(term)) score += 2;
  
  return score;
};

/**
 * Calculate visit relevance score
 */
const calculateVisitRelevance = (visit: VisitRecord, term: string): number => {
  let score = 0;
  
  if (visit.customerName.toLowerCase().includes(term)) score += 8;
  if (visit.service?.toLowerCase().includes(term)) score += 10;
  if (visit.visitType.toLowerCase().includes(term)) score += 6;
  if (visit.status.toLowerCase().includes(term)) score += 4;
  if (visit.notes?.toLowerCase().includes(term)) score += 3;
  if (visit.location?.toLowerCase().includes(term)) score += 2;
  
  return score;
};

/**
 * Calculate job card relevance score
 */
const calculateJobCardRelevance = (jobCard: JobCard, term: string): number => {
  let score = 0;
  
  if (jobCard.title.toLowerCase().includes(term)) score += 10;
  if (jobCard.jobNumber.toLowerCase().includes(term)) score += 8;
  if (jobCard.description.toLowerCase().includes(term)) score += 6;
  if (jobCard.customer.name.toLowerCase().includes(term)) score += 6;
  if (jobCard.status.toLowerCase().includes(term)) score += 4;
  if (jobCard.assignedTechnician?.name.toLowerCase().includes(term)) score += 4;
  
  // Search in tasks
  jobCard.tasks.forEach(task => {
    if (task.toLowerCase().includes(term)) score += 3;
  });
  
  // Search in materials
  jobCard.materialsUsed.forEach(material => {
    if (material.name.toLowerCase().includes(term)) score += 3;
  });
  
  return score;
};

/**
 * Calculate invoice relevance score
 */
const calculateInvoiceRelevance = (invoice: Invoice, term: string): number => {
  let score = 0;
  
  if (invoice.invoiceNumber.toLowerCase().includes(term)) score += 10;
  if (invoice.status.toLowerCase().includes(term)) score += 6;
  if (invoice.total.toString().includes(term)) score += 4;
  
  // Search in items
  invoice.items.forEach(item => {
    if (item.description.toLowerCase().includes(term)) score += 3;
  });
  
  return score;
};

export default {
  generateUnifiedCustomerData,
  globalSearch,
  normalizeCustomerData,
};
