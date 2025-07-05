import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Search,
  FileText,
  Users,
  Loader2
} from "lucide-react";
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

const Approvals = () => {
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [userDepartment, setUserDepartment] = React.useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [eventApprovals, setEventApprovals] = useState([]);
  const [workingHoursApprovals, setWorkingHoursApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const { toast } = useToast();

  // Counts for summary cards
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    const token = localStorage.getItem("nssUserToken");
    const userStr = localStorage.getItem("nssUser");
    if (!token || !userStr) {
      window.location.href = "/login";
      return;
    }
    try {
      const user = JSON.parse(userStr);
      const role = user.role ? user.role.toLowerCase() : "";
      if (role !== "pc" && role !== "po") {
        window.location.href = "/dashboard";
        return;
      }
      setUserRole(role);
      setUserName(user.name);
      setUserEmail(user.email);
      setUserDepartment(user.department || "");
    } catch (err) {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    if (userRole && userDepartment) {
      // Call fetchApprovals directly here instead of using the callback
      const fetchData = async () => {
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

        if (!userRole || !userDepartment) {
          return; // Wait for user data to be loaded
        }

        try {
          setLoading(true);
          
          // Fetch working hours approvals
          const workingHoursEndpoint = userRole === "po" 
            ? "http://localhost:5000/api/working-hours/department/CE"
            : "http://localhost:5000/api/working-hours/all";
          
          const workingHoursResponse = await fetch(workingHoursEndpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (workingHoursResponse.status === 401) {
            toast({
              title: "Token Expired",
              description: "Your session has expired. Please login again.",
              variant: "destructive"
            });
            localStorage.clear();
            window.location.href = "/login";
            return;
          }

          const workingHoursData = await workingHoursResponse.json();
          
          if (workingHoursResponse.ok) {
            setWorkingHoursApprovals(workingHoursData);
          } else {
            console.error("Failed to fetch working hours:", workingHoursData.error);
          }

          // Fetch event approvals (mock data for now since we don't have event API yet)
          // TODO: Replace with actual event API when available
          const mockEventApprovals = [
            {
              id: 1,
              title: "Blood Donation Camp",
              student: "Priya Sharma",
              department: "Computer Science",
              date: "2023-12-15",
              status: "pending",
              description: "Blood donation camp at college premises",
              submittedDate: "2023-12-10"
            },
            {
              id: 2,
              title: "Tree Plantation Drive",
              student: "Ravi Kumar",
              department: "Mechanical Engineering",
              date: "2023-12-20",
              status: "approved",
              description: "Environmental awareness and tree plantation",
              submittedDate: "2023-12-08"
            }
          ];
          
          setEventApprovals(mockEventApprovals);

          // Calculate counts
          const allItems = [...workingHoursData, ...mockEventApprovals];
          const pendingCount = allItems.filter(item => item.status === "pending").length;
          const approvedCount = allItems.filter(item => item.status === "approved").length;
          const rejectedCount = allItems.filter(item => item.status === "rejected").length;

          setCounts({
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount
          });

        } catch (error) {
          console.error("Fetch error:", error);
          if (error.message.includes("Failed to fetch")) {
            toast({
              title: "Server Error",
              description: "Cannot connect to server. Please make sure the backend is running.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Error",
              description: "Failed to fetch approvals: " + error.message,
              variant: "destructive"
            });
          }
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [userRole, userDepartment, toast]);



  const handleWorkingHoursApproval = async (entryId, action) => {
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
      setApproving(true);
      const response = await fetch(`http://localhost:5000/api/working-hours/${action}/${entryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
          title: `Working Hours ${action === "approve" ? "Approved" : "Rejected"}`,
          description: `Entry has been ${action === "approve" ? "approved" : "rejected"} successfully.`,
        });
        fetchApprovals(); // Refresh the data
      } else {
        throw new Error(data.error || `Failed to ${action} working hours`);
      }
    } catch (error) {
      console.error("Approval error:", error);
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
    } finally {
      setApproving(false);
    }
  };

  const handleEventApproval = (eventId, action) => {
    // TODO: Implement actual event approval when API is available
    toast({
      title: `Event ${action === "approve" ? "Approved" : "Rejected"}`,
      description: `Event has been ${action === "approve" ? "approved" : "rejected"} successfully.`,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800" style={{ color: "#ea580c" }}>
            <Clock className="w-3 h-3 mr-1" style={{ color: "#ea580c" }} />
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800" style={{ color: "#166534" }}>
            <CheckCircle className="w-3 h-3 mr-1" style={{ color: "#166534" }} />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800" style={{ color: "#dc2626" }}>
            <XCircle className="w-3 h-3 mr-1" style={{ color: "#dc2626" }} />
            Rejected
          </span>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredEventApprovals = eventApprovals.filter(
    approval =>
      approval.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.student.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWorkingHoursApprovals = workingHoursApprovals.filter(
    approval =>
      approval.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.activity_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!userRole || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg mt-4">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-nss-primary">Approval Management</h1>
            <p className="text-gray-600 mt-1">Review and manage working hours and event report approvals</p>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search approvals..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6" style={{ color: "#ea580c" }} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{counts.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6" style={{ color: "#166534" }} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{counts.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6" style={{ color: "#dc2626" }} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{counts.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Working Hours Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Working Hours Approvals
            </CardTitle>
            <CardDescription>
              Review student working hours submissions ({filteredWorkingHoursApprovals.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading working hours...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredWorkingHoursApprovals.length > 0 ? (
                    filteredWorkingHoursApprovals.map((approval) => (
                      <TableRow key={approval.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                {approval.student_name?.split(" ").map(name => name[0]).join("") || "SC"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-2">
                              <div className="text-sm font-medium">{approval.student_name || "Unknown Student"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{approval.department || "N/A"}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{approval.activity_name}</div>
                            <div className="text-xs text-gray-500">{approval.description}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{approval.hours} hrs</TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                            {new Date(approval.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(approval.status)}</TableCell>
                        <TableCell className="text-right">
                          {approval.status === "pending" && (
                            <div className="flex space-x-2 justify-end">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    disabled={approving}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {approving ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Approve Working Hours</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to approve the working hours entry for <strong>{approval.activity_name}</strong> by {approval.student_name}?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleWorkingHoursApproval(approval.id, "approve")}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Approve
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={approving}
                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                  >
                                    {approving ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <XCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Working Hours</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to reject the working hours entry for <strong>{approval.activity_name}</strong> by {approval.student_name}?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleWorkingHoursApproval(approval.id, "reject")}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Reject
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No working hours approvals found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Event Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Event Report Approvals
            </CardTitle>
            <CardDescription>
              Review student event reports and proposals ({filteredEventApprovals.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEventApprovals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{approval.title}</div>
                          <div className="text-sm text-gray-500">{approval.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {approval.student.split(" ").map(name => name[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-2">
                            <div className="text-sm font-medium">{approval.student}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{approval.department}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                          {new Date(approval.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(approval.status)}</TableCell>
                      <TableCell className="text-right">
                        {approval.status === "pending" && (
                          <div className="flex space-x-2 justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleEventApproval(approval.id, "approve")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEventApproval(approval.id, "reject")}
                              className="border-red-500 text-red-500 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredEventApprovals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No event approvals found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Approvals;
