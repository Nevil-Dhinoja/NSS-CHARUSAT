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
  Users,
  Mail,
  Phone,
  Calendar,
  User,
  Search,
  Filter,
  PlusCircle,
  Edit,
  Trash2,
  MapPin,
  GraduationCap
} from "lucide-react";

const StudentLeaders = () => {
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [isAddingLeader, setIsAddingLeader] = useState(false);
  const [isEditingLeader, setIsEditingLeader] = useState(false);
  const [editingLeader, setEditingLeader] = useState(null);
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

  // Mock data for studentLeaders
  const studentLeaders = [
    {
      id: 1,
      name: "Ravi Kumar",
      studentId: "CS21001",
      email: "ravi.kumar@college.edu",
      phone: "+91 9876543210",
      department: "Computer Science",
      year: "3rd Year",
      position: "Head Student Coordinator",
      joinDate: "2023-08-15"
    },
    {
      id: 2,
      name: "Priya Sharma",
      studentId: "ME21002",
      email: "priya.sharma@college.edu",
      phone: "+91 9876543211",
      department: "Mechanical Engineering",
      year: "2nd Year",
      position: "Student Coordinator",
      joinDate: "2023-09-01"
    },
    {
      id: 3,
      name: "Amit Patel",
      studentId: "EC21003",
      email: "amit.patel@college.edu",
      phone: "+91 9876543212",
      department: "Electronics & Communication",
      year: "3rd Year",
      position: "Student Coordinator",
      joinDate: "2023-08-20"
    },
    {
      id: 4,
      name: "Sneha Gupta",
      studentId: "IT21004",
      email: "sneha.gupta@college.edu",
      phone: "+91 9876543213",
      department: "Information Technology",
      year: "2nd Year",
      position: "Student Coordinator",
      joinDate: "2023-09-10"
    }
  ];

  const [newLeader, setNewLeader] = useState({
    name: "",
    studentId: "",
    email: "",
    phone: "",
    department: "",
    year: "",
    position: "Student Coordinator"
  });

  const handleAddLeader = () => {
    console.log("Adding new leader:", newLeader);
    toast({
      title: "Student Leader Added",
      description: "New student leader has been added successfully.",
    });
    setIsAddingLeader(false);
    setNewLeader({
      name: "",
      studentId: "",
      email: "",
      phone: "",
      department: "",
      year: "",
      position: "Student Coordinator"
    });
  };

  const handleEditLeader = (leader) => {
    setEditingLeader(leader);
    setNewLeader({
      name: leader.name,
      studentId: leader.studentId,
      email: leader.email,
      phone: leader.phone,
      department: leader.department,
      year: leader.year,
      position: leader.position
    });
    setIsEditingLeader(true);
  };

  const handleUpdateLeader = () => {
    console.log("Updating leader:", editingLeader.id, newLeader);
    toast({
      title: "Student Leader Updated",
      description: "Student leader information has been updated successfully.",
    });
    setIsEditingLeader(false);
    setEditingLeader(null);
    setNewLeader({
      name: "",
      studentId: "",
      email: "",
      phone: "",
      department: "",
      year: "",
      position: "Student Coordinator"
    });
  };

  const handleDeleteLeader = (leaderId, leaderName) => {
    toast({
      title: "Student Leader Removed",
      description: `${leaderName} has been removed from student leaders.`,
      variant: "destructive",
    });
  };

  const filteredLeaders = studentLeaders.filter(leader => {
    const matchesSearch = leader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leader.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leader.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || leader.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getPositionBadge = (position) => {
    return position === "Head Student Coordinator"
      ? <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Head Coordinator</Badge>
      : <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Coordinator</Badge>;
  };

  if (!userRole || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg mt-4">Loading student leaders...</p>
        </div>
      </div>
    );
  }

  const departments = [...new Set(studentLeaders.map(leader => leader.department))];

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-nss-primary">Student Leaders</h1>
            <p className="text-gray-600 mt-1">Manage NSS student coordinators and their activities</p>
          </div>
          <div className="flex gap-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search student leaders..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {(userRole === "pc" || userRole === "po") && (
              <Dialog open={isAddingLeader} onOpenChange={setIsAddingLeader}>
                <DialogTrigger asChild>
                  <Button className="bg-nss-primary hover:bg-nss-dark">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Leader
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Student Leader</DialogTitle>
                    <DialogDescription>
                      Add a new student coordinator to the NSS team.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={newLeader.name}
                        onChange={(e) => setNewLeader({ ...newLeader, name: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        value={newLeader.studentId}
                        onChange={(e) => setNewLeader({ ...newLeader, studentId: e.target.value })}
                        placeholder="Enter student ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newLeader.email}
                        onChange={(e) => setNewLeader({ ...newLeader, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newLeader.phone}
                        onChange={(e) => setNewLeader({ ...newLeader, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <select
                        id="department"
                        value={newLeader.department}
                        onChange={(e) => setNewLeader({ ...newLeader, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Electronics & Communication">Electronics & Communication</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Academic Year</Label>
                      <select
                        id="year"
                        value={newLeader.year}
                        onChange={(e) => setNewLeader({ ...newLeader, year: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <select
                        id="position"
                        value={newLeader.position}
                        onChange={(e) => setNewLeader({ ...newLeader, position: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="Student Coordinator">Student Coordinator</option>
                        <option value="Head Student Coordinator">Head Student Coordinator</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddingLeader(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddLeader} className="bg-nss-primary hover:bg-nss-dark">
                        Add Leader
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditingLeader} onOpenChange={setIsEditingLeader}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Student Leader</DialogTitle>
              <DialogDescription>
                Update student coordinator information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={newLeader.name}
                  onChange={(e) => setNewLeader({ ...newLeader, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-studentId">Student ID</Label>
                <Input
                  id="edit-studentId"
                  value={newLeader.studentId}
                  onChange={(e) => setNewLeader({ ...newLeader, studentId: e.target.value })}
                  placeholder="Enter student ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={newLeader.email}
                  onChange={(e) => setNewLeader({ ...newLeader, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={newLeader.phone}
                  onChange={(e) => setNewLeader({ ...newLeader, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <select
                  id="edit-department"
                  value={newLeader.department}
                  onChange={(e) => setNewLeader({ ...newLeader, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year">Academic Year</Label>
                <select
                  id="edit-year"
                  value={newLeader.year}
                  onChange={(e) => setNewLeader({ ...newLeader, year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="edit-position">Position</Label>
                <select
                  id="edit-position"
                  value={newLeader.position}
                  onChange={(e) => setNewLeader({ ...newLeader, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Student Coordinator">Student Coordinator</option>
                  <option value="Head Student Coordinator">Head Student Coordinator</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditingLeader(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateLeader} className="bg-nss-primary hover:bg-nss-dark">
                  Update Leader
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Leaders</p>
                  <p className="text-2xl font-bold text-gray-900">{studentLeaders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Head Coordinators</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {studentLeaders.filter(l => l.position === "Head Student Coordinator").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Leaders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Student Leaders Directory
            </CardTitle>
            <CardDescription>
              Manage NSS student coordinators and track their information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaders.map((leader) => (
                    <TableRow key={leader.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {leader.name.split(" ").map(name => name[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <div className="font-medium">{leader.name}</div>
                            <div className="text-sm text-gray-500">{leader.studentId} • {leader.year}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 text-gray-400 mr-1" />
                            <span>{leader.email}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 text-gray-400 mr-1" />
                            <span>{leader.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{leader.department}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getPositionBadge(leader.position)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => handleEditLeader(leader)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {(userRole === "pc" || userRole === "po") && (
                            <Button
                              onClick={() => handleDeleteLeader(leader.id, leader.name)}
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLeaders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No student leaders found matching your criteria.
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

export default StudentLeaders;
