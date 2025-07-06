import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  Users,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ProgramOfficerDashboard = () => {
  const [stats, setStats] = useState({
    volunteers: 0,
    pendingApprovals: 0,
    upcomingEvents: 0,
    completedEvents: 0
  });
  
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [recentEvents, setRecentEvents] = useState([]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("nssUserToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "No token found. Please login again.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Fetch volunteers for the PO's department
      const volunteersResponse = await fetch("http://localhost:5000/api/volunteers/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Fetch working hours for approvals
      const workingHoursResponse = await fetch("http://localhost:5000/api/working-hours/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (volunteersResponse.ok && workingHoursResponse.ok) {
        const volunteersData = await volunteersResponse.json();
        const workingHoursData = await workingHoursResponse.json();

        // Get user's department
        const userStr = localStorage.getItem("nssUser");
        const user = userStr ? JSON.parse(userStr) : {};
        const userDepartment = user.department;

        // Filter volunteers by PO's department
        const departmentVolunteers = volunteersData.filter(volunteer => 
          volunteer.department === userDepartment
        );

        // Filter working hours by PO's department and pending status
        const pendingWorkingHours = workingHoursData.filter(wh => 
          wh.status === "pending" && wh.department_name === userDepartment
        );

        // Update stats
        setStats({
          volunteers: departmentVolunteers.length || 0,
          pendingApprovals: pendingWorkingHours.length || 0,
          upcomingEvents: 2, // Mock data as requested
          completedEvents: 15 // Mock data as requested
        });

        // Format pending approvals for display
        const formattedApprovals = pendingWorkingHours.slice(0, 5).map(wh => ({
          id: wh.id,
          type: "Working Hours",
          name: wh.student_name || "Unknown",
          date: wh.date,  
          department: wh.department_name || userDepartment,
          hours: wh.hours,
          activity: wh.activity_name
        }));

        setPendingApprovals(formattedApprovals);
      }

      // Fetch recent events
      const eventsRes = await fetch("http://localhost:5000/api/events/recent", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setRecentEvents(eventsData);
      } else {
        setRecentEvents([]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive"
      });
      setRecentEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproval = async (id, action) => {
    const token = localStorage.getItem("nssUserToken");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "No token found. Please login again.",
        variant: "destructive"
      });
      return;
    }

    try {
      const endpoint = action === "approve" 
        ? `http://localhost:5000/api/working-hours/approve/${id}`
        : `http://localhost:5000/api/working-hours/reject/${id}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: `${action === "approve" ? "Approved" : "Rejected"}`,
          description: `Working hours have been ${action === "approve" ? "approved" : "rejected"} successfully.`,
          variant: action === "approve" ? "default" : "destructive",
        });
        fetchDashboardData(); // Refresh the data
      } else {
        throw new Error(data.error || `Failed to ${action} working hours`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900">Program Officer Dashboard</h1>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="nss-dashboard-card flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Volunteers</p>
            <h3 className="text-2xl font-bold text-blue-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.volunteers}
            </h3>
          </div>
        </div>
        
        <div className="nss-dashboard-card flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-blue-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.pendingApprovals}
            </h3>
          </div>
        </div>
        
        <div className="nss-dashboard-card flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Upcoming Events</p>
            <h3 className="text-2xl font-bold text-blue-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.upcomingEvents}
            </h3>
          </div>
        </div>
        
        <div className="nss-dashboard-card flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <CheckCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed Events</p>
            <h3 className="text-2xl font-bold text-blue-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.completedEvents}
            </h3>
          </div>
        </div>
      </div>
      
      {/* Pending Approvals Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-blue-900">Pending Approvals</h2>
          <Link to="/approvals" className="text-blue-600 hover:underline text-sm">View All</Link>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2">Loading approvals...</span>
            </div>
          ) : pendingApprovals.length > 0 ? (
            <table className="w-full">
              <thead className="bg-muted text-blue-900">
                <tr>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Activity</th>
                  <th className="p-2 text-left">Hours</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{item.type}</td>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.activity}</td>
                    <td className="p-2">{item.hours} hrs</td>
                    <td className="p-2">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="p-2 flex justify-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-green-500 text-green-500 hover:bg-green-50"
                        onClick={() => handleApproval(item.id, "approve")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => handleApproval(item.id, "reject")}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No pending approvals found.
            </div>
          )}
        </div>
      </Card>
      
      {/* Recent Events Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-blue-900">Recent Events</h2>
          <Link to="/events" className="text-blue-600 hover:underline text-sm">View All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2">Loading events...</span>
            </div>
          ) : recentEvents.length > 0 ? (
            recentEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="nss-dashboard-card flex flex-col p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">{event.event_name}</span>
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'N/A'}
                </div>
                <div className="text-xs text-gray-500 truncate mb-2">{event.description}</div>
                <div className="flex-1" />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{event.status}</span>
                  <Link to={`/events/${event.id}`} className="text-blue-600 text-xs hover:underline">
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No recent events found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProgramOfficerDashboard;
