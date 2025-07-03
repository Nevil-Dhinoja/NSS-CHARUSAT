
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
import { Search, Plus, Edit, Trash2, Mail, Clock, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const StudentLeaders = () => {
  const [userRole, setUserRole] = React.useState<"pc" | "po" | "sc" | null>(null);
  const [userName, setUserName] = React.useState<string>("");
  const [userEmail, setUserEmail] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const { toast } = useToast();

  // Mock student leaders data
  const studentLeaders = [
    { id: 1, name: "Ravi Kumar", studentId: "STU001", department: "Computer Science", email: "ravi@nss.edu", role: "Head Student Coordinator", workingHours: 45 },
    { id: 2, name: "Priya Sharma", studentId: "STU002", department: "Computer Science", email: "priya@nss.edu", role: "Student Coordinator", workingHours: 38 },
    { id: 3, name: "Amit Verma", studentId: "STU003", department: "Mechanical Engineering", email: "amit@nss.edu", role: "Student Coordinator", workingHours: 42 },
    { id: 4, name: "Neha Patel", studentId: "STU004", department: "Electrical Engineering", email: "neha@nss.edu", role: "Student Coordinator", workingHours: 36 },
    { id: 5, name: "Rahul Singh", studentId: "STU005", department: "Civil Engineering", email: "rahul@nss.edu", role: "Student Coordinator", workingHours: 39 },
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
    
    // Only Program Coordinator and Program Officer should access this page
    if (role !== "pc" && role !== "po") {
      window.location.href = "/dashboard";
      return;
    }
    
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
  }, []);

  const handleAddStudentLeader = () => {
    toast({
      title: "Student Leader Added",
      description: "New student coordinator has been registered successfully.",
    });
  };

  const filteredStudents = studentLeaders.filter(
    student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!userRole || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading student leaders...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-nss-primary">Student Leaders</h1>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-nss-primary hover:bg-nss-dark">
                <Plus className="mr-2 h-4 w-4" /> Add Student Coordinator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register Student Coordinator</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="student-name">Full Name</Label>
                  <Input id="student-name" placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-id">Student ID</Label>
                  <Input id="student-id" placeholder="Enter student ID" />
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
                <div className="flex items-center space-x-2">
                  <Switch id="head-coordinator" />
                  <Label htmlFor="head-coordinator">Assign as Head Student Coordinator</Label>
                </div>
                <p className="text-xs text-muted-foreground">Note: Only one Head Student Coordinator is allowed for the entire university.</p>
                <div className="flex justify-end">
                  <Button onClick={handleAddStudentLeader} className="bg-nss-primary hover:bg-nss-dark">
                    Register Student Coordinator
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card className="p-4">
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-lg font-semibold">Student Coordinators List</h2>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
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
                  <TableHead>Student ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Working Hours</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="font-medium flex items-center">
                        {student.name}
                        {student.role === "Head Student Coordinator" && (
                          <Star className="ml-1 h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Mail className="mr-1 h-3 w-3" />
                        <span>{student.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell>
                      {student.role === "Head Student Coordinator" ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                          Head Coordinator
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                          Student Coordinator
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>{student.workingHours} hours</span>
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
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No student coordinators found matching your search.
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

export default StudentLeaders;
