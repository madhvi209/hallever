"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Search, 
  Edit, 
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store';
import { 
  fetchForgotPasswords, 
  updateForgotPassword, 
  selectForgotPasswords, 
  selectLoading, 
  selectError,
} from '@/lib/redux/slice/forgotPasswordSlice';
import type { ForgotPassword } from '@/lib/redux/slice/forgotPasswordSlice';

const ForgotPasswordPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const forgotPasswords = useSelector(selectForgotPasswords);
  const isLoading = useSelector(selectLoading);
  const error = useSelector(selectError);
  
  const [filteredRequests, setFilteredRequests] = useState<ForgotPassword[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedForgotPassword, setSelectedForgotPassword] = useState<ForgotPassword | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'pending' as 'pending' | 'completed'
  });

  // Helper function to convert Firebase Timestamp to readable date
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'Not specified';
    
    // Handle Firebase Timestamp objects
    if (timestamp._seconds) {
      const date = new Date(timestamp._seconds * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Handle regular date strings
    if (typeof timestamp === 'string') {
      try {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
      } catch (e) {
        console.log(e);
        // If parsing fails, return as is
      }
    }
    
    return timestamp.toString();
  };

  // Filter and search requests
  useEffect(() => {
    let filtered = forgotPasswords || [];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(request =>
        (request.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (request.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (request.phone?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [forgotPasswords, searchQuery, statusFilter]);

  // Fetch forgot password requests on component mount
  useEffect(() => {
    dispatch(fetchForgotPasswords());
  }, [dispatch]);

  const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'completed') => {
    try {
      setIsUpdating(true);
      const request = forgotPasswords?.find(r => r.id === id);
      if (!request) return;

      const updatedRequest: ForgotPassword = {
        ...request,
        status: newStatus,
        updatedOn: new Date().toISOString().split('T')[0]
      };

      await dispatch(updateForgotPassword(id, updatedRequest));
      dispatch(fetchForgotPasswords()); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };


  const openEditModal = (request: ForgotPassword) => {
    
    setSelectedForgotPassword(request);
    const newFormData = {
      name: request.name || '',
      email: request.email || '',
      phone: request.phone || '',
      status: request.status || 'pending'
    };
    setFormData(newFormData);
    setIsEditModalOpen(true);
    

  };

  const handleEditSubmit = async () => {
    
    if (!selectedForgotPassword?.id) {
      console.error('No selectedForgotPassword ID found!');
      return;
    }
        
    try {
      setIsEditing(true);
      
      const updatedRequest: ForgotPassword = {
        ...selectedForgotPassword,
        ...formData,
        updatedOn: new Date().toISOString().split('T')[0]
      };

      await dispatch(updateForgotPassword(selectedForgotPassword.id, updatedRequest));
      
      dispatch(fetchForgotPasswords()); // Refresh the list
      
      setIsEditModalOpen(false);
      setSelectedForgotPassword(null);
    } catch (error) {
      console.error('Error updating request:', error);
    } finally {
      setIsEditing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const stats = {
    total: forgotPasswords?.length || 0,
    pending: forgotPasswords?.filter(r => r.status === 'pending').length || 0,
    completed: forgotPasswords?.filter(r => r.status === 'completed').length || 0
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E10600] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading password reset requests...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Error loading requests</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!forgotPasswords || forgotPasswords.length === 0) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Password Reset Requests</h1>
          <p className="text-gray-600 mb-8">No password reset requests found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Password Reset Requests</h1>
            <p className="text-gray-600 mt-2">Manage all password reset requests from users</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Requests ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No requests found matching your criteria
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={request.name} alt={request.name} />
                        <AvatarFallback className="bg-gradient-to-br from-red-400 to-red-600 text-white">
                          {request.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.name}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{request.email}</span>
                          </div>
                          {request.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{request.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getStatusColor(request.status || 'pending')}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(request.status || 'pending')}
                              <span>{request.status || 'pending'}</span>
                            </div>
                          </Badge>
                          {request.createdOn && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{formatTimestamp(request.createdOn)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(request)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>

                      {request.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleUpdateStatus(request.id!, 'completed')}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-green-600 mr-1"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Complete
                            </>
                          )}
                        </Button>
                      )}

                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Request Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Request - {selectedForgotPassword?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Request Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name" className="block mb-2">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email" className="block mb-2">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone" className="block mb-2">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status" className="block mb-2">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as 'pending' | 'completed'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleEditSubmit} 
                className="flex-1 bg-[#E10600] hover:bg-[#C10500]"
                disabled={isEditing}
              >
                {isEditing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)} 
                className="flex-1"
                disabled={isEditing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForgotPasswordPage;
