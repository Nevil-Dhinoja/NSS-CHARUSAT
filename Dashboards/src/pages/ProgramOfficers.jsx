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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const ProgramOfficers = () => {
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingOfficer, setIsAddingOfficer] = useState(false);
  const [isEditingOfficer, setIsEditingOfficer] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [programOfficers, setProgramOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter states for PC role
  const [selectedInstitute, setSelectedInstitute] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [institutes, setInstitutes] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [newOfficer, setNewOfficer] = useState({
    name: "",
    loginId: "",
    email: "",
    institute: "",
    department: "",
    institute_name: "",
    department_name: "",
    password: "",
    position: "Program Officer"
  });

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
      if (role !== "pc") {
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

  // Fetch program officers when user data is loaded
  React.useEffect(() => {
    if (userRole) {
      fetchProgramOfficers();
      fetchInstitutes();
    }
  }, [userRole]);

  const fetchProgramOfficers = async () => {
    const token = localStorage.getItem("nssUserToken");
    try {
      // Fetch all program officers
      const roleName = encodeURIComponent("Program Officer");
      const response = await fetch(`http://localhost:5000/api/auth/users/${roleName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProgramOfficers(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch program officers",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch program officers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch institutes for PC role
  const fetchInstitutes = async () => {
    const token = localStorage.getItem("nssUserToken");
    try {
      const response = await fetch("http://localhost:5000/api/auth/institutes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInstitutes(data);
      } else {
        console.error("Error fetching institutes:", response.status, response.statusText);
        setInstitutes([]);
      }
    } catch (error) {
      console.error("Error fetching institutes:", error);
      setInstitutes([]);
    }
  };

  // Fetch departments for selected institute
  const fetchDepartments = async (instituteId) => {
    if (!instituteId || instituteId === "all") {
      setDepartments([]);
      return;
    }

    const token = localStorage.getItem("nssUserToken");
    try {
      const response = await fetch(`http://localhost:5000/api/auth/departments/${instituteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      } else {
        console.error("Error fetching departments:", response.status, response.statusText);
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    }
  };

  // Handle institute selection change
  const handleInstituteChange = (instituteId) => {
    setSelectedInstitute(instituteId);
    if (instituteId === "all") {
      setSelectedDepartment("all");
      setDepartments([]);
    } else {
      setSelectedDepartment("all"); // Reset department when institute changes
      fetchDepartments(instituteId);
    }
  };

  // Initialize form
  const initializeForm = () => {
    setNewOfficer({
      name: "",
      loginId: "",
      email: "",
      institute: "",
      department: "",
      institute_name: "",
      department_name: "",
      password: "",
      position: "Program Officer"
    });
  };

  const handleAddOfficer = async () => {
    if (!newOfficer.name || !newOfficer.loginId || !newOfficer.email || !newOfficer.institute || !newOfficer.department || !newOfficer.password) {
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
      const response = await fetch("http://localhost:5000/api/auth/users/program-officer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newOfficer.name,
          login_id: newOfficer.loginId,
          email: newOfficer.email,
          institute_id: newOfficer.institute,
          department_id: newOfficer.department,
          password: newOfficer.password
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
          title: "Program Officer Added",
          description: "New program officer has been added successfully.",
        });
        setIsAddingOfficer(false);
        initializeForm();
        fetchProgramOfficers(); // Refresh the list
      } else {
        throw new Error(data.error || "Failed to add program officer");
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

  const handleEditOfficer = (officer) => {
    setEditingOfficer(officer);
    setNewOfficer({
      name: officer.name,
      loginId: officer.login_id || officer.loginId,
      email: officer.email,
      institute: officer.institute_id || "",
      department: officer.department_id || "",
      institute_name: officer.institute_name || "",
      department_name: officer.department_name || "",
      password: "",
      position: "Program Officer"
    });
    setIsEditingOfficer(true);
  };

  const handleUpdateOfficer = async () => {
    if (!newOfficer.name || !newOfficer.loginId || !newOfficer.email || !newOfficer.institute || !newOfficer.department) {
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
      const response = await fetch(`http://localhost:5000/api/auth/users/program-officer/${editingOfficer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newOfficer.name,
          login_id: newOfficer.loginId,
          email: newOfficer.email,
          institute_id: newOfficer.institute,
          department_id: newOfficer.department,
          password: newOfficer.password || undefined
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
          title: "Program Officer Updated",
          description: "Program officer information has been updated successfully.",
        });
        setIsEditingOfficer(false);
        setEditingOfficer(null);
        initializeForm();
        fetchProgramOfficers(); // Refresh the list
      } else {
        throw new Error(data.error || "Failed to update program officer");
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

  const handleDeleteOfficer = async (officerId, officerName) => {
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
      const response = await fetch(`http://localhost:5000/api/auth/users/program-officer/${officerId}`, {
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
          title: "Program Officer Removed",
          description: `${officerName} has been removed from program officers.`,
          variant: "destructive",
        });
        fetchProgramOfficers(); // Refresh the list
      } else {
        throw new Error(data.error || "Failed to delete program officer");
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

  const filteredOfficers = programOfficers.filter(officer => {
    const matchesSearch = officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (officer.login_id || officer.loginId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Advanced filter logic for PC role
    let matchesInstitute = true;
    let matchesDepartment = true;
    
    if (userRole === "pc" || userRole === "program coordinator") {
      if (selectedInstitute !== "all" && selectedDepartment !== "all") {
        // Both selected: AND
        matchesInstitute = officer.institute_id && officer.institute_id.toString() === selectedInstitute;
        matchesDepartment = officer.department_id && officer.department_id.toString() === selectedDepartment;
      } else if (selectedInstitute !== "all") {
        // Only institute selected
        matchesInstitute = officer.institute_id && officer.institute_id.toString() === selectedInstitute;
      } else if (selectedDepartment !== "all") {
        // Only department selected
        matchesDepartment = officer.department_id && officer.department_id.toString() === selectedDepartment;
      }
    }
    
    return matchesSearch && matchesInstitute && matchesDepartment;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOfficers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOfficers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (!userRole || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg mt-4">Loading program officers...</p>
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
          <h1 className="text-2xl font-bold text-nss-primary">Program Officers</h1>
          </div>
          <div className="flex gap-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search program officers..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isAddingOfficer} onOpenChange={setIsAddingOfficer}>
            <DialogTrigger asChild>
                <Button 
                  className="bg-nss-primary hover:bg-nss-dark"
                  onClick={initializeForm}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Officer
              </Button>
            </DialogTrigger>
              <DialogContent className="max-w-2xl">
              <DialogHeader>
                  <DialogTitle>Add New Program Officer</DialogTitle>
                  <DialogDescription>
                    Add a new program officer to the NSS team.
                  </DialogDescription>
              </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newOfficer.name}
                      onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginId">Login ID</Label>
                    <Input
                      id="loginId"
                      value={newOfficer.loginId}
                      onChange={(e) => setNewOfficer({ ...newOfficer, loginId: e.target.value })}
                      placeholder="Enter login ID"
                    />
                  </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newOfficer.email}
                      onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="institute">Institute</Label>
                    <Select value={newOfficer.institute} onValueChange={(value) => {
                      setNewOfficer({ ...newOfficer, institute: value, department: "" });
                      if (value !== "all") {
                        fetchDepartments(value);
                      }
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Institute" />
                      </SelectTrigger>
                      <SelectContent>
                        {institutes && institutes.length > 0 && institutes.map(inst => (
                          <SelectItem key={inst.id} value={inst.id.toString()}>{inst.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                    <Select value={newOfficer.department} onValueChange={(value) => setNewOfficer({ ...newOfficer, department: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                        {departments && departments.length > 0 && departments.map(dep => (
                          <SelectItem key={dep.id} value={dep.id.toString()}>{dep.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newOfficer.password}
                      onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })}
                      placeholder="Enter password"
                    />
                </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={newOfficer.position}
                      readOnly
                      disabled
                      className="bg-gray-100"
                    />
                </div>
                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingOfficer(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddOfficer} className="bg-nss-primary hover:bg-nss-dark">
                      Add Officer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
        
        {/* Filters for PC role */}
        {(userRole === "pc" || userRole === "program coordinator") && (
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="w-full md:w-1/2">
              <Label>Institute</Label>
              <Select value={selectedInstitute} onValueChange={handleInstituteChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Institute" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Institutes</SelectItem>
                  {institutes && institutes.length > 0 && institutes.map(inst => (
                    <SelectItem key={inst.id} value={inst.id.toString()}>{inst.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/2">
              <Label>Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments && departments.length > 0 && departments.map(dep => (
                    <SelectItem key={dep.id} value={dep.id.toString()}>{dep.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditingOfficer} onOpenChange={setIsEditingOfficer}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Program Officer</DialogTitle>
              <DialogDescription>
                Update program officer information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={newOfficer.name}
                  readOnly
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-loginId">Login ID</Label>
                <Input
                  id="edit-loginId"
                  value={newOfficer.loginId}
                  onChange={(e) => setNewOfficer({ ...newOfficer, loginId: e.target.value })}
                  placeholder="Enter login ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={newOfficer.email}
                  readOnly
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-institute">Institute</Label>
                <Input
                  id="edit-institute"
                  value={newOfficer.institute_name || ""}
                  readOnly
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={newOfficer.department_name || ""}
                  readOnly
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={newOfficer.password}
                  onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })}
                  placeholder="Enter new password (optional)"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="edit-position">Position</Label>
                <Input
                  id="edit-position"
                  value={newOfficer.position}
                  readOnly
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditingOfficer(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateOfficer} className="bg-nss-primary hover:bg-nss-dark">
                  Update Officer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Program Officers List</CardTitle>
            <CardDescription>
              Manage program officers across all departments and institutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading program officers...</span>
              </div>
            ) : (
              <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                        <TableHead>Login ID</TableHead>
                        <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                        <TableHead>Institute</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                      {currentItems.map((officer) => (
                  <TableRow key={officer.id}>
                    <TableCell className="font-medium">{officer.name}</TableCell>
                          <TableCell>{officer.login_id || officer.loginId}</TableCell>
                          <TableCell>{officer.email}</TableCell>
                          <TableCell>{officer.department_name}</TableCell>
                          <TableCell>{officer.institute_name}</TableCell>
                    <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditOfficer(officer)}
                              >
                          <Edit className="h-4 w-4" />
                        </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Program Officer</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove {officer.name} from program officers? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteOfficer(officer.id, officer.name)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                      {currentItems.length === 0 && (
                  <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No program officers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-end space-x-2 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-sm">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProgramOfficers;
