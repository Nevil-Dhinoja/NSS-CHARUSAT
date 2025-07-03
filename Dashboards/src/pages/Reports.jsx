import React, { useState } from "react";
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
  Upload
} from "lucide-react";

const Reports = () => {
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isAddingReport, setIsAddingReport] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const token = localStorage.getItem("nssUserToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    
    const role = localStorage.getItem("nssUserRole");
    const name = localStorage.getItem("nssUserName") || "";
    const email = localStorage.getItem("nssUserEmail") || "";
    
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
  }, []);

  // Mock data for reports
  const reports = [
    {
      id: 1,
      title: "Blood Donation Camp Report",
      type: "Event Report",
      author: "Priya Sharma",
      department: "Mechanical Engineering",
      date: "2023-12-15",
      status: "approved",
      downloadUrl: "#",
      description: "Comprehensive report on the blood donation camp organized at the college premises"
    },
    {
      id: 2,
      title: "Tree Plantation Activity",
      type: "Working Hours Report",
      author: "Ravi Kumar",
      department: "Computer Science",
      date: "2023-12-10",
      status: "pending",
      downloadUrl: "#",
      description: "Report on tree plantation drive conducted in the college campus"
    },
    {
      id: 3,
      title: "Digital Literacy Workshop",
      type: "Event Report",
      author: "Sneha Gupta",
      department: "Information Technology",
      date: "2023-12-08",
      status: "approved",
      downloadUrl: "#",
      description: "Workshop conducted for local community on digital literacy"
    },
    {
      id: 4,
      title: "Community Service Hours",
      type: "Working Hours Report",
      author: "Amit Patel",
      department: "Electronics & Communication",
      date: "2023-12-05",
      status: "rejected",
      downloadUrl: "#",
      description: "Monthly community service hours compilation"
    }
  ];

  const [newReport, setNewReport] = useState({
    title: "",
    type: "Event Report",
    description: "",
    file: null
  });

  const handleAddReport = () => {
    console.log("Adding new report:", newReport);
    toast({
      title: "Report Submitted",
      description: "Your report has been submitted for review.",
    });
    setIsAddingReport(false);
    setNewReport({
      title: "",
      type: "Event Report",
      description: "",
      file: null
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewReport({...newReport, file: file});
    }
  };

  const handleDownload = (reportId, title) => {
    toast({
      title: "Downloading Report",
      description: `Downloading ${title}...`,
    });
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || report.type === filterType;
    return matchesSearch && matchesFilter;
  });

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
          <p className="text-lg mt-4">Loading reports...</p>
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
            <h1 className="text-2xl font-bold text-nss-primary">Reports Management</h1>
            <p className="text-gray-600 mt-1">Manage and review NSS activity reports and documentation</p>
          </div>
          <div className="flex gap-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reports..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="all">All Reports</option>
              <option value="Event Report">Event Reports</option>
              <option value="Working Hours Report">Working Hours Reports</option>
            </select>
            {(userRole === "sc" || userRole === "po") && (
              <Dialog open={isAddingReport} onOpenChange={setIsAddingReport}>
                <DialogTrigger asChild>
                  <Button className="bg-nss-primary hover:bg-nss-dark">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Submit Report
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit New Report</DialogTitle>
                    <DialogDescription>
                      Submit a new report for NSS activities or events.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Report Title</Label>
                      <Input
                        id="title"
                        value={newReport.title}
                        onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                        placeholder="Enter report title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Report Type</Label>
                      <select
                        id="type"
                        value={newReport.type}
                        onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="Event Report">Event Report</option>
                        <option value="Working Hours Report">Working Hours Report</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        value={newReport.description}
                        onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                        placeholder="Enter report description"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file">Upload Report File</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="file"
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileChange}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <Upload className="h-4 w-4 text-gray-400" />
                      </div>
                      {newReport.file && (
                        <p className="text-sm text-gray-600">Selected: {newReport.file.name}</p>
                      )}
                      <p className="text-xs text-gray-500">Supported formats: PDF, DOC, DOCX, TXT (Max: 10MB)</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddingReport(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddReport} className="bg-nss-primary hover:bg-nss-dark">
                        Submit Report
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Event Reports</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.filter(r => r.type === "Event Report").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Working Hours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.filter(r => r.type === "Working Hours Report").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Reports Archive
            </CardTitle>
            <CardDescription>
              View, download, and manage all NSS activity reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.title}</div>
                          <div className="text-sm text-gray-500">{report.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {report.author.split(" ").map(name => name[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-2">
                            <div className="text-sm font-medium">{report.author}</div>
                            <div className="text-xs text-gray-500">{report.department}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getTypeIcon(report.type)}
                          <span className="ml-2 text-sm">{report.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                          {new Date(report.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {report.status === "approved" && (
                            <Button 
                              onClick={() => handleDownload(report.id, report.title)}
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredReports.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No reports found matching your criteria.
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

export default Reports;
