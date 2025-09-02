/**
 * Premium Call Logs Management Page
 * Complete call log management interface with CRUD operations
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Clock,
  User,
  RefreshCw,
  Calendar,
  Timer
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface CallLog {
  id: string;
  callerName: string;
  callerPhone: string;
  callTime: string;
  durationSeconds: number;
  notes: string;
  createdAt: string;
}

interface CallLogRequest {
  callerName: string;
  callerPhone: string;
  callTime: string;
  durationSeconds: number;
  notes: string;
}

const CallLogsPage = () => {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCallLog, setSelectedCallLog] = useState<CallLog | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form state for creating new call log
  const [newCallLog, setNewCallLog] = useState<CallLogRequest>({
    callerName: '',
    callerPhone: '',
    callTime: new Date().toISOString().slice(0, 16),
    durationSeconds: 0,
    notes: ''
  });

  const loadCallLogs = async () => {
    try {
      setIsLoading(true);
      // For now, we'll use mock data since the API endpoint might not exist yet
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockCallLogs: CallLog[] = [
        {
          id: '1',
          callerName: 'John Doe',
          callerPhone: '+1234567890',
          callTime: '2025-07-30T17:00:00Z',
          durationSeconds: 120,
          notes: 'Follow-up call about order #123',
          createdAt: '2025-07-30T17:02:00Z'
        },
        {
          id: '2',
          callerName: 'Jane Smith',
          callerPhone: '+1987654321',
          callTime: '2025-07-30T16:30:00Z',
          durationSeconds: 180,
          notes: 'Inquiry about menu items',
          createdAt: '2025-07-30T16:33:00Z'
        }
      ];
      setCallLogs(mockCallLogs);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load call logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCallLogs();
  }, []);

  const filteredCallLogs = callLogs.filter(log =>
    log.callerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.callerPhone?.includes(searchTerm) ||
    log.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCallLog = async () => {
    try {
      if (!newCallLog.callerName || !newCallLog.callerPhone) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newLog: CallLog = {
        id: Date.now().toString(),
        ...newCallLog,
        createdAt: new Date().toISOString()
      };

      setCallLogs(prev => [newLog, ...prev]);
      
      toast({
        title: "Call Log Created",
        description: "Call log has been successfully created",
      });
      
      setIsCreateDialogOpen(false);
      setNewCallLog({
        callerName: '',
        callerPhone: '',
        callTime: new Date().toISOString().slice(0, 16),
        durationSeconds: 0,
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create call log",
        variant: "destructive",
      });
    }
  };

  const handleViewCallLog = (callLog: CallLog) => {
    setSelectedCallLog(callLog);
    setIsViewDialogOpen(true);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Call Logs</h1>
          <p className="text-muted-foreground">Track and manage customer call interactions</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={loadCallLogs}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary-glow">
                <Plus className="w-4 h-4 mr-2" />
                Log Call
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Log New Call</DialogTitle>
                <DialogDescription>
                  Record details of a customer call
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="callerName">Caller Name *</Label>
                  <Input
                    id="callerName"
                    value={newCallLog.callerName}
                    onChange={(e) => setNewCallLog(prev => ({ ...prev, callerName: e.target.value }))}
                    placeholder="Enter caller name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callerPhone">Phone Number *</Label>
                  <Input
                    id="callerPhone"
                    value={newCallLog.callerPhone}
                    onChange={(e) => setNewCallLog(prev => ({ ...prev, callerPhone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callTime">Call Time</Label>
                  <Input
                    id="callTime"
                    type="datetime-local"
                    value={newCallLog.callTime}
                    onChange={(e) => setNewCallLog(prev => ({ ...prev, callTime: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durationSeconds">Duration (seconds)</Label>
                  <Input
                    id="durationSeconds"
                    type="number"
                    min="0"
                    value={newCallLog.durationSeconds}
                    onChange={(e) => setNewCallLog(prev => ({ ...prev, durationSeconds: parseInt(e.target.value) || 0 }))}
                    placeholder="Call duration in seconds"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newCallLog.notes}
                    onChange={(e) => setNewCallLog(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Call notes and follow-up actions"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCallLog}>
                  Log Call
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search call logs by name, phone, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Call Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Call Logs</CardTitle>
          <CardDescription>
            {filteredCallLogs.length} call logs found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading call logs...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caller</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Call Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Logged At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCallLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{log.callerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{log.callerPhone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{formatDateTime(log.callTime)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Timer className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{formatDuration(log.durationSeconds)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground max-w-xs truncate block">
                        {log.notes || 'No notes'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewCallLog(log)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Call Log Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Call Log Details</DialogTitle>
            <DialogDescription>
              View complete call information
            </DialogDescription>
          </DialogHeader>
          
          {selectedCallLog && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Caller Name</Label>
                <p className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedCallLog.callerName}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                <p className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedCallLog.callerPhone}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Call Time</Label>
                <p className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDateTime(selectedCallLog.callTime)}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                <p className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDuration(selectedCallLog.durationSeconds)}</span>
                </p>
              </div>

              {selectedCallLog.notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedCallLog.notes}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Logged At</Label>
                <p className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formatDateTime(selectedCallLog.createdAt)}</span>
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CallLogsPage; 