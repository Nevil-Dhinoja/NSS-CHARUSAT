
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
import { Clock, Plus, Calendar, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const WorkingHours = () => {
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const { toast } = useToast();

  // Mock working hours data
  const workingHours = [
    { id: 1, date: "2023-12-01", activity: "Community Clean-up Drive", startTime: "09:00", endTime: "13:00", hours: 4, status: "approved", description: "Organized cleaning activity in local community" },
    { id: 2, date: "2023-12-03", activity: "Blood Donation Camp", startTime: "08:00", endTime: "16:00", hours: 8, status: "approved", description: "Assisted in organizing blood donation camp" },
    { id: 3, date: "2023-12-05", activity: "Tree Plantation", startTime: "07:00", endTime: "11:00", hours: 4, status: "pending", description: "Planted trees in college campus" },
    { id: 4, date: "2023-12-07", activity: "Educational Workshop", startTime: "14:00", endTime: "17:00", hours: 3, status: "approved", description: "Conducted workshop for underprivileged children" },
    { id:5, date: "2023-12-10", activity: "Health Awareness Campaign", startTime: "10:00", endTime: "15:00", hours: 5, status: "pending", description: "Organized health checkup camp" },
  ];

  const [newEntry, setNewEntry] = useState({
    activity: "",
    date: "",
    startTime: "",
    endTime: "",
    description: ""
  });

  React.useEffect(() => {
    const token = localStorage.getItem("nssUserToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    
    const role = localStorage.getItem("nssUserRole");
    const name = localStorage.getItem("nssUserName") || "";
    const email = localStorage.getItem("nssUserEmail") || "";
    
    // Only Student Coordinators should access this page
    if (role !== "sc") {
      window.location.href = "/dashboard";
      return;
    }
    
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
  }, []);

  const calculateHours = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return Math.max(0, (end - start) / (1000 * 60 * 60));
  };

  const handleAddEntry = () => {
    const hours = calculateHours(newEntry.startTime, newEntry.endTime);
    if (hours <= 0) {
      toast({
        title: "Invalid Time",
        description: "Please enter valid start and end times.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Working Hours Added",
      description: `Entry for ${hours} hours has been submitted for approval.`,
    });

    setNewEntry({
      activity: "",
      date: "",
      startTime: "",
      endTime: "",
      description: ""
    });
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
          
          <Dialog>
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
                    onChange={(e) => setNewEntry({...newEntry, activity: e.target.value})}
                    placeholder="Enter activity name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newEntry.startTime}
                      onChange={(e) => setNewEntry({...newEntry, startTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newEntry.endTime}
                      onChange={(e) => setNewEntry({...newEntry, endTime: e.target.value})}
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
                    onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workingHours.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{entry.activity}</TableCell>
                      <TableCell>{entry.startTime} - {entry.endTime}</TableCell>
                      <TableCell>{entry.hours} hrs</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          entry.status === "approved" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {entry.status === "approved" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {entry.status}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                    </TableRow>
                  ))}
                  {workingHours.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No working hours logged yet. Start by adding your first entry!
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

export default WorkingHours;
