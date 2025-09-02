/**
 * Premium Call Recordings Management Page
 * Complete call recording management interface with preview functionality
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Search, 
  MoreHorizontal,
  Download,
  Calendar,
  Clock,
  RefreshCw,
  FileAudio,
  Eye,
  Copy
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

const CallRecordingsPage = () => {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecording, setSelectedRecording] = useState<any | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();



  const loadRecordings = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getCallRecordings();
      setRecordings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load call recordings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecordings();
  }, []);


  // const filteredRecordings = recordings.filter(recording => {
  //   const matchesSearch = 
  //     recording.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     recording.ObjectName.toLowerCase().includes(searchTerm.toLowerCase());
    
  //   const matchesStatus = filterStatus === 'all' || recording.status === filterStatus;
    
  //   return matchesSearch && matchesStatus;
  // });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // const getAudioUrl = (recording: any) => {
  //   return apiService.getCallRecordingUrl(recording);
  // };

  const handlePreviewRecording = (recording: any) => {
    setSelectedRecording(recording);
    setIsPreviewDialogOpen(true);
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'missed':
        return <Badge variant="destructive">Missed</Badge>;
      case 'in-progress':
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Call Recordings</h1>
          <p className="text-muted-foreground">Manage and preview customer call recordings</p>
        </div>
        <Button onClick={loadRecordings} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by phone number or filename..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recordings</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Recordings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Call Recordings ({recordings.length})</CardTitle>
          <CardDescription>
            Browse and manage your call recordings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Loading recordings...</span>
            </div>
          ) : recordings.length === 0 ? (
            <div className="text-center py-8">
              <FileAudio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recordings found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  {/* <TableHead>File Name</TableHead> */}
                  {/* <TableHead>Duration</TableHead> */}
                  {/* <TableHead>File Size</TableHead> */}
                  {/* <TableHead>Status</TableHead> */}
                  <TableHead>Date Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recordings.map((recording, index) => (
                  <TableRow key={recording.id || recording._id || `recording-${index}`}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{recording.customer?.phone || '-'}</span>
                      </div>
                    </TableCell>
                    {/* <TableCell>
                      <div className="max-w-[200px] truncate" title={recording.ObjectName}>
                        {recording.ObjectName}
                      </div>
                    </TableCell> */}
                    {/* <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDuration(recording.recordingDuration || 0)}</span>
                      </div>
                    </TableCell> */}
                    {/* <TableCell>{formatFileSize(recording.Length)}</TableCell> */}
                    {/* <TableCell>{getStatusBadge(recording.status || 'completed')}</TableCell> */}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDateTime(recording.timestamp)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreviewRecording(recording)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
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

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Call Recording Preview</DialogTitle>
            <DialogDescription>
              Listen to the call recording and view details
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecording && (
            <div className="space-y-6">
              {/* Recording Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <p className="text-lg font-semibold">{selectedRecording.customer?.phone || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRecording.status || 'completed')}</div>
                </div>
                {/* <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p className="text-lg">{formatDuration(selectedRecording.duration || 0)}</p>
                </div> */}
                {/* <div>
                  <label className="text-sm font-medium text-muted-foreground">File Size</label>
                  <p className="text-lg">{formatFileSize(selectedRecording.Length)}</p>
                </div> */}
              </div>

              {/* Audio Player */}
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <audio
                    controls
                    autoPlay={false}
                    loop={false}
                    className="w-full max-w-md"
                    src={selectedRecording.recordingUrl}
                    onError={() => {
                      toast({
                        title: "Audio Error",
                        description: "Failed to load audio. Please try again.",
                        variant: "destructive",
                      });
                    }}
                  >
                    <source src={selectedRecording.recordingUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>


            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CallRecordingsPage;
