
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Trash2, Mail, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProgramOfficers = () => {
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const { toast } = useToast();

  // Mock program officers data
  const programOfficers = [
    { id: 1, name: "Prof. Patel", empId: "EMP001", department: "Computer Science & Engineering", email: "patel@nss.edu", phone: "9876543210" },
    { id: 2, name: "Dr. Sharma", empId: "EMP002", department: "Mechanical Engineering", email: "sharma@nss.edu", phone: "9876543211" },
    { id: 3, name: "Prof. Verma", empId: "EMP003", department: "Electrical Engineering", email: "verma@nss.edu", phone: "9876543212" },
    { id: 4, name: "Dr. Gupta", empId: "EMP004", department: "Civil Engineering", email: "gupta@nss.edu", phone: "9876543213" },
    { id: 5, name: "Prof. Joshi", empId: "EMP005", department: "Information Technology", email: "joshi@nss.edu", phone: "9876543214" },
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
    
    // Only Program Coordinator should access this page
    if (role !== "pc") {
      window.location.href = "/dashboard";
      return;
    }
    
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
  }, []);

  const handleAddProgramOfficer = () => {
    toast({
      title: "Program Officer Added",
      description: "New program officer has been registered successfully.",
    });
  };

  const filteredOfficers = programOfficers.filter(
    officer => 
      officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.empId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!userRole || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading program officers...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-nss-primary">Program Officers</h1>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-nss-primary hover:bg-nss-dark">
                <Plus className="mr-2 h-4 w-4" /> Add Program Officer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Register New Program Officer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="officer-name">Full Name</Label>
                  <Input id="officer-name" placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-id">Employee ID</Label>
                  <Input id="employee-id" placeholder="Enter employee ID" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cse">Computer Science & Engineering</SelectItem>
                      <SelectItem value="mech">Mechanical Engineering</SelectItem>
                      <SelectItem value="elec">Electrical Engineering</SelectItem>
                      <SelectItem value="civil">Civil Engineering</SelectItem>
                      <SelectItem value="it">Information Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" placeholder="Enter email address" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="Enter phone number" />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddProgramOfficer} className="bg-nss-primary hover:bg-nss-dark">
                    Register Program Officer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card className="p-4">
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-lg font-semibold">Program Officers List</h2>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search officers..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOfficers.map((officer) => (
                  <TableRow key={officer.id}>
                    <TableCell className="font-medium">{officer.name}</TableCell>
                    <TableCell>{officer.empId}</TableCell>
                    <TableCell>{officer.department}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-xs">
                          <Mail className="mr-1 h-3 w-3" />
                          <span>{officer.email}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <Phone className="mr-1 h-3 w-3" />
                          <span>{officer.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex space-x-2 justify-end">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOfficers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No program officers found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProgramOfficers;
