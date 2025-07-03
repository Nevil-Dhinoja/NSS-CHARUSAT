
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Search, Upload, Download, Filter, Users, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Volunteers = () => {
  const [userRole, setUserRole] = React.useState<"pc" | "po" | "sc" | null>(null);
  const [userName, setUserName] = React.useState<string>("");
  const [userEmail, setUserEmail] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedYear, setSelectedYear] = React.useState("all");
  const [selectedDepartment, setSelectedDepartment] = React.useState("all");
  const { toast } = useToast();

  // Mock volunteers data
  const volunteers = [
    { id: 1, name: "Rajesh Kumar", studentId: "STU101", department: "Computer Science", year: "2023", email: "rajesh@example.com", phone: "9876543220", joinDate: "2023-07-15" },
    { id: 2, name: "Anita Desai", studentId: "STU102", department: "Mechanical Engineering", year: "2023", email: "anita@example.com", phone: "9876543221", joinDate: "2023-07-15" },
    { id: 3, name: "Vikram Singh", studentId: "STU103", department: "Electrical Engineering", year: "2022", email: "vikram@example.com", phone: "9876543222", joinDate: "2022-08-10" },
    { id: 4, name: "Meera Patel", studentId: "STU104", department: "Civil Engineering", year: "2022", email: "meera@example.com", phone: "9876543223", joinDate: "2022-08-10" },
    { id: 5, name: "Prakash Joshi", studentId: "STU105", department: "Information Technology", year: "2021", email: "prakash@example.com", phone: "9876543224", joinDate: "2021-07-22" },
    { id: 6, name: "Divya Sharma", studentId: "STU106", department: "Computer Science", year: "2021", email: "divya@example.com", phone: "9876543225", joinDate: "2021-07-22" },
  ];

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
    
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
  }, []);

  const handleUploadVolunteers = () => {
    toast({
      title: "Volunteers List Uploaded",
      description: "The volunteers list has been uploaded successfully and sent for approval.",
    });
  };

  // Filter volunteers based on search query, selected year, and department
  const filteredVolunteers = volunteers.filter(
    volunteer => 
      (selectedYear === "all" || volunteer.year === selectedYear) &&
      (selectedDepartment === "all" || volunteer.department === selectedDepartment) &&
      (volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!userRole || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading volunteers...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-nss-primary">Volunteers Management</h1>
          
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-nss-primary hover:bg-nss-dark">
                  <Upload className="mr-2 h-4 w-4" /> Upload Volunteer List
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Volunteers List</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="academic-year">Academic Year</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023">2023-24</SelectItem>
                        <SelectItem value="2022">2022-23</SelectItem>
                        <SelectItem value="2021">2021-22</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Label htmlFor="file">Excel File</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                      <Input id="file" type="file" className="hidden" />
                      <Label 
                        htmlFor="file" 
                        className="cursor-pointer flex flex-col items-center justify-center"
                      >
                        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                        <span className="text-sm font-medium">Click to upload volunteers list (Excel format)</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          Upload Excel file with student details
                        </span>
                      </Label>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" /> Download Template
                    </Button>
                    <Button onClick={handleUploadVolunteers} className="bg-nss-primary hover:bg-nss-dark">
                      Upload Volunteers List
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" /> Add Single Volunteer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Volunteer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="academic-year">Academic Year</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023">2023-24</SelectItem>
                        <SelectItem value="2022">2022-23</SelectItem>
                        <SelectItem value="2021">2021-22</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="volunteer-name">Full Name</Label>
                      <Input id="volunteer-name" placeholder="Enter full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student-id">Student ID</Label>
                      <Input id="student-id" placeholder="Enter student ID" />
                    </div>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="Enter email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="Enter phone number" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-nss-primary hover:bg-nss-dark">
                      Add Volunteer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 gap-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-nss-primary" />
              <h2 className="text-lg font-semibold">Volunteers List</h2>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2023">2023-24</SelectItem>
                  <SelectItem value="2022">2022-23</SelectItem>
                  <SelectItem value="2021">2021-22</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                  <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                  <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search volunteers..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Export to Excel</DropdownMenuItem>
                  <DropdownMenuItem>Print List</DropdownMenuItem>
                  <DropdownMenuItem>Show Inactive Volunteers</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Joined On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVolunteers.map((volunteer) => (
                  <TableRow key={volunteer.id}>
                    <TableCell className="font-medium">{volunteer.name}</TableCell>
                    <TableCell>{volunteer.studentId}</TableCell>
                    <TableCell>{volunteer.department}</TableCell>
                    <TableCell>{volunteer.year}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{volunteer.email}</div>
                        <div>{volunteer.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(volunteer.joinDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {filteredVolunteers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No volunteers found matching your criteria.
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

export default Volunteers;
