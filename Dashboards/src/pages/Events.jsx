
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Search, Plus, FileText, CheckCircle, XCircle, Filter } from "lucide-react";
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

const Events = () => {
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const { toast } = useToast();

  // Mock events data
  const events = [
    { 
      id: 1, 
      name: "Tree Plantation Drive", 
      date: "2023-05-20", 
      department: "University-wide", 
      mode: "Offline", 
      status: "Upcoming",
      scheme: "Green Campus Initiative",
      faculties: 8,
      students: 75,
      beneficiaries: 200
    },
    { 
      id: 2, 
      name: "Digital Literacy Workshop", 
      date: "2023-05-25", 
      department: "Computer Science", 
      mode: "Hybrid", 
      status: "Upcoming",
      scheme: "Digital India",
      faculties: 4,
      students: 40,
      beneficiaries: 120
    },
    { 
      id: 3, 
      name: "Blood Donation Camp", 
      date: "2023-05-05", 
      department: "University-wide", 
      mode: "Offline", 
      status: "Completed",
      scheme: "Healthcare Initiative",
      faculties: 12,
      students: 85,
      beneficiaries: 250,
      reportSubmitted: true
    },
    { 
      id: 4, 
      name: "Career Guidance Workshop", 
      date: "2023-05-02", 
      department: "Computer Science", 
      mode: "Online", 
      status: "Completed",
      scheme: "Skill Development",
      faculties: 6,
      students: 50,
      beneficiaries: 150,
      reportSubmitted: false
    },
    { 
      id: 5, 
      name: "Rural Health Awareness", 
      date: "2023-04-28", 
      department: "Medical", 
      mode: "Offline", 
      status: "Completed",
      scheme: "Rural Connect",
      faculties: 8,
      students: 45,
      beneficiaries: 300,
      reportSubmitted: true
    },
  ];

  React.useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("nssUserToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    
    // Get user role from localStorage
    const role = localStorage.getItem("nssUserRole");
    const name = localStorage.getItem("nssUserName") || "";
    const email = localStorage.getItem("nssUserEmail") || "";
    
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
  }, []);

  const handleAddEvent = () => {
    toast({
      title: "Event Added",
      description: "New event has been added successfully and sent for approval.",
    });
  };

  // Filter events based on search query and selected tab
  const filteredUpcomingEvents = events
    .filter(event => event.status === "Upcoming")
    .filter(event => 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.scheme.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredCompletedEvents = events
    .filter(event => event.status === "Completed")
    .filter(event => 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.scheme.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (!userRole || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-nss-primary">Events Management</h1>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-nss-primary hover:bg-nss-dark">
                <Plus className="mr-2 h-4 w-4" /> Add New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="event-name">Event Name</Label>
                  <Input id="event-name" placeholder="Enter event name" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-date">Event Date</Label>
                    <Input id="event-date" type="date" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-mode">Event Mode</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="university">University-wide</SelectItem>
                        <SelectItem value="cse">Computer Science</SelectItem>
                        <SelectItem value="mech">Mechanical Engineering</SelectItem>
                        <SelectItem value="elec">Electrical Engineering</SelectItem>
                        <SelectItem value="civil">Civil Engineering</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="scheme">Scheme</Label>
                    <Input id="scheme" placeholder="Enter scheme name" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="faculties">Number of Faculties</Label>
                    <Input id="faculties" type="number" min="1" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="students">Number of Students</Label>
                    <Input id="students" type="number" min="1" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="beneficiaries">Number of Beneficiaries</Label>
                    <Input id="beneficiaries" type="number" min="0" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Event Description</Label>
                  <Input id="description" placeholder="Enter event description" />
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleAddEvent} className="bg-nss-primary hover:bg-nss-dark">
                    Add Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card className="p-4">
          <Tabs defaultValue="upcoming">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 gap-4">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                <TabsTrigger value="completed">Completed Events</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center space-x-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
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
            
            <TabsContent value="upcoming" className="space-y-4">
              {filteredUpcomingEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg text-nss-primary">{event.name}</h3>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          {event.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <p>Department: {event.department}</p>
                        <p>Mode: {event.mode}</p>
                        <p>Scheme: {event.scheme}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-2">
                      <div className="bg-gray-100 p-2 rounded-md text-sm">
                        <p className="text-xs text-muted-foreground">Participation</p>
                        <div className="grid grid-cols-3 gap-4 mt-1 text-center">
                          <div>
                            <p className="font-semibold">{event.faculties}</p>
                            <p className="text-xs">Faculties</p>
                          </div>
                          <div>
                            <p className="font-semibold">{event.students}</p>
                            <p className="text-xs">Students</p>
                          </div>
                          <div>
                            <p className="font-semibold">{event.beneficiaries}</p>
                            <p className="text-xs">Beneficiaries</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button size="sm" className="bg-nss-primary hover:bg-nss-dark">
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredUpcomingEvents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming events found matching your search.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {filteredCompletedEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg text-nss-primary">{event.name}</h3>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                          {event.status}
                        </Badge>
                        {event.reportSubmitted ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            Report Submitted
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                            Report Pending
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <p>Department: {event.department}</p>
                        <p>Mode: {event.mode}</p>
                        <p>Scheme: {event.scheme}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-2">
                      <div className="bg-gray-100 p-2 rounded-md text-sm">
                        <p className="text-xs text-muted-foreground">Participation</p>
                        <div className="grid grid-cols-3 gap-4 mt-1 text-center">
                          <div>
                            <p className="font-semibold">{event.faculties}</p>
                            <p className="text-xs">Faculties</p>
                          </div>
                          <div>
                            <p className="font-semibold">{event.students}</p>
                            <p className="text-xs">Students</p>
                          </div>
                          <div>
                            <p className="font-semibold">{event.beneficiaries}</p>
                            <p className="text-xs">Beneficiaries</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!event.reportSubmitted && (
                          <Button size="sm" className="bg-nss-primary hover:bg-nss-dark">
                            <FileText className="h-4 w-4 mr-1" />
                            Submit Report
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {event.reportSubmitted && (
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            View Report
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredCompletedEvents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No completed events found matching your search.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Events;
