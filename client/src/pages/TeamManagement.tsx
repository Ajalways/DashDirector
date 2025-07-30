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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Users, UserPlus, Mail, Crown, Shield, User as UserIcon, Search, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import type { User } from '@shared/schema';

const roleColors = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  analyst: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  user: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const roleIcons = {
  admin: Crown,
  manager: Shield,
  analyst: Users,
  user: UserIcon,
};

function InviteTeamMemberModal() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'user',
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const inviteTeamMemberMutation = useMutation({
    mutationFn: async (inviteData: any) => {
      return await apiRequest('POST', '/api/team/invite', inviteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: 'Invitation Sent',
        description: 'Team member invitation has been sent successfully.',
      });
      setOpen(false);
      setFormData({ email: '', role: 'user' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send invitation. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inviteTeamMemberMutation.mutate(formData);
  };

  const canInvite = user?.role === 'admin' || user?.role === 'manager';

  if (!canInvite) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Team Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="colleague@company.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                {user?.role === 'admin' && (
                  <>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {formData.role === 'admin' && 'Full access to all features and settings'}
              {formData.role === 'manager' && 'Can manage team members and moderate content'}
              {formData.role === 'analyst' && 'Can view analytics and create reports'}
              {formData.role === 'user' && 'Basic access to core features'}
            </p>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={inviteTeamMemberMutation.isPending}>
              {inviteTeamMemberMutation.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TeamMemberCard({ member }: { member: UserType }) {
  const { user: currentUser } = useAuth();
  const RoleIcon = roleIcons[member.role as keyof typeof roleIcons] || User;

  const canManageMember = currentUser?.role === 'admin' && member.id !== currentUser.id;

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={member.profileImageUrl || undefined} alt={member.firstName || 'User'} />
              <AvatarFallback>
                {member.firstName?.charAt(0) || member.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {member.firstName ? `${member.firstName} ${member.lastName}` : 'Unknown User'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {member.email}
              </p>
            </div>
          </div>
          {canManageMember && (
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Badge className={roleColors[member.role as keyof typeof roleColors]}>
            <RoleIcon className="w-3 h-3 mr-1" />
            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
          </Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Joined {formatDistanceToNow(new Date(member.createdAt || Date.now()), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeamManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { user } = useAuth();

  const { data: teamMembers, isLoading } = useQuery<User[]>({
    queryKey: ['/api/team'],
  });

  const filteredMembers = (teamMembers || []).filter((member: User) => {
    const matchesSearch = 
      member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: teamMembers?.length || 0,
    admins: (teamMembers || []).filter((m: User) => m.role === 'admin').length,
    managers: (teamMembers || []).filter((m: User) => m.role === 'manager').length,
    analysts: (teamMembers || []).filter((m: User) => m.role === 'analyst').length,
    users: (teamMembers || []).filter((m: User) => m.role === 'user').length,
  };

  return (
    <div className="space-y-6">
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Team Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your team members and their roles
            </p>
          </div>
        </div>
        <InviteTeamMemberModal />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
              </div>
              <Crown className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Managers</p>
                <p className="text-2xl font-bold text-blue-600">{stats.managers}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Analysts</p>
                <p className="text-2xl font-bold text-green-600">{stats.analysts}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Users</p>
                <p className="text-2xl font-bold text-gray-600">{stats.users}</p>
              </div>
              <User className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="analyst">Analyst</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredMembers && filteredMembers.length > 0 ? (
          filteredMembers.map((member: UserType) => (
            <TeamMemberCard key={member.id} member={member} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No team members found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Invite your first team member to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
