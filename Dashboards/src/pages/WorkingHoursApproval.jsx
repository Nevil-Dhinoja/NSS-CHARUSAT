
import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Eye
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

const WorkingHoursApproval = () => {
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  // Mock data for working hours submissions
  const pendingHours = [
    {
      id: 1,
      studentName: "Ravi Kumar",
      studentId: "CS21001",
      activity: "Community Clean-up Drive",
      description: "Organized and participated in a community clean-up drive in the local neighborhood. Coordinated with 25 volunteers and managed waste segregation activities.",
      date: "2023-05-15",
      hours: 4,
      submittedOn: "2023-05-16",
      evidence: "photos_cleanup.pdf"
    },
    {
      id: 2,
      studentName: "Priya Sharma",
      studentId: "ME21002",
      activity: "Blood Donation Camp",
      description: "Assisted in organizing blood donation camp at the college campus. Managed registration and helped coordinate with medical team.",
      date: "2023-05-14",
      hours: 6,
      submittedOn: "2023-05-15",
      evidence: "blood_camp_report.pdf"
    },
    {
      id: 3,
      studentName: "Amit Patel",
      studentId: "EC21003",
      activity: "Tree Plantation Drive",
      description: "Led tree plantation activity in rural area. Planted 50 saplings and educated local community about environmental conservation.",
      date: "2023-05-12",
      hours: 3,
      submittedOn: "2023-05-13",
      evidence: "plantation_photos.pdf"
    },
    {
      id: 4,
      studentName: "Sneha Gupta",
      studentId: "IT21004",
      activity: "Digital Literacy Workshop",
      description: "Conducted digital literacy workshop for elderly citizens. Taught basic computer skills and internet safety to 20 participants.",
      date: "2023-05-10",
      hours: 5,
      submittedOn: "2023-05-11",
      evidence: "workshop_attendance.pdf"
    }
  ];

  const approvedHours = [
    {
      id: 5,
      studentName: "Ravi Kumar",
      studentId: "CS21001",
      activity: "Website Content Creation",
      date: "2023-05-08",
      hours: 3,
      approvedOn: "2023-05-09",
      approvedBy: "Prof. Patel"
    },
    {
      id: 6,
      studentName: "Priya Sharma",
      studentId: "ME21002",
      activity: "Volunteer Training Session",
      date: "2023-05-05",
      hours: 2,
      approvedOn: "2023-05-06",
      approvedBy: "Prof. Patel"
    }
  ];

  const rejectedHours = [
    {
      id: 7,
      studentName: "Amit Patel",
      studentId: "EC21003",
      activity: "Personal Study Session",
      date: "2023-05-03",
      hours: 4,
      rejectedOn: "2023-05-04",
      rejectedBy: "Prof. Patel",
      reason: "Personal study does not qualify as NSS working hours"
    }
  ];

  const handleApprove = (id) => {
    
    // In real app, this would make API call
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/working-hours/${id}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Working Hours Rejected",
          description: "The working hours have been rejected successfully.",
        });
        fetchWorkingHours(); // Refresh the list
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Failed to reject working hours",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject working hours",
        variant: "destructive",
      });
    }
  };

  const filteredPendingHours = pendingHours.filter(item =>
    item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.activity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!userRole || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Working Hours Approval</h1>
            <p className="text-muted-foreground">Review and approve student coordinator working hours</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="bg-amber-50 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approval</p>
                  <h3 className="text-2xl font-bold text-blue-900">{pendingHours.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved This Month</p>
                  <h3 className="text-2xl font-bold text-blue-900">{approvedHours.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rejected This Month</p>
                  <h3 className="text-2xl font-bold text-blue-900">{rejectedHours.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by student name or activity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Working Hours Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-900">Working Hours Management</CardTitle>
            <CardDescription>
              Review, approve, or reject student working hours submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">Pending ({pendingHours.length})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({approvedHours.length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({rejectedHours.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="mt-6">
                <div className="space-y-4">
                  {filteredPendingHours.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{item.studentName}</h3>
                            <Badge variant="outline">{item.studentId}</Badge>
                            <span className="text-sm text-muted-foreground">
                              Submitted on {new Date(item.submittedOn).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-medium text-blue-900 mb-1">{item.activity}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</span>
                            <span><strong>Hours:</strong> {item.hours}</span>
                            <span><strong>Evidence:</strong> {item.evidence}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Working Hours Details</DialogTitle>
                                <DialogDescription>
                                  Review the complete details of this working hours submission
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="font-medium">Student Name</label>
                                    <p>{item.studentName}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Student ID</label>
                                    <p>{item.studentId}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Activity</label>
                                    <p>{item.activity}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Hours</label>
                                    <p>{item.hours} hours</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Date</label>
                                    <p>{new Date(item.date).toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">Evidence</label>
                                    <p>{item.evidence}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="font-medium">Description</label>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-green-500 text-green-500 hover:bg-green-50"
                            onClick={() => handleApprove(item.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() => handleReject(item.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredPendingHours.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No matching pending approvals found." : "No pending working hours approvals."}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="approved" className="mt-6">
                <div className="space-y-4">
                  {approvedHours.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{item.studentName}</h3>
                            <Badge variant="outline">{item.studentId}</Badge>
                            <Badge className="bg-green-100 text-green-800">Approved</Badge>
                          </div>
                          <h4 className="font-medium text-blue-900 mb-1">{item.activity}</h4>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</span>
                            <span><strong>Hours:</strong> {item.hours}</span>
                            <span><strong>Approved by:</strong> {item.approvedBy}</span>
                            <span><strong>Approved on:</strong> {new Date(item.approvedOn).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {approvedHours.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No approved working hours this month.
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="rejected" className="mt-6">
                <div className="space-y-4">
                  {rejectedHours.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 bg-red-50">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{item.studentName}</h3>
                            <Badge variant="outline">{item.studentId}</Badge>
                            <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                          </div>
                          <h4 className="font-medium text-blue-900 mb-1">{item.activity}</h4>
                          <p className="text-sm text-red-600 mb-2"><strong>Reason:</strong> {item.reason}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</span>
                            <span><strong>Hours:</strong> {item.hours}</span>
                            <span><strong>Rejected by:</strong> {item.rejectedBy}</span>
                            <span><strong>Rejected on:</strong> {new Date(item.rejectedOn).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {rejectedHours.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No rejected working hours this month.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WorkingHoursApproval;
