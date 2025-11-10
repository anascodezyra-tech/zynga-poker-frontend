import { AdminLayout } from '../layout/AdminLayout';
import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { api } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

export function AdminRecovery() {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBannedUser, setSelectedBannedUser] = useState(null);
  const [selectedVerifiedUser, setSelectedVerifiedUser] = useState(null);
  const [recoveryReason, setRecoveryReason] = useState('');
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [searchBanned, setSearchBanned] = useState('');
  const [searchVerified, setSearchVerified] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchBannedUsers();
    fetchVerifiedUsers();
  }, []);

  const fetchBannedUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getBannedUsersWithChips({ search: searchBanned });
      setBannedUsers(data.users || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch banned users');
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifiedUsers = async () => {
    try {
      const data = await api.getVerifiedUsers({ search: searchVerified });
      setVerifiedUsers(data.users || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch verified users');
    }
  };

  const handleRecoverChips = async () => {
    if (!selectedBannedUser || !selectedVerifiedUser) {
      toast.error('Please select both a banned user and a verified user');
      return;
    }

    if (!recoveryReason.trim()) {
      toast.error('Please provide a reason for the recovery');
      return;
    }

    setActionLoading({ recover: true });
    try {
      const result = await api.recoverChips(
        selectedBannedUser.id,
        selectedVerifiedUser.id,
        recoveryReason
      );
      
      toast.success(`Successfully recovered ${result.recoveredAmount} chips`);
      setShowRecoveryDialog(false);
      setSelectedBannedUser(null);
      setSelectedVerifiedUser(null);
      setRecoveryReason('');
      fetchBannedUsers();
      fetchVerifiedUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to recover chips');
    } finally {
      setActionLoading({ recover: false });
    }
  };

  const handleVerifyUser = async (userId) => {
    setActionLoading({ [`verify-${userId}`]: true });
    try {
      await api.verifyUser(userId);
      toast.success('User verified successfully');
      fetchVerifiedUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to verify user');
    } finally {
      setActionLoading({ [`verify-${userId}`]: false });
    }
  };

  const handleBanUser = async (userId, reason) => {
    if (!reason || !reason.trim()) {
      toast.error('Please provide a ban reason');
      return;
    }

    setActionLoading({ [`ban-${userId}`]: true });
    try {
      await api.banUser(userId, reason);
      toast.success('User banned successfully');
      fetchBannedUsers();
      fetchVerifiedUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to ban user');
    } finally {
      setActionLoading({ [`ban-${userId}`]: false });
    }
  };

  const handleUnbanUser = async (userId) => {
    setActionLoading({ [`unban-${userId}`]: true });
    try {
      await api.unbanUser(userId);
      toast.success('User unbanned successfully');
      fetchBannedUsers();
      fetchVerifiedUsers();
    } catch (error) {
      toast.error(error.message || 'Failed to unban user');
    } finally {
      setActionLoading({ [`unban-${userId}`]: false });
    }
  };

  const formatBalance = (balance) => {
    const num = parseFloat(balance);
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toLocaleString();
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-full pb-20 md:pb-0"
      >
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8 px-1">
          <h1 className="text-white text-xl sm:text-2xl md:text-[32px] font-bold leading-tight" style={{ fontWeight: 600 }}>
            Chip Recovery & Anti-Ban
          </h1>
          <p className="text-[#9CA3AF] mt-1 sm:mt-2 text-xs sm:text-sm md:text-base" style={{ fontWeight: 500 }}>
            Recover chips from banned accounts and manage user verification
          </p>
        </div>

        {/* Recovery Action Card */}
        <Card className="mb-4 sm:mb-6 md:mb-8 bg-[#1A222C] border-[#2A3647] rounded-2xl shadow-lg">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 bg-[#F4C542]/20 rounded-xl flex-shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#F4C542]" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-white text-lg sm:text-xl md:text-2xl font-bold truncate" style={{ fontWeight: 600 }}>
                  Chip Recovery
                </CardTitle>
                <CardDescription className="text-[#9CA3AF] text-xs sm:text-sm mt-0.5 sm:mt-1" style={{ fontWeight: 500 }}>
                  Transfer chips from a banned account to a verified account
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-white text-xs sm:text-sm font-medium block" style={{ fontWeight: 500 }}>
                  Banned User (Source)
                </label>
                <select
                  value={selectedBannedUser?.id || ''}
                  onChange={(e) => {
                    const user = bannedUsers.find(u => u.id === e.target.value);
                    setSelectedBannedUser(user || null);
                  }}
                  className="w-full bg-[#0E141B] border border-[#2A3647] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F4C542]/50 focus:border-[#F4C542] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#3A4557] min-h-[44px] shadow-inner"
                  style={{ 
                    fontWeight: 500,
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <option value="" className="bg-[#0E141B]">Select banned user...</option>
                  {bannedUsers.map((user) => (
                    <option key={user.id} value={user.id} className="bg-[#0E141B]">
                      {user.email} - {formatBalance(user.balance)} chips
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-white text-xs sm:text-sm font-medium block" style={{ fontWeight: 500 }}>
                  Verified User (Destination)
                </label>
                <select
                  value={selectedVerifiedUser?.id || ''}
                  onChange={(e) => {
                    const user = verifiedUsers.find(u => u.id === e.target.value);
                    setSelectedVerifiedUser(user || null);
                  }}
                  className="w-full bg-[#0E141B] border border-[#2A3647] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F4C542]/50 focus:border-[#F4C542] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#3A4557] min-h-[44px] shadow-inner"
                  style={{ 
                    fontWeight: 500,
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <option value="" className="bg-[#0E141B]">Select verified user...</option>
                  {verifiedUsers.map((user) => (
                    <option key={user.id} value={user.id} className="bg-[#0E141B]">
                      {user.email} - {formatBalance(user.balance)} chips
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-white text-xs sm:text-sm font-medium block" style={{ fontWeight: 500 }}>
                Recovery Reason
              </label>
              <Input
                value={recoveryReason}
                onChange={(e) => setRecoveryReason(e.target.value)}
                placeholder="Enter reason for chip recovery..."
                className="bg-[#0E141B] border-[#2A3647] text-white placeholder:text-[#6B7280] focus:border-[#F4C542] focus:ring-2 focus:ring-[#F4C542]/50 text-xs sm:text-sm min-h-[44px] shadow-inner"
                style={{ 
                  fontWeight: 500,
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>
            <div className="relative md:static">
              <Button
                onClick={() => setShowRecoveryDialog(true)}
                disabled={!selectedBannedUser || !selectedVerifiedUser || !recoveryReason.trim() || actionLoading.recover}
                className="w-full bg-[#F4C542] hover:bg-[#ffcd33] text-[#0E141B] font-semibold py-4 sm:py-6 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#F4C542]/20 hover:shadow-[#F4C542]/40 hover:shadow-xl min-h-[44px] sm:min-h-[56px] sticky bottom-4 z-10 md:static md:bottom-auto"
                style={{ 
                  fontWeight: 600,
                  boxShadow: '0 4px 6px -1px rgba(244, 197, 66, 0.2), 0 2px 4px -1px rgba(244, 197, 66, 0.1)'
                }}
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 ${actionLoading.recover ? 'animate-spin' : ''}`} />
                {actionLoading.recover ? 'Processing...' : 'Recover Chips'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Banned Users Table */}
        <Card className="mb-4 sm:mb-6 md:mb-8 bg-[#1A222C] border-[#2A3647] rounded-2xl shadow-lg">
          <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-1 break-words" style={{ fontWeight: 600 }}>
                  Banned Users with Recoverable Chips
                </CardTitle>
                <CardDescription className="text-[#9CA3AF] text-xs sm:text-sm" style={{ fontWeight: 500 }}>
                  Users who are banned and have chips that can be recovered
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-auto sm:min-w-[200px] sm:max-w-[256px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9CA3AF] z-10 pointer-events-none" />
                <Input
                  value={searchBanned}
                  onChange={(e) => {
                    setSearchBanned(e.target.value);
                    fetchBannedUsers();
                  }}
                  placeholder="Search banned users..."
                  className="bg-[#0E141B] border-[#2A3647] text-white pl-10 w-full focus:border-[#F4C542] focus:ring-2 focus:ring-[#F4C542]/50 text-xs sm:text-sm min-h-[44px] shadow-inner"
                  style={{ 
                    fontWeight: 500,
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 sm:px-6 pb-4 sm:pb-6">
            {loading ? (
              <div className="text-center py-8 sm:py-12 text-[#9CA3AF]">
                <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#F4C542]"></div>
                <p className="mt-2 text-xs sm:text-sm" style={{ fontWeight: 500 }}>Loading...</p>
              </div>
            ) : bannedUsers.length === 0 ? (
              <div className="text-center py-12 sm:py-16 text-[#9CA3AF] px-4">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#F4C542]/10 mb-3 sm:mb-4">
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-[#F4C542]" />
                </div>
                <p className="text-sm sm:text-base font-medium text-white mb-1" style={{ fontWeight: 500 }}>
                  No banned users with recoverable chips
                </p>
                <p className="text-xs sm:text-sm text-[#9CA3AF]" style={{ fontWeight: 500 }}>
                  All banned accounts have been processed or have no chips
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden">
                    <table className="w-full min-w-[600px] sm:min-w-full">
                      <thead>
                        <tr className="border-b border-[#2A3647]">
                          <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-[#9CA3AF] text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ fontWeight: 600 }}>
                            Email
                          </th>
                          <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-[#9CA3AF] text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ fontWeight: 600 }}>
                            Balance
                          </th>
                          <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-[#9CA3AF] text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap hidden lg:table-cell" style={{ fontWeight: 600 }}>
                            Ban Reason
                          </th>
                          <th className="text-right py-3 sm:py-4 px-3 sm:px-4 text-[#9CA3AF] text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ fontWeight: 600 }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2A3647]">
                        {bannedUsers.map((user) => (
                          <tr 
                            key={user.id} 
                            className="border-b border-[#2A3647] hover:bg-[#0E141B]/50 transition-colors"
                          >
                            <td className="py-3 sm:py-4 px-3 sm:px-4 text-white text-xs sm:text-sm" style={{ fontWeight: 500 }}>
                              <div className="truncate max-w-[120px] sm:max-w-[200px] md:max-w-none" title={user.email}>
                                {user.email}
                              </div>
                            </td>
                            <td className="py-3 sm:py-4 px-3 sm:px-4 text-white font-semibold text-xs sm:text-sm whitespace-nowrap" style={{ fontWeight: 600 }}>
                              <span className="text-[#F4C542]">{formatBalance(user.balance)}</span>
                            </td>
                            <td className="py-3 sm:py-4 px-3 sm:px-4 text-[#9CA3AF] text-[10px] sm:text-xs md:text-sm hidden lg:table-cell" style={{ fontWeight: 500 }}>
                              <div className="truncate max-w-[150px] md:max-w-[200px]" title={user.banReason || 'N/A'}>
                                {user.banReason || 'N/A'}
                              </div>
                            </td>
                            <td className="py-3 sm:py-4 px-3 sm:px-4 text-right">
                              <Button
                                onClick={() => handleUnbanUser(user.id)}
                                disabled={actionLoading[`unban-${user.id}`]}
                                variant="outline"
                                size="sm"
                                className="text-[#F4C542] border-[#F4C542] hover:bg-[#F4C542] hover:text-[#0E141B] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[32px] px-2 sm:px-3 hover:shadow-md hover:shadow-[#F4C542]/30"
                                style={{ fontWeight: 500 }}
                              >
                                <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 flex-shrink-0" />
                                <span className="hidden xs:inline sm:hidden md:inline">Unban</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verified Users Table */}
        <Card className="bg-[#1A222C] border-[#2A3647] rounded-2xl shadow-lg">
          <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-1 break-words" style={{ fontWeight: 600 }}>
                  Verified Users
                </CardTitle>
                <CardDescription className="text-[#9CA3AF] text-xs sm:text-sm" style={{ fontWeight: 500 }}>
                  Users eligible to receive recovered chips
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-auto sm:min-w-[200px] sm:max-w-[256px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9CA3AF] z-10 pointer-events-none" />
                <Input
                  value={searchVerified}
                  onChange={(e) => {
                    setSearchVerified(e.target.value);
                    fetchVerifiedUsers();
                  }}
                  placeholder="Search verified users..."
                  className="bg-[#0E141B] border-[#2A3647] text-white pl-10 w-full focus:border-[#F4C542] focus:ring-2 focus:ring-[#F4C542]/50 text-xs sm:text-sm min-h-[44px] shadow-inner"
                  style={{ 
                    fontWeight: 500,
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 sm:px-6 pb-4 sm:pb-6">
            {verifiedUsers.length === 0 ? (
              <div className="text-center py-12 sm:py-16 text-[#9CA3AF] px-4">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500/10 mb-3 sm:mb-4">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                </div>
                <p className="text-sm sm:text-base font-medium text-white mb-1" style={{ fontWeight: 500 }}>
                  No verified users found
                </p>
                <p className="text-xs sm:text-sm text-[#9CA3AF]" style={{ fontWeight: 500 }}>
                  Verify users to enable chip recovery
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden">
                    <table className="w-full min-w-[600px] sm:min-w-full">
                      <thead>
                        <tr className="border-b border-[#2A3647]">
                          <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-[#9CA3AF] text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ fontWeight: 600 }}>
                            Email
                          </th>
                          <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-[#9CA3AF] text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ fontWeight: 600 }}>
                            Balance
                          </th>
                          <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-[#9CA3AF] text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap hidden lg:table-cell" style={{ fontWeight: 600 }}>
                            Verified At
                          </th>
                          <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-[#9CA3AF] text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap" style={{ fontWeight: 600 }}>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2A3647]">
                        {verifiedUsers.map((user) => (
                          <tr 
                            key={user.id} 
                            className="border-b border-[#2A3647] hover:bg-[#0E141B]/50 transition-colors"
                          >
                            <td className="py-3 sm:py-4 px-3 sm:px-4 text-white text-xs sm:text-sm" style={{ fontWeight: 500 }}>
                              <div className="truncate max-w-[120px] sm:max-w-[200px] md:max-w-none" title={user.email}>
                                {user.email}
                              </div>
                            </td>
                            <td className="py-3 sm:py-4 px-3 sm:px-4 text-white font-semibold text-xs sm:text-sm whitespace-nowrap" style={{ fontWeight: 600 }}>
                              <span className="text-[#F4C542]">{formatBalance(user.balance)}</span>
                            </td>
                            <td className="py-3 sm:py-4 px-3 sm:px-4 text-[#9CA3AF] text-[10px] sm:text-xs md:text-sm hidden lg:table-cell" style={{ fontWeight: 500 }}>
                              {user.verifiedAt ? new Date(user.verifiedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-3 sm:py-4 px-3 sm:px-4">
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1" style={{ fontWeight: 500 }}>
                                <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5 flex-shrink-0" />
                                Verified
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recovery Confirmation Dialog */}
        <AlertDialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
          <AlertDialogContent className="bg-[#1A222C] border-[#2A3647] max-w-[90vw] sm:max-w-md mx-4 sm:mx-auto shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white text-base sm:text-lg md:text-xl" style={{ fontWeight: 600 }}>
                Confirm Chip Recovery
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#9CA3AF] text-xs sm:text-sm space-y-3 pt-2" style={{ fontWeight: 500 }}>
                <p>
                  Are you sure you want to recover all chips from{' '}
                  <strong className="text-white font-semibold break-words">{selectedBannedUser?.email}</strong> to{' '}
                  <strong className="text-white font-semibold break-words">{selectedVerifiedUser?.email}</strong>?
                </p>
                <div className="bg-[#0E141B] rounded-lg p-3 border border-[#2A3647]">
                  <p className="text-[10px] sm:text-xs text-[#9CA3AF] mb-1">Amount to recover:</p>
                  <p className="text-white font-semibold text-base sm:text-lg" style={{ fontWeight: 600 }}>
                    {selectedBannedUser ? formatBalance(selectedBannedUser.balance) : '0'} chips
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-[#9CA3AF] mb-1">Reason:</p>
                  <p className="text-white text-xs sm:text-sm break-words">{recoveryReason}</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <AlertDialogCancel className="w-full sm:w-auto bg-[#0E141B] border-[#2A3647] text-white hover:bg-[#2A3647] transition-colors text-xs sm:text-sm min-h-[44px] sm:min-h-[36px]" style={{ fontWeight: 500 }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRecoverChips}
                disabled={actionLoading.recover}
                className="w-full sm:w-auto bg-[#F4C542] hover:bg-[#ffcd33] text-[#0E141B] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#F4C542]/40 text-xs sm:text-sm min-h-[44px] sm:min-h-[36px]"
                style={{ fontWeight: 600 }}
              >
                {actionLoading.recover ? (
                  <>
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin inline" />
                    Recovering...
                  </>
                ) : (
                  'Confirm Recovery'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </AdminLayout>
  );
}
