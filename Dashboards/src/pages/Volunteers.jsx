import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { Search, Upload, Download, Filter, Users, UserPlus, Mail, Phone, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const testPDF = () => {
  const doc = new jsPDF();
  doc.text("Test PDF", 10, 10);
  doc.autoTable({
    head: [["Name", "Age"]],
    body: [["Alice", 25], ["Bob", 30]],
  });
  doc.save("test.pdf");
};

const Volunteers = () => {
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const { toast } = useToast();
  const [userDepartment, setUserDepartment] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [loadingVolunteers, setLoadingVolunteers] = useState(true);

  const [newVolunteer, setNewVolunteer] = useState({
    name: "",
    studentId: "",
    department: "",
    year: "",
    email: "",
    phone: ""
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editVolunteer, setEditVolunteer] = useState(null);

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
      setUserRole(role);
      setUserName(user.name);
      setUserEmail(user.email);
      setUserDepartment(user.department);
      setNewVolunteer((prev) => ({ ...prev, department: user.department }));
    } catch (err) {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  const fetchVolunteers = async () => {
    setLoadingVolunteers(true);
    const token = localStorage.getItem("nssUserToken");
    try {
      // If user is Program Officer, fetch volunteers from CE department
      // Otherwise, fetch all volunteers (for Program Coordinator)
      const endpoint = userRole === "po" 
        ? "http://localhost:5000/api/volunteers/department/CE"
        : "http://localhost:5000/api/volunteers/all";

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setVolunteers(data);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch volunteers",
          variant: "destructive"
        });
        setVolunteers([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch volunteers",
        variant: "destructive"
      });
      setVolunteers([]);
    } finally {
      setLoadingVolunteers(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleUploadVolunteers = () => {
    toast({
      title: "Volunteers List Uploaded",
      description: "The volunteers list has been uploaded successfully and sent for approval.",
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("nssUserToken");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/volunteers/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");

      toast({
        title: "Upload Successful",
        description: data.message,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddVolunteer = async () => {
    if (!newVolunteer.name || !newVolunteer.studentId || !newVolunteer.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("nssUserToken");

      const response = await fetch("http://localhost:5000/api/volunteers/addVolunteer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newVolunteer),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to add volunteer");
      }

      toast({
        title: "Volunteer Added",
        description: `${newVolunteer.name} has been successfully added.`,
      });

      setNewVolunteer({
        name: "",
        studentId: "",
        department: "",
        year: "",
        email: "",
        phone: "",
      });

      // Optional: Refresh volunteer list from backend (once connected)
    } catch (error) {
      toast({
        title: "Add Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Filter volunteers based on criteria
  const filteredVolunteers = volunteers.filter(
    volunteer =>
      (!selectedYear || volunteer.year?.toString().includes(selectedYear)) &&
      (
        volunteer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        volunteer.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        volunteer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        volunteer.department?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleExportExcel = () => {
    const data = filteredVolunteers.map(v => ({
      Name: v.name,
      "Student ID": v.student_id,
      Department: v.department,
      Year: v.year,
      Email: v.email,
      Phone: v.phone,
      "Joined On": v.joined_on ? new Date(v.joined_on).toLocaleDateString() : ""
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Volunteers");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "volunteers.xlsx");
  };

  const handleEditVolunteer = (volunteer) => {
    setEditVolunteer(volunteer);
    setEditDialogOpen(true);
  };

  const handleUpdateVolunteer = async () => {
    const token = localStorage.getItem("nssUserToken");
    const response = await fetch(`http://localhost:5000/api/volunteers/edit/${editVolunteer.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editVolunteer),
    });
    const data = await response.json();
    if (response.ok) {
      toast({ title: "Volunteer updated", description: data.message });
      setEditDialogOpen(false);
      fetchVolunteers();
    } else {
      toast({ title: "Update failed", description: data.error, variant: "destructive" });
    }
  };

  const handleDeleteVolunteer = async (volunteerId, volunteerName) => {
    const token = localStorage.getItem("nssUserToken");
    try {
      const response = await fetch(`http://localhost:5000/api/volunteers/delete/${volunteerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Volunteer Deleted",
          description: `${volunteerName} has been successfully deleted.`,
        });
        fetchVolunteers(); // Refresh the list
      } else {
        throw new Error(data.error || "Failed to delete volunteer");
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
                    <Label htmlFor="file">Excel/CSV File</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                      <Input id="file" type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} className="hidden" />
                      <Label
                        htmlFor="file"
                        className="cursor-pointer flex flex-col items-center justify-center"
                      >
                        <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                        <span className="text-sm font-medium">Click to upload volunteers list (Excel or CSV format)</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          Upload file with columns: name, studentId, department, year, email, contact
                        </span>
                      </Label>
                    </div>
                  </div>
                  <div className="flex justify-end">
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
                    <Input
                      id="academic-year"
                      placeholder="Enter academic year"
                      value={newVolunteer.year}
                      onChange={(e) => setNewVolunteer({ ...newVolunteer, year: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="volunteer-name">Full Name</Label>
                      <Input
                        id="volunteer-name"
                        placeholder="Enter full name"
                        value={newVolunteer.name}
                        onChange={(e) => setNewVolunteer({ ...newVolunteer, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student-id">Student ID</Label>
                      <Input
                        id="student-id"
                        placeholder="Enter student ID"
                        value={newVolunteer.studentId}
                        onChange={(e) => setNewVolunteer({ ...newVolunteer, studentId: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={userDepartment}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email"
                        value={newVolunteer.email}
                        onChange={(e) => setNewVolunteer({ ...newVolunteer, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="Enter phone number"
                        value={newVolunteer.phone}
                        onChange={(e) => setNewVolunteer({ ...newVolunteer, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddVolunteer} className="bg-nss-primary hover:bg-nss-dark">
                      Add Volunteer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-nss-primary" />
                <CardTitle>Volunteers List</CardTitle>
              </div>
            </div>
            <CardDescription>
              Manage and track all NSS volunteers across departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 gap-4">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                <div>
                  <Input
                    id="year-filter"
                    type="text"
                    placeholder="Enter year"
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    className="w-[140px]"
                  />
                </div>
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
                    <DropdownMenuItem onClick={handleExportExcel}>Export to Excel</DropdownMenuItem>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingVolunteers ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Loading volunteers...
                      </TableCell>
                    </TableRow>
                  ) : filteredVolunteers.length > 0 ? (
                    filteredVolunteers.map((volunteer) => (
                      <TableRow key={volunteer.id}>
                        <TableCell className="font-medium">{volunteer.name}</TableCell>
                        <TableCell>{volunteer.student_id}</TableCell>
                        <TableCell>{volunteer.department}</TableCell>
                        <TableCell>{volunteer.year}</TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="w-3 h-3 mr-1" />
                              {volunteer.email}
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="w-3 h-3 mr-1" />
                              {volunteer.contact}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{volunteer.joined_on ? new Date(volunteer.joined_on).toLocaleDateString() : ''}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditVolunteer(volunteer)}>
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Volunteer</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{volunteer.name}</strong>? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="!flex !flex-row !justify-end !gap-2 !space-x-2">
                                  <AlertDialogCancel className="!mt-0">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteVolunteer(volunteer.id, volunteer.name)}
                                    className="bg-red-600 hover:bg-red-700 border border-red-600 !mt-0"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No volunteers found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Volunteer</DialogTitle>
            </DialogHeader>
            {editVolunteer && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={editVolunteer.name}
                    onChange={e => setEditVolunteer({ ...editVolunteer, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-student-id">Student ID</Label>
                  <Input
                    id="edit-student-id"
                    value={editVolunteer.student_id}
                    readOnly
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Input
                    id="edit-department"
                    value={editVolunteer.department}
                    readOnly
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-year">Year</Label>
                  <Input
                    id="edit-year"
                    value={editVolunteer.year}
                    readOnly
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    value={editVolunteer.email}
                    onChange={e => setEditVolunteer({ ...editVolunteer, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editVolunteer.contact}
                    onChange={e => setEditVolunteer({ ...editVolunteer, contact: e.target.value })}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleUpdateVolunteer} className="bg-nss-primary hover:bg-nss-dark">
                    Update Volunteer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Volunteers;
