import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Clock, Plus, Calendar, CheckCircle, XCircle, Edit, Trash2 } from "lucide-react";
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

const WorkingHours = () => {
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [userDepartment, setUserDepartment] = React.useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [workingHours, setWorkingHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const { toast } = useToast();

  const [newEntry, setNewEntry] = useState({
    activity: "",
    date: "",
    startTime: "",
    endTime: "",
    description: ""
  });

  const fetchWorkingHours = async () => {
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
      // If user is Program Officer, fetch all working hours for their department
      // Otherwise, fetch only their own working hours
      const endpoint = userRole === "po" 
        ? `http://localhost:5000/api/working-hours/department/${userDepartment}`
        : "http://localhost:5000/api/working-hours/my-hours";

      const response = await fetch(endpoint, {
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
        setWorkingHours(data);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch working hours",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      if (error.message.includes("Failed to fetch")) {
        toast({
          title: "Server Error",
          description: "Cannot connect to server. Please make sure the backend is running.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch working hours: " + error.message,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

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
      if (role !== "sc") {
        window.location.href = "/dashboard";
        return;
      }
      setUserRole(role);
      setUserName(user.name);
      setUserEmail(user.email);
      setUserDepartment(user.department || "");
      fetchWorkingHours();
    } catch (err) {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  const calculateHours = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return Math.max(0, (end - start) / (1000 * 60 * 60));
  };

  // Filter working hours based on selected month and year
  const filteredWorkingHours = workingHours.filter(entry => {
    const entryDate = new Date(entry.date);
    const entryMonth = entryDate.getMonth().toString();
    const entryYear = entryDate.getFullYear().toString();
    
    const monthMatch = selectedMonth === "all" || entryMonth === selectedMonth;
    const yearMatch = selectedYear === "all" || entryYear === selectedYear;
    
    return monthMatch && yearMatch;
  });

  const handleEditEntry = (entry) => {
    setEditEntry({
      id: entry.id,
      activity: entry.activity_name,
      date: entry.date,
      startTime: entry.start_time,
      endTime: entry.end_time,
      description: entry.description
    });
    setEditDialogOpen(true);
  };

  const handleUpdateEntry = async () => {
    const hours = calculateHours(editEntry.startTime, editEntry.endTime);
    if (hours <= 0) {
      toast({
        title: "Invalid Time",
        description: "Please enter valid start and end times.",
        variant: "destructive"
      });
      return;
    }

    if (!editEntry.activity || !editEntry.date || !editEntry.startTime || !editEntry.endTime) {
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
      const response = await fetch(`http://localhost:5000/api/working-hours/update/${editEntry.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activity_name: editEntry.activity,
          date: editEntry.date,
          start_time: editEntry.startTime,
          end_time: editEntry.endTime,
          description: editEntry.description
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
          title: "Working Hours Updated",
          description: `Entry has been updated successfully.`,
        });
        
        setEditDialogOpen(false);
        setEditEntry(null);
        fetchWorkingHours(); // Refresh the list
      } else {
        throw new Error(data.error || "Failed to update working hours");
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

  const handleDeleteEntry = async (entryId, activityName) => {
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
      const response = await fetch(`http://localhost:5000/api/working-hours/delete/${entryId}`, {
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
          title: "Working Hours Deleted",
          description: `${activityName} has been deleted successfully.`,
        });
        fetchWorkingHours(); // Refresh the list
      } else {
        throw new Error(data.error || "Failed to delete working hours");
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

  const handleAddEntry = async () => {
    const hours = calculateHours(newEntry.startTime, newEntry.endTime);
    if (hours <= 0) {
      toast({
        title: "Invalid Time",
        description: "Please enter valid start and end times.",
        variant: "destructive"
      });
      return;
    }

    if (!newEntry.activity || !newEntry.date || !newEntry.startTime || !newEntry.endTime) {
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
      const response = await fetch("http://localhost:5000/api/working-hours/addWorkingHours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activity_name: newEntry.activity,
          date: newEntry.date,
          start_time: newEntry.startTime,
          end_time: newEntry.endTime,
          description: newEntry.description
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
          title: "Working Hours Added",
          description: `Entry for ${hours.toFixed(2)} hours has been submitted for approval.`,
        });
        
        setNewEntry({
          activity: "",
          date: "",
          startTime: "",
          endTime: "",
          description: ""
        });
        
        setDialogOpen(false);
        fetchWorkingHours(); // Refresh the list
      } else {
        throw new Error(data.error || "Failed to add working hours");
      }
    } catch (error) {
      console.error("Submit error:", error);
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
          <h1 className="text-2xl font-bold text-nss-primary">Working Hours</h1>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-nss-primary hover:bg-nss-dark">
                <Plus className="mr-2 h-4 w-4" /> Log Hours
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Log Working Hours</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="activity">Activity Name</Label>
                  <Input
                    id="activity"
                    value={newEntry.activity}
                    onChange={(e) => setNewEntry({ ...newEntry, activity: e.target.value })}
                    placeholder="Enter activity name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newEntry.startTime}
                      onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newEntry.endTime}
                      onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                    />
                  </div>
                </div>
                {newEntry.startTime && newEntry.endTime && (
                  <div className="text-sm text-muted-foreground">
                    Total Hours: {calculateHours(newEntry.startTime, newEntry.endTime)} hours
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    placeholder="Describe the activity..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddEntry} className="bg-nss-primary hover:bg-nss-dark">
                    Submit Entry
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Working Hours Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-nss-primary" />
              Working Hours Log
            </CardTitle>
            <CardDescription>
              Track your NSS volunteer activities and working hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="0">January</SelectItem>
                  <SelectItem value="1">February</SelectItem>
                  <SelectItem value="2">March</SelectItem>
                  <SelectItem value="3">April</SelectItem>
                  <SelectItem value="4">May</SelectItem>
                  <SelectItem value="5">June</SelectItem>
                  <SelectItem value="6">July</SelectItem>
                  <SelectItem value="7">August</SelectItem>
                  <SelectItem value="8">September</SelectItem>
                  <SelectItem value="9">October</SelectItem>
                  <SelectItem value="10">November</SelectItem>
                  <SelectItem value="11">December</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        Loading working hours...
                      </TableCell>
                    </TableRow>
                  ) : filteredWorkingHours.length > 0 ? (
                    filteredWorkingHours.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{entry.activity_name}</TableCell>
                        <TableCell>{entry.start_time} - {entry.end_time}</TableCell>
                        <TableCell>{entry.hours} hrs</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            entry.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : entry.status === "pending"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }`} style={{ color: entry.status === "approved" ? "#166534" : entry.status === "pending" ? "#ea580c" : "#dc2626" }}>
                            {entry.status === "approved" ? (
                              <CheckCircle className="w-3 h-3 mr-1" style={{ color: "#166534" }} />
                            ) : entry.status === "pending" ? (
                              <Clock className="w-3 h-3 mr-1" style={{ color: "#ea580c" }} />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" style={{ color: "#dc2626" }} />
                            )}
                            {entry.status}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditEntry(entry)}
                              disabled={entry.status === "approved"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-700"
                                  disabled={entry.status === "approved"}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Working Hours Entry</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{entry.activity_name}</strong>? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex flex-row justify-end gap-2">
                                  <AlertDialogCancel className="!mt-0">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteEntry(entry.id, entry.activity_name)}
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
                        {workingHours.length === 0 
                          ? "No working hours logged yet. Start by adding your first entry!"
                          : "No working hours found for the selected filters."
                        }
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Working Hours Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Working Hours</DialogTitle>
            </DialogHeader>
            {editEntry && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-activity">Activity Name</Label>
                  <Input
                    id="edit-activity"
                    value={editEntry.activity}
                    onChange={(e) => setEditEntry({ ...editEntry, activity: e.target.value })}
                    placeholder="Enter activity name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editEntry.date}
                    readOnly
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-startTime">Start Time</Label>
                    <Input
                      id="edit-startTime"
                      type="time"
                      value={editEntry.startTime}
                      onChange={(e) => setEditEntry({ ...editEntry, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-endTime">End Time</Label>
                    <Input
                      id="edit-endTime"
                      type="time"
                      value={editEntry.endTime}
                      onChange={(e) => setEditEntry({ ...editEntry, endTime: e.target.value })}
                    />
                  </div>
                </div>
                {editEntry.startTime && editEntry.endTime && (
                  <div className="text-sm text-muted-foreground">
                    Total Hours: {calculateHours(editEntry.startTime, editEntry.endTime)} hours
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editEntry.description}
                    onChange={(e) => setEditEntry({ ...editEntry, description: e.target.value })}
                    placeholder="Describe the activity..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateEntry} className="bg-nss-primary hover:bg-nss-dark">
                    Update Entry
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

export default WorkingHours;
