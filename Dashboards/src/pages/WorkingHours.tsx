
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Clock, Plus, Calendar, Check, X, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const WorkingHours = () => {
  const [userRole, setUserRole] = React.useState<"pc" | "po" | "sc" | null>(null);
  const [userName, setUserName] = React.useState<string>("");
  const [userEmail, setUserEmail] = React.useState<string>("");
  const [isHeadCoordinator, setIsHeadCoordinator] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { toast } = useToast();

  // Mock working hours data
  const workingHours = {
    self: {
      current: 45,
      target: 120,
      history: [
        { id: 1, activity: "Website Content Creation", hours: 3, date: "2023-05-10", status: "Approved" },
        { id: 2, activity: "Volunteer Training", hours: 2, date: "2023-05-08", status: "Pending" },
        { id: 3, activity: "Event Planning Meeting", hours: 1.5, date: "2023-05-05", status: "Approved" },
        { id: 4, activity: "Social Media Management", hours: 2, date: "2023-05-03", status: "Approved" },
        { id: 5, activity: "Documentation Work", hours: 3, date: "2023-05-01", status: "Approved" },
      ]
    },
    pending: [
      { id: 1, name: "Priya Sharma", activity: "Social Media Management", hours: 2, date: "2023-05-12" },
      { id: 2, name: "Rajesh Kumar", activity: "Volunteer Coordination", hours: 3, date: "2023-05-11" },
      { id: 3, name: "Anita Desai", activity: "Workshop Planning", hours: 1.5, date: "2023-05-10" },
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
    
    // Only Student Coordinator should access this page
    if (role !== "sc") {
      window.location.href = "/dashboard";
      return;
    }
    
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
    
    // For demo purposes, we'll set student with email student@nss.edu as head coordinator
    setIsHeadCoordinator(email === "student@nss.edu");
  }, []);

  const handleAddHours = () => {
    toast({
      title: "Working Hours Added",
      description: "Your working hours have been submitted for approval.",
    });
  };

  const handleApprove = (id: number) => {
    toast({
      title: "Hours Approved",
      description: `Working hours for ID #${id} have been approved.`,
    });
  };

  const handleReject = (id: number) => {
    toast({
      title: "Hours Rejected",
      description: `Working hours for ID #${id} have been rejected.`,
    });
  };

  // Calculate percentage
  const percentComplete = Math.round((workingHours.self.current / workingHours.self.target) * 100);

  // Filter working hours based on search query
  const filteredHistory = workingHours.self.history.filter(
    entry => 
      entry.activity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!userRole || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading working hours...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-nss-primary">Working Hours Management</h1>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-nss-primary hover:bg-nss-dark">
                <Plus className="mr-2 h-4 w-4" /> Add Working Hours
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Working Hours</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="activity-type">Activity Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">Event Management</SelectItem>
                      <SelectItem value="planning">Planning & Coordination</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                      <SelectItem value="social-media">Social Media Management</SelectItem>
                      <SelectItem value="training">Training & Workshops</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="activity-description">Activity Description</Label>
                  <Input id="activity-description" placeholder="Enter activity description" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="activity-date">Date</Label>
                    <Input id="activity-date" type="date" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hours-worked">Hours Worked</Label>
                    <Input id="hours-worked" type="number" step="0.5" min="0.5" max="8" />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleAddHours} className="bg-nss-primary hover:bg-nss-dark">
                    Submit Working Hours
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Progress Card */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="p-3 bg-nss-accent rounded-full">
                <Clock className="h-8 w-8 text-nss-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Working Hours Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Academic Year 2023-24
                </p>
              </div>
            </div>
            
            <div className="w-full md:w-1/2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">
                  {workingHours.self.current} / {workingHours.self.target} hours
                </span>
              </div>
              <Progress value={percentComplete} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                You have completed <span className="font-semibold text-nss-primary">{percentComplete}%</span> of your target hours.
              </p>
            </div>
          </div>
        </Card>
        
        {/* Working Hours History */}
        <Card className="p-4">
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-lg font-semibold">Working Hours History</h2>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead className="text-center">Hours</TableHead>
                  <TableHead className="text-center">Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.activity}</TableCell>
                    <TableCell className="text-center">{item.hours}</TableCell>
                    <TableCell className="text-center">{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${
                        item.status === "Approved" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredHistory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No working hours found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
        
        {/* Pending Approvals - Only for Head Coordinator */}
        {isHeadCoordinator && (
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Pending Hours Approvals</h2>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-center">Hours</TableHead>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workingHours.pending.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.activity}</TableCell>
                      <TableCell className="text-center">{item.hours}</TableCell>
                      <TableCell className="text-center">{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-green-500 text-green-500 hover:bg-green-50"
                            onClick={() => handleApprove(item.id)}
                          >
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() => handleReject(item.id)}
                          >
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {workingHours.pending.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No pending approvals found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WorkingHours;
