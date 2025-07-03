
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Search, Filter, CheckCircle, XCircle } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Approvals = () => {
  const [userRole, setUserRole] = React.useState<"pc" | "po" | "sc" | null>(null);
  const [userName, setUserName] = React.useState<string>("");
  const [userEmail, setUserEmail] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const { toast } = useToast();

  // Mock approvals data
  const approvals = {
    events: [
      { id: 1, type: "Event", name: "Campus Cleanup Drive", date: "2023-05-15", department: "Computer Science", requestedBy: "Prof. Patel" },
      { id: 2, type: "Event Report", name: "Tree Plantation Report", date: "2023-05-10", department: "Electrical Engineering", requestedBy: "Prof. Verma" },
    ],
    workingHours: [
      { id: 3, type: "Working Hours", name: "Ravi Kumar", date: "2023-05-14", department: "Mechanical Engineering", hours: 3.5, activity: "Event Coordination" },
      { id: 4, type: "Working Hours", name: "Priya Sharma", date: "2023-05-09", department: "Computer Science", hours: 2.0, activity: "Documentation" },
    ],
    volunteers: [
      { id: 5, type: "Volunteer List", name: "First Year Volunteers", date: "2023-05-12", department: "Civil Engineering", count: 25, submittedBy: "Dr. Gupta" },
      { id: 6, type: "Volunteer List", name: "Second Year Volunteers", date: "2023-05-08", department: "Information Technology", count: 20, submittedBy: "Prof. Joshi" },
    ]
  };

  React.useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("nssUserToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    
    // Get user role from localStorage
    const role = localStorage.getItem("nssUserRole") as "pc" | "po" | "sc" | null;
    const name = localStorage.getItem("nssUserName") || "";
    const email = localStorage.getItem("nssUserEmail") || "";
    
    // Only Program Coordinator should access this page
    if (role !== "pc") {
      window.location.href = "/dashboard";
      return;
    }
    
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
  }, []);

  const handleApprove = (type: string, id: number) => {
    toast({
      title: `${type} Approved`,
      description: `The ${type.toLowerCase()} with ID #${id} has been approved successfully.`,
    });
  };

  const handleReject = (type: string, id: number) => {
    toast({
      title: `${type} Rejected`,
      description: `The ${type.toLowerCase()} with ID #${id} has been rejected.`,
    });
  };

  // Filter approvals based on search query
  const filteredEvents = approvals.events.filter(
    item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHours = approvals.workingHours.filter(
    item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.activity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVolunteers = approvals.volunteers.filter(
    item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!userRole || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-nss-primary">Pending Approvals</h1>
          
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search approvals..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Card className="p-4">
          <Tabs defaultValue="events">
            <TabsList className="mb-4">
              <TabsTrigger value="events">
                Events
                <Badge className="ml-2 bg-nss-primary">{approvals.events.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="working-hours">
                Working Hours
                <Badge className="ml-2 bg-nss-primary">{approvals.workingHours.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="volunteers">
                Volunteers
                <Badge className="ml-2 bg-nss-primary">{approvals.volunteers.length}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="events">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.department}</TableCell>
                        <TableCell>{item.requestedBy}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-green-500 text-green-500 hover:bg-green-50"
                              onClick={() => handleApprove(item.type, item.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              onClick={() => handleReject(item.type, item.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredEvents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No event approvals found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="working-hours">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead className="text-center">Hours</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHours.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.department}</TableCell>
                        <TableCell>{item.activity}</TableCell>
                        <TableCell className="text-center">{item.hours}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-green-500 text-green-500 hover:bg-green-50"
                              onClick={() => handleApprove("Working Hours", item.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              onClick={() => handleReject("Working Hours", item.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredHours.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No working hours approvals found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="volunteers">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>List Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead className="text-center">Volunteer Count</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVolunteers.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.department}</TableCell>
                        <TableCell>{item.submittedBy}</TableCell>
                        <TableCell className="text-center">{item.count}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-green-500 text-green-500 hover:bg-green-50"
                              onClick={() => handleApprove("Volunteer List", item.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              onClick={() => handleReject("Volunteer List", item.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredVolunteers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No volunteer list approvals found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Approvals;
