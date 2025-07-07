import React, { useState, useEffect } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Mail,
  Calendar,
  User,
  Search,
  Filter,
  PlusCircle,
  Edit,
  Trash2,
  MapPin,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const StudentLeaders = () => {
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [userDepartment, setUserDepartment] = React.useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingLeader, setIsAddingLeader] = useState(false);
  const [isEditingLeader, setIsEditingLeader] = useState(false);
  const [editingLeader, setEditingLeader] = useState(null);
  const [studentLeaders, setStudentLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
      setUserDepartment(user.department || "");
    } catch (err) {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  // Fetch student leaders when user data is loaded
  React.useEffect(() => {
    if (userRole && userDepartment) {
      fetchStudentLeaders();
    }
  }, [userRole, userDepartment]);

  const fetchStudentLeaders = async () => {
    const token = localStorage.getItem("nssUserToken");
    try {
      // Fetch all student coordinators
      const roleName = encodeURIComponent("Student Coordinator");
      const response = await fetch(`http://localhost:5000/api/auth/users/${roleName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Filter based on user role and department
        let filteredLeaders;
        if (userRole === "pc" || userRole === "program coordinator") {
          // PC can see all departments
          filteredLeaders = data;
        } else if (userRole === "po" || userRole === "program officer") {
          // PO can only see their department
          filteredLeaders = data.filter(user => 
            user.department_name === userDepartment || 
            user.department_name === userDepartment + " Engineering"
          );
        } else {
          // Default to CE for other roles
          filteredLeaders = data.filter(user => 
            user.department_name === "CE" || user.department_name === "Computer Engineering"
          );
        }
        
        setStudentLeaders(filteredLeaders);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch student leaders",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch student leaders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const [newLeader, setNewLeader] = useState({
    name: "",
    loginId: "",
    email: "",
    department: "CE", // Pre-fill with CE for PO users
    position: "Student Coordinator" // Pre-fill position
  });

  // Initialize form with user's department and position when adding
  const initializeForm = () => {
    const userStr = localStorage.getItem("nssUser");
    const user = userStr ? JSON.parse(userStr) : {};
    
    setNewLeader({
      name: "",
      loginId: "",
      email: "",
      department: user.department || "CE", // Use logged-in user's department
      position: "Student Coordinator" // Always set to Student Coordinator
    });
  };

  const handleAddLeader = async () => {
    if (!newLeader.name || !newLeader.loginId || !newLeader.email || !newLeader.department) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const token = localStorage.getItem("nssUserToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "No token found. Please login again.",
        variant: "destructive"
      });
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/users/student-coordinator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newLeader.name,
          login_id: newLeader.loginId,
          email: newLeader.email,
          department: newLeader.department
        }),
      });

      if (response.status === 401) {
        toast({
          title: "Token Expired",
          description: "Your session has expired. Please login again.",
          variant: "destructive"
        });
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Student Leader Added",
          description: `New student leader has been added successfully. Default password: ${data.defaultPassword}`,
        });
        setIsAddingLeader(false);
        initializeForm();
        fetchStudentLeaders(); // Refresh the list
      } else {
        throw new Error(data.error || "Failed to add student leader");
      }
    } catch (error) {
      console.error("Add error:", error);
      if (error.message.includes("Failed to fetch")) {
        toast({
          title: "Server Error",
          description: "Cannot connect to server. Please make sure the backend is running.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleEditLeader = (leader) => {
    setEditingLeader(leader);
    setNewLeader({
      name: leader.name,
      loginId: leader.login_id || leader.loginId,
      email: leader.email,
      department: leader.department_name || leader.department,
      position: "Student Coordinator"
    });
    setIsEditingLeader(true);
  };

  const handleUpdateLeader = async () => {
    if (!newLeader.name || !newLeader.loginId || !newLeader.email || !newLeader.department) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const token = localStorage.getItem("nssUserToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "No token found. Please login again.",
        variant: "destructive"
      });
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/student-coordinator/${editingLeader.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newLeader.name,
          login_id: newLeader.loginId,
          email: newLeader.email,
          department: newLeader.department
        }),
      });

      if (response.status === 401) {
        toast({
          title: "Token Expired",
          description: "Your session has expired. Please login again.",
          variant: "destructive"
        });
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
    toast({
      title: "Student Leader Updated",
      description: "Student leader information has been updated successfully.",
    });
    setIsEditingLeader(false);
    setEditingLeader(null);
        initializeForm();
        fetchStudentLeaders(); // Refresh the list
      } else {
        throw new Error(data.error || "Failed to update student leader");
      }
    } catch (error) {
      console.error("Update error:", error);
      if (error.message.includes("Failed to fetch")) {
        toast({
          title: "Server Error",
          description: "Cannot connect to server. Please make sure the backend is running.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteLeader = async (leaderId, leaderName) => {
    const token = localStorage.getItem("nssUserToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "No token found. Please login again.",
        variant: "destructive"
      });
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/student-coordinator/${leaderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        toast({
          title: "Token Expired",
          description: "Your session has expired. Please login again.",
          variant: "destructive"
        });
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
    toast({
      title: "Student Leader Removed",
      description: `${leaderName} has been removed from student leaders.`,
      variant: "destructive",
    });
        fetchStudentLeaders(); // Refresh the list
      } else {
        throw new Error(data.error || "Failed to delete student leader");
      }
    } catch (error) {
      console.error("Delete error:", error);
      if (error.message.includes("Failed to fetch")) {
        toast({
          title: "Server Error",
          description: "Cannot connect to server. Please make sure the backend is running.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const filteredLeaders = studentLeaders.filter(leader => {
    const matchesSearch = leader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (leader.login_id || leader.loginId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      leader.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeaders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaders.length / itemsPerPage);

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

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-nss-primary">Student Leaders</h1>
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
            {(userRole === "pc" || userRole === "po") && (
              <Dialog open={isAddingLeader} onOpenChange={setIsAddingLeader}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-nss-primary hover:bg-nss-dark"
                    onClick={initializeForm}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Leader
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Student Leader</DialogTitle>
                    <DialogDescription>
                      {userRole === "pc" || userRole === "program coordinator"
                        ? "Add a new student coordinator to the NSS team."
                        : `Add a new student coordinator to the ${userDepartment} department NSS team.`
                      }
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
                      <Label htmlFor="loginId">Login ID</Label>
                      <Input
                        id="loginId"
                        value={newLeader.loginId}
                        onChange={(e) => setNewLeader({ ...newLeader, loginId: e.target.value })}
                        placeholder="Enter login ID"
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
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={userRole === "pc" || userRole === "program coordinator" ? "" : newLeader.department}
                        readOnly
                        disabled
                        className="bg-gray-100"
                        placeholder={userRole === "pc" || userRole === "program coordinator" ? "Select department below" : ""}
                      />
                    </div>
                    {(userRole === "pc" || userRole === "program coordinator") && (
                    <div className="space-y-2">
                        <Label htmlFor="department-select">Select Department</Label>
                      <select
                          id="department-select"
                        value={newLeader.department}
                        onChange={(e) => setNewLeader({ ...newLeader, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Department</option>
                          <option value="CE">Computer Engineering</option>
                          <option value="ME">Mechanical Engineering</option>
                          <option value="EE">Electrical Engineering</option>
                          <option value="IT">Information Technology</option>
                          <option value="CSE">Computer Science Engineering</option>
                      </select>
                    </div>
                    )}
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={newLeader.position}
                        readOnly
                        disabled
                        className="bg-gray-100"
                      />
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
                <Label htmlFor="edit-loginId">Login ID</Label>
                <Input
                  id="edit-loginId"
                  value={newLeader.loginId}
                  onChange={(e) => setNewLeader({ ...newLeader, loginId: e.target.value })}
                  placeholder="Enter login ID"
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
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={userRole === "pc" || userRole === "program coordinator" ? "" : newLeader.department}
                  readOnly
                  disabled
                  className="bg-gray-100"
                  placeholder={userRole === "pc" || userRole === "program coordinator" ? "Select department below" : ""}
                />
              </div>
              {(userRole === "pc" || userRole === "program coordinator") && (
              <div className="space-y-2">
                  <Label htmlFor="edit-department-select">Select Department</Label>
                <select
                    id="edit-department-select"
                  value={newLeader.department}
                  onChange={(e) => setNewLeader({ ...newLeader, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Department</option>
                    <option value="CE">Computer Engineering</option>
                    <option value="ME">Mechanical Engineering</option>
                    <option value="EE">Electrical Engineering</option>
                    <option value="IT">Information Technology</option>
                    <option value="CSE">Computer Science Engineering</option>
                </select>
              </div>
              )}
              
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="edit-position">Position</Label>
                <Input
                  id="edit-position"
                  value={newLeader.position}
                  readOnly
                  disabled
                  className="bg-gray-100"
                />
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

        {/* Student Leaders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
                {userRole === "pc" || userRole === "program coordinator" 
                  ? "All Department Student Leaders"
                  : `${userDepartment} Department Student Leaders`
                }
            </CardTitle>
            <CardDescription>
                {userRole === "pc" || userRole === "program coordinator"
                  ? "Manage all department NSS student coordinators"
                  : `Manage ${userDepartment} department NSS student coordinators`
                }
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Loading student leaders...
                      </TableCell>
                    </TableRow>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((leader) => (
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
                                <div className="text-sm text-gray-500">
                                  {leader.login_id || leader.loginId || "N/A"}
                                </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 text-gray-400 mr-1" />
                            <span>{leader.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 text-gray-400 mr-1" />
                            <span>{leader.department_name || leader.department || "CE"}</span>
                        </div>
                      </TableCell>
                        <TableCell>{getPositionBadge("Student Coordinator")}</TableCell>
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
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Student Leader</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{leader.name}</strong>? This action cannot be undone and will remove their access to the system.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex flex-row justify-end gap-2">
                                  <AlertDialogCancel className="!mt-0">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteLeader(leader.id, leader.name)}
                                    className="bg-red-600 hover:bg-red-700 border border-red-600 !mt-0"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No CE department student leaders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end mt-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">{currentPage} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentLeaders;
