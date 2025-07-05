import React, { useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
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
      if (role !== "pc" && role !== "po") {
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

  // Mock data for event approvals
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

  // Mock data for working hours approvals
  const workingHoursApprovals = [
    {
      id: 1,
      student: "Amit Patel",
      department: "Electronics & Communication",
      hours: 8,
      activity: "Community Service",
      date: "2023-12-14",
      status: "pending",
      description: "Teaching underprivileged children"
    },
    {
      id: 2,
      student: "Sneha Gupta",
      department: "Information Technology",
      hours: 6,
      activity: "Environmental Work",
      date: "2023-12-12",
      status: "approved",
      description: "Cleaning local park area"
    }
  ];

  const handleApproval = (type, id, action) => {
    toast({
      title: `${action === "approve" ? "Approved" : "Rejected"}`,
      description: `${type} has been ${action === "approve" ? "approved" : "rejected"} successfully.`,
      variant: action === "approve" ? "default" : "destructive",
    });
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

  const filteredEventApprovals = eventApprovals.filter(
    approval =>
      approval.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.student.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWorkingHoursApprovals = workingHoursApprovals.filter(
    approval =>
      approval.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.activity.toLowerCase().includes(searchQuery.toLowerCase())
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
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {eventApprovals.filter(a => a.status === "pending").length +
                      workingHoursApprovals.filter(a => a.status === "pending").length}
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
                      workingHoursApprovals.filter(a => a.status === "approved").length}
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
                      workingHoursApprovals.filter(a => a.status === "rejected").length}
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
                              onClick={() => handleApproval("Event", approval.id, "approve")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproval("Event", approval.id, "reject")}
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
                  {filteredWorkingHoursApprovals.map((approval) => (
                    <TableRow key={approval.id}>
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
                        <div>
                          <div className="font-medium text-sm">{approval.activity}</div>
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
                              onClick={() => handleApproval("Working Hours", approval.id, "approve")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproval("Working Hours", approval.id, "reject")}
                              className="border-red-500 text-red-500 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredWorkingHoursApprovals.length === 0 && (
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
      </div>
    </DashboardLayout>
  );
};

export default Approvals;
