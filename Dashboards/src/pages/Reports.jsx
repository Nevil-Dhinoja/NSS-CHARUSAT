import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Download,
  Calendar,
  User,
  Search,
  Filter,
  PlusCircle,
  Eye,
  BarChart3,
  Upload,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const Reports = () => {
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [approvalComments, setApprovalComments] = useState("");
  const { toast } = useToast();

  React.useEffect(() => {
    const token = localStorage.getItem("nssUserToken");
    const userStr = localStorage.getItem("nssUser");
    if (!token || !userStr) {
      window.location.href = "/login";
      return;
    }
    try {
      const user = JSON.parse(userStr);
      const role = user.role ? user.role.toLowerCase() : "";
      // Allow PO and SC users to access reports page
      if (role !== "po" && role !== "program officer" && role !== "sc" && role !== "student coordinator") {
        window.location.href = "/dashboard";
        return;
      }
      setUserRole(role);
      setUserName(user.name);
      setUserEmail(user.email);
    } catch (err) {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  // Fetch reports when user data is loaded
  React.useEffect(() => {
    if (userRole) {
      fetchReports();
    }
  }, [userRole]);

  const fetchReports = async () => {
    const token = localStorage.getItem("nssUserToken");
    try {
      const response = await fetch("http://localhost:5000/api/events/reports", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch reports",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReport = (report) => {
    setSelectedReport(report);
    setApprovalComments("");
    setIsApproving(true);
  };

  const handleRejectReport = (report) => {
    setSelectedReport(report);
    setApprovalComments("");
    setIsApproving(true);
  };

  const submitApproval = async (status) => {
    if (!selectedReport) return;

    const token = localStorage.getItem("nssUserToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "No token found. Please login again.",
        variant: "destructive"
      });
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/events/reports/${selectedReport.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: status,
          comments: approvalComments
        }),
      });

      if (response.status === 401) {
        toast({
          title: "Token Expired",
          description: "Your session has expired. Please login again.",
          variant: "destructive"
        });
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: `Report ${status}`,
          description: `Report has been ${status} successfully.`,
        });
        setIsApproving(false);
        setSelectedReport(null);
        setApprovalComments("");
        fetchReports(); // Refresh the list
      } else {
        throw new Error(data.error || `Failed to ${status} report`);
      }
    } catch (error) {
      if (error.message.includes("Failed to fetch")) {
        toast({
          title: "Server Error",
          description: "Cannot connect to server. Please make sure the backend is running.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const downloadReport = async (reportId) => {
    const token = localStorage.getItem("nssUserToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "No token found. Please login again.",
        variant: "destructive"
      });
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/events/reports/${reportId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to download report");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleViewReport = (report) => {
    // For now, just show a toast with report info
    // In the future, you could open a modal with report details
    toast({
      title: "Report Details",
      description: `Event: ${report.event_name}, Status: ${report.status}, Submitted: ${new Date(report.created_at).toLocaleDateString()}`,
    });
  };

  const handleDeleteReport = async (report) => {
    if (!confirm(`Are you sure you want to delete the report for "${report.event_name}"?`)) {
      return;
    }

    const token = localStorage.getItem("nssUserToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "No token found. Please login again.",
        variant: "destructive"
      });
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/events/reports/${report.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Report deleted successfully",
        });
        fetchReports(); // Refresh the list
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete report");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    return type === "Working Hours Report" ? <BarChart3 className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  };

  if (!userRole || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  const isPO = userRole === 'po' || userRole === 'program officer';
  const isSC = userRole === 'sc' || userRole === 'student coordinator';

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-nss-primary">Event Reports</h1>
          </div>
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isPO ? "Department Reports" : "My Reports"}
            </CardTitle>
            <CardDescription>
              {isPO 
                ? "Manage event reports submitted by Student Coordinators"
                : "Track the status of your submitted reports"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    {isPO && <TableHead>Submitted By</TableHead>}
                    <TableHead>Event Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted On</TableHead>
                    {isSC && <TableHead>PO Comments</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={isPO ? 6 : (isSC ? 6 : 5)} className="text-center py-4">
                        Loading reports...
                      </TableCell>
                    </TableRow>
                  ) : reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isPO ? 6 : (isSC ? 6 : 5)} className="text-center py-4">
                        {isPO 
                          ? "No reports found. Reports will appear here when submitted by Student Coordinators."
                          : "No reports found. Submit reports from the Events page."
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="font-medium">{report.event_name}</div>
                        </TableCell>
                        {isPO && (
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <User className="mr-1 h-4 w-4 text-gray-400" />
                              {report.submitted_by_name || report.submitted_by}
                            </div>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                            {report.event_date ? new Date(report.event_date).toLocaleDateString() : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell>
                          {new Date(report.created_at).toLocaleDateString()}
                        </TableCell>
                        {isSC && (
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {report.comments ? (
                                <div className="max-w-xs truncate" title={report.comments}>
                                  {report.comments}
                                </div>
                              ) : (
                                <span className="text-gray-400">No comments</span>
                              )}
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {isPO ? (
                              <>
                                <Button
                                  onClick={() => downloadReport(report.id)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                
                                {report.status === 'pending' && (
                                  <>
                                    <Button
                                      onClick={() => handleApproveReport(report)}
                                      variant="outline"
                                      size="sm"
                                      className="border-green-500 text-green-500 hover:bg-green-50"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      onClick={() => handleRejectReport(report)}
                                      variant="outline"
                                      size="sm"
                                      className="border-red-500 text-red-500 hover:bg-red-50"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </>
                            ) : (
                              // SC actions - only view and delete (if pending or rejected)
                              <>
                                <Button
                                  onClick={() => handleViewReport(report)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <FileText className="h-4 w-4" />
                                  View
                                </Button>
                                
                                {['pending', 'rejected'].includes(report.status) && (
                                  <Button
                                    onClick={() => handleDeleteReport(report)}
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    Delete
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Approval Dialog */}
        <Dialog open={isApproving} onOpenChange={setIsApproving}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedReport && (
                  selectedReport.status === 'pending' ? 'Review Report' : 'Update Report Status'
                )}
              </DialogTitle>
              <DialogDescription>
                {selectedReport && (
                  `Review report for "${selectedReport.event_name}" submitted by ${selectedReport.submitted_by_name || selectedReport.submitted_by}`
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Comments (Optional)</label>
                <Textarea
                  placeholder="Add comments or feedback for the Student Coordinator..."
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsApproving(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => submitApproval('rejected')}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  onClick={() => submitApproval('approved')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
