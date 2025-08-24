import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Clock, Play, Pause, Square, Calendar, User, DollarSign, BarChart3, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { LaborEntry, JobCard } from '@shared/types';
import { useVisitTracking } from '../../context/VisitTrackingContext';
import { useCustomerStore } from '../../context/CustomerStoreContext';
import { toast } from '../ui/use-toast';
import { cn } from '../../lib/utils';

interface TimeTrackingIntegrationProps {
  customerId?: string;
  jobCardId?: string;
  visitId?: string;
  onTimeEntryCreate?: (entry: LaborEntry) => void;
  onTimeEntryUpdate?: (entry: LaborEntry) => void;
  className?: string;
}

interface ActiveTimer {
  id: string;
  startTime: Date;
  description: string;
  hourlyRate: number;
  technicianId: string;
  technicianName: string;
  jobCardId?: string;
  visitId?: string;
}

interface TimeEntry extends Omit<LaborEntry, 'startTime' | 'endTime'> {
  startTime: string; // ISO string
  endTime: string; // ISO string
  date: string;
  category: 'service' | 'consultation' | 'diagnostic' | 'repair' | 'maintenance';
}

export const TimeTrackingIntegration: React.FC<TimeTrackingIntegrationProps> = ({
  customerId,
  jobCardId,
  visitId,
  onTimeEntryCreate,
  onTimeEntryUpdate,
  className
}) => {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('current-user');
  const [hourlyRate, setHourlyRate] = useState<number>(85);
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<'service' | 'consultation' | 'diagnostic' | 'repair' | 'maintenance'>('service');
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  
  const { visits, updateExpectedLeave } = useVisitTracking();
  const { customers } = useCustomerStore();
  
  // Mock technicians (in real app, this would come from an API or context)
  const technicians = [
    { id: 'current-user', name: 'Current User', hourlyRate: 85 },
    { id: 'tech-1', name: 'John Smith', hourlyRate: 90 },
    { id: 'tech-2', name: 'Jane Doe', hourlyRate: 80 },
    { id: 'tech-3', name: 'Mike Johnson', hourlyRate: 95 },
  ];
  
  // Calculate time tracking statistics
  const timeStats = useMemo(() => {
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const totalCost = timeEntries.reduce((sum, entry) => sum + (entry.hours * entry.hourlyRate), 0);
    const averageRate = timeEntries.length > 0 
      ? timeEntries.reduce((sum, entry) => sum + entry.hourlyRate, 0) / timeEntries.length 
      : 0;
    
    const categoriesStats = timeEntries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.hours;
      return acc;
    }, {} as Record<string, number>);
    
    const today = new Date().toDateString();
    const todayEntries = timeEntries.filter(entry => new Date(entry.date).toDateString() === today);
    const todayHours = todayEntries.reduce((sum, entry) => sum + entry.hours, 0);
    
    return {
      totalHours,
      totalCost,
      averageRate,
      categoriesStats,
      todayHours,
      entriesCount: timeEntries.length,
    };
  }, [timeEntries]);
  
  // Get current timer duration
  const currentTimerDuration = useMemo(() => {
    if (!activeTimer) return 0;
    return (Date.now() - activeTimer.startTime.getTime()) / (1000 * 60 * 60); // hours
  }, [activeTimer]);
  
  // Update timer every second when active
  useEffect(() => {
    if (!activeTimer) return;
    
    const interval = setInterval(() => {
      // Force re-render to update timer display
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeTimer]);
  
  // Start timer
  const startTimer = useCallback(() => {
    if (activeTimer) {
      toast({
        title: "Timer Already Running",
        description: "Please stop the current timer before starting a new one.",
        variant: "destructive",
      });
      return;
    }
    
    const technician = technicians.find(t => t.id === selectedTechnician);
    if (!technician) return;
    
    const timer: ActiveTimer = {
      id: `timer-${Date.now()}`,
      startTime: new Date(),
      description: description || 'Service work',
      hourlyRate: hourlyRate,
      technicianId: technician.id,
      technicianName: technician.name,
      jobCardId,
      visitId,
    };
    
    setActiveTimer(timer);
    
    toast({
      title: "Timer Started",
      description: `Started tracking time for ${technician.name}`,
    });
  }, [selectedTechnician, hourlyRate, description, jobCardId, visitId]);
  
  // Pause/Resume timer
  const toggleTimer = useCallback(() => {
    if (!activeTimer) return;
    
    // For now, we'll just show a message. In a real app, you might pause the timer
    toast({
      title: "Timer Control",
      description: "Timer pause/resume feature coming soon",
    });
  }, [activeTimer]);
  
  // Stop timer and create time entry
  const stopTimer = useCallback(() => {
    if (!activeTimer) return;
    
    const endTime = new Date();
    const duration = (endTime.getTime() - activeTimer.startTime.getTime()) / (1000 * 60 * 60); // hours
    
    const timeEntry: TimeEntry = {
      id: `entry-${Date.now()}`,
      technicianId: activeTimer.technicianId,
      technicianName: activeTimer.technicianName,
      startTime: activeTimer.startTime.toISOString(),
      endTime: endTime.toISOString(),
      hours: duration,
      hourlyRate: activeTimer.hourlyRate,
      description: activeTimer.description,
      isApproved: false,
      date: new Date().toISOString().split('T')[0],
      category: category,
    };
    
    setTimeEntries(prev => [timeEntry, ...prev]);
    setActiveTimer(null);
    setDescription('');
    
    // Create labor entry for job card integration
    const laborEntry: LaborEntry = {
      id: timeEntry.id,
      technicianId: timeEntry.technicianId,
      technicianName: timeEntry.technicianName,
      startTime: new Date(timeEntry.startTime),
      endTime: new Date(timeEntry.endTime),
      hours: timeEntry.hours,
      hourlyRate: timeEntry.hourlyRate,
      description: timeEntry.description,
      isApproved: timeEntry.isApproved,
    };
    
    onTimeEntryCreate?.(laborEntry);
    
    // Update visit expected leave time if this time entry affects it
    if (visitId && duration > 0.5) { // If more than 30 minutes of work
      updateExpectedLeave(visitId, { addMinutes: Math.ceil(duration * 60) });
    }
    
    toast({
      title: "Time Entry Created",
      description: `Recorded ${duration.toFixed(2)} hours of work`,
    });
  }, [activeTimer, category, onTimeEntryCreate, visitId, updateExpectedLeave]);
  
  // Format duration
  const formatDuration = (hours: number): string => {
    const totalMinutes = Math.floor(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Get category color
  const getCategoryColor = (cat: string): string => {
    switch (cat) {
      case 'service': return 'bg-blue-500';
      case 'consultation': return 'bg-green-500';
      case 'diagnostic': return 'bg-yellow-500';
      case 'repair': return 'bg-red-500';
      case 'maintenance': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Active Timer */}
      {activeTimer && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary animate-pulse" />
              Active Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{activeTimer.description}</h4>
                <p className="text-sm text-muted-foreground">
                  {activeTimer.technicianName} • {formatCurrency(activeTimer.hourlyRate)}/hr
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {formatDuration(currentTimerDuration)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Started: {activeTimer.startTime.toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={toggleTimer} variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button onClick={stopTimer} variant="default" size="sm">
                <Square className="h-4 w-4 mr-2" />
                Stop & Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Timer Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Technician</Label>
              <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map(tech => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name} - {formatCurrency(tech.hourlyRate)}/hr
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service Work</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Description</Label>
            <Input
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={startTimer} 
              disabled={!!activeTimer}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Timer
            </Button>
            
            <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manual Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Manual Time Entry</DialogTitle>
                </DialogHeader>
                <ManualTimeEntryForm
                  technicians={technicians}
                  onSubmit={(entry) => {
                    setTimeEntries(prev => [entry, ...prev]);
                    setIsManualEntryOpen(false);
                    
                    const laborEntry: LaborEntry = {
                      id: entry.id,
                      technicianId: entry.technicianId,
                      technicianName: entry.technicianName,
                      startTime: new Date(entry.startTime),
                      endTime: new Date(entry.endTime),
                      hours: entry.hours,
                      hourlyRate: entry.hourlyRate,
                      description: entry.description,
                      isApproved: entry.isApproved,
                    };
                    
                    onTimeEntryCreate?.(laborEntry);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      
      {/* Time Tracking Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{timeStats.totalHours.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground">
                  Today: {timeStats.todayHours.toFixed(1)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">{formatCurrency(timeStats.totalCost)}</p>
                <p className="text-xs text-muted-foreground">
                  Avg: {formatCurrency(timeStats.averageRate)}/hr
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Time Entries</p>
                <p className="text-2xl font-bold">{timeStats.entriesCount}</p>
                <p className="text-xs text-muted-foreground">
                  Across {Object.keys(timeStats.categoriesStats).length} categories
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Time Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {timeEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Time Entries</h3>
                  <p className="text-muted-foreground">Start tracking time to see entries here.</p>
                </div>
              ) : (
                timeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          getCategoryColor(entry.category)
                        )} />
                        <h4 className="font-semibold">{entry.description}</h4>
                        <Badge variant="outline" className="text-xs">
                          {entry.category}
                        </Badge>
                        {!entry.isApproved && (
                          <Badge variant="secondary" className="text-xs">
                            Pending Approval
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.technicianName} • {new Date(entry.date).toLocaleDateString()} • 
                        {new Date(entry.startTime).toLocaleTimeString()} - {new Date(entry.endTime).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatDuration(entry.hours)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(entry.hours * entry.hourlyRate)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

interface ManualTimeEntryFormProps {
  technicians: Array<{ id: string; name: string; hourlyRate: number }>;
  onSubmit: (entry: TimeEntry) => void;
}

const ManualTimeEntryForm: React.FC<ManualTimeEntryFormProps> = ({
  technicians,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    technicianId: 'current-user',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    description: '',
    category: 'service' as const,
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const technician = technicians.find(t => t.id === formData.technicianId);
    if (!technician) return;
    
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
    const hours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
    
    const entry: TimeEntry = {
      id: `manual-${Date.now()}`,
      technicianId: technician.id,
      technicianName: technician.name,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      hours,
      hourlyRate: technician.hourlyRate,
      description: formData.description,
      isApproved: false,
      date: formData.date,
      category: formData.category,
    };
    
    onSubmit(entry);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Technician</Label>
          <Select 
            value={formData.technicianId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, technicianId: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {technicians.map(tech => (
                <SelectItem key={tech.id} value={tech.id}>
                  {tech.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Date</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Time</Label>
          <Input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
          />
        </div>
        
        <div>
          <Label>End Time</Label>
          <Input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
          />
        </div>
      </div>
      
      <div>
        <Label>Category</Label>
        <Select 
          value={formData.category} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="service">Service Work</SelectItem>
            <SelectItem value="consultation">Consultation</SelectItem>
            <SelectItem value="diagnostic">Diagnostic</SelectItem>
            <SelectItem value="repair">Repair</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Description</Label>
        <Textarea
          placeholder="Describe the work performed..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>
      
      <Button type="submit" className="w-full">
        Add Time Entry
      </Button>
    </form>
  );
};

export default TimeTrackingIntegration;
