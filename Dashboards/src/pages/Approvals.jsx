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
  Users
} from "lucide-react";

const Approvals = () => {
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [userDepartment, setUserDepartment] = React.useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [workingHours, setWorkingHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWorkingHours = async () => {
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
      const response = await fetch("http://localhost:5000/api/working-hours/all", {
        headers: {
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
        setWorkingHours(data);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch working hours",
          variant: "destructive"
        });
      }
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
          description: "Failed to fetch working hours: " + error.message,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id, action) => {
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
      const endpoint = action === "approve" 
        ? `http://localhost:5000/api/working-hours/approve/${id}`
        : `http://localhost:5000/api/working-hours/reject/${id}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
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
        // Find the working hours entry to get details for notification
        const entry = workingHours.find(wh => wh.id === id);
        
        // Add notification for the student (this would ideally be sent to the student's account)
        // For now, we'll add it to the current user's notifications as a demo
        const addNotification = (notification) => {
          const newNotification = {
            ...notification,
            id: `notification-${Date.now()}`,
            timestamp: new Date()
          };
          
          // Get existing notifications from localStorage
          const existingNotifications = JSON.parse(localStorage.getItem('nssNotifications') || '[]');
          const updatedNotifications = [newNotification, ...existingNotifications].slice(0, 50);
          localStorage.setItem('nssNotifications', JSON.stringify(updatedNotifications));
        };

        if (entry) {
          addNotification({
            type: 'working_hours',
            title: `Working Hours ${action === 'approve' ? 'Approved' : 'Rejected'}`,
            message: `${entry.activity_name} - ${entry.hours} hours has been ${action === 'approve' ? 'approved' : 'rejected'} by ${userName}`,
            status: action === 'approve' ? 'approved' : 'rejected',
            date: new Date(entry.date),
            priority: action === 'approve' ? 'low' : 'high'
          });
        }

        toast({
          title: `${action === "approve" ? "Approved" : "Rejected"}`,
          description: `Working hours have been ${action === "approve" ? "approved" : "rejected"} successfully.`,
          variant: action === "approve" ? "default" : "destructive",
        });
        fetchWorkingHours(); // Refresh the data
      } else {
        throw new Error(data.error || `Failed to ${action} working hours`);
      }
    } catch (error) {
      console.error(`${action} error:`, error);
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
      if (role !== "pc" && role !== "po") {
        window.location.href = "/dashboard";
        return;
      }
      setUserRole(role);
      setUserName(user.name);
      setUserEmail(user.email);
      setUserDepartment(user.department || "");
      fetchWorkingHours();
    } catch (err) {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  // Mock data for event approvals (keeping this for now)
  const eventApprovals = [
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

  const filteredEventApprovals = eventApprovals.filter(
    approval =>
      approval.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.student.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWorkingHoursApprovals = workingHours.filter(
    approval =>
      (approval.student_name && approval.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (approval.activity_name && approval.activity_name.toLowerCase().includes(searchQuery.toLowerCase()))
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
            <p className="text-gray-600 mt-1">
              {userRole === 'po' ? 
                'Review and manage working hours approvals for your department' :
                'Review and manage working hours approvals'
              }
            </p>
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
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {eventApprovals.filter(a => a.status === "pending").length +
                      workingHours.filter(a => a.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {eventApprovals.filter(a => a.status === "approved").length +
                      workingHours.filter(a => a.status === "approved").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {eventApprovals.filter(a => a.status === "rejected").length +
                      workingHours.filter(a => a.status === "rejected").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                              onClick={() => handleApproval(approval.id, "approve")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproval(approval.id, "reject")}
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

        {/* Working Hours Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Working Hours Approvals
            </CardTitle>
            <CardDescription>
              {userRole === 'po' ? 
                `Review student working hours submissions from your department (${filteredWorkingHoursApprovals.length})` :
                `Review student working hours submissions (${filteredWorkingHoursApprovals.length})`
              }
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
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
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
                                {approval.student_name?.split(" ").map(name => name[0]).join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-2">
                              <div className="text-sm font-medium">{approval.student_name || "Unknown"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{approval.department_name || "Unknown"}</TableCell>
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
                              <Button
                                size="sm"
                                onClick={() => handleApproval(approval.id, "approve")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproval(approval.id, "reject")}
                                className="border-red-500 text-red-500 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        {workingHours.length === 0 
                          ? "No working hours found. Students need to submit their working hours first."
                          : "No working hours found for the selected filters."
                        }
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
