import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'wouter';
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Building2, 
  User,
  ArrowLeft,
  MoreHorizontal 
} from 'lucide-react';
import type { User as UserType } from '@shared/schema';

const roleColors = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  analyst: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  user: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

function AddEmployeeModal() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    jobTitle: '',
    phone: '',
    role: 'user',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: any) => {
      return await apiRequest('POST', '/api/employees', employeeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: 'Employee Added',
        description: 'New employee has been added to the directory.',
      });
      setOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        jobTitle: '',
        phone: '',
        role: 'user',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add employee. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmployeeMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEmployeeMutation.isPending}>
              {createEmployeeMutation.isPending ? 'Adding...' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function EmployeeDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['/api/employees'],
  });

  const filteredEmployees = (employees as UserType[]).filter((employee: UserType) => {
    const matchesSearch = 
      employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesRole = roleFilter === 'all' || employee.role === roleFilter;

    return matchesSearch && matchesDepartment && matchesRole;
  });

  const departments = Array.from(new Set((employees as UserType[]).map((emp: UserType) => emp.department).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Employee Directory
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your team members and their information
            </p>
          </div>
        </div>
        <AddEmployeeModal />
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="analyst">Analyst</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <User className="w-4 h-4" />
          <span>{filteredEmployees.length} employees</span>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee: UserType) => (
          <Card key={employee.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={employee.profileImageUrl || ''} />
                  <AvatarFallback>
                    {employee.firstName?.[0]}{employee.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {employee.jobTitle}
                  </p>
                </div>
                <Badge className={roleColors[employee.role as keyof typeof roleColors]}>
                  {employee.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {employee.department && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Building2 className="w-4 h-4" />
                  <span>{employee.department}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <Mail className="w-4 h-4" />
                <span className="truncate">{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Phone className="w-4 h-4" />
                  <span>{employee.phone}</span>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No employees found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {searchTerm || departmentFilter !== 'all' || roleFilter !== 'all'
              ? 'Try adjusting your search filters.'
              : 'Get started by adding your first employee.'}
          </p>
        </div>
      )}
    </div>
  );
}