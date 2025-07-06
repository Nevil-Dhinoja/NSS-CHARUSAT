import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  FileText, 
  PlusCircle, 
  User, 
  Users 
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const StudentCoordinatorDashboard = ({ isHeadCoordinator = false }) => {
  const [workingHours, setWorkingHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [recentEvents, setRecentEvents] = useState([]);

  // Constants for NSS requirements
  const REQUIRED_HOURS = 120;

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
      const response = await fetch("http://localhost:5000/api/working-hours/my-hours", {
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

  const fetchRecentEvents = async () => {
    const token = localStorage.getItem("nssUserToken");
    try {
      const eventsRes = await fetch("http://localhost:5000/api/events/recent", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setRecentEvents(eventsData);
      } else {
        setRecentEvents([]);
      }
    } catch (e) {
      setRecentEvents([]);
    }
  };

  useEffect(() => {
    fetchWorkingHours();
    fetchRecentEvents();
  }, []);

  // Calculate dynamic stats from real data
  const calculateStats = () => {
    const approvedHours = workingHours
      .filter(entry => entry.status === "approved")
      .reduce((total, entry) => total + (parseFloat(entry.hours) || 0), 0);
    
    const percentageComplete = Math.round((approvedHours / REQUIRED_HOURS) * 100);
    
    return {
      workingHours: approvedHours,
      targetHours: REQUIRED_HOURS,
      events: workingHours.length, // Total entries as events participated
      percentageComplete
    };
  };

  // Get recent working hours (last 5 entries)
  const getRecentWorkingHours = () => {
    return workingHours
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(entry => ({
        id: entry.id,
        activity: entry.activity_name,
        hours: parseFloat(entry.hours) || 0,
        date: entry.date,
        status: entry.status === "approved" ? "Approved" : 
                entry.status === "pending" ? "Pending" : "Rejected"
      }));
  };

  const stats = calculateStats();
  const recentWorking = getRecentWorkingHours();
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900">
          {isHeadCoordinator ? "Head Student Coordinator Dashboard" : "Student Coordinator Dashboard"}
        </h1>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Working Hours Progress
            </h3>
            <span className="text-sm text-muted-foreground">
              {stats.workingHours.toFixed(1)} / {stats.targetHours} hrs
            </span>
          </div>
          <Progress value={stats.percentageComplete} className="h-2" />
          <p className="text-sm text-muted-foreground">
            You have completed <span className="font-semibold text-blue-600">{stats.percentageComplete}%</span> of your target hours.
          </p>
        </Card>
        
        <div className="nss-dashboard-card flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Events Participated</p>
            <h3 className="text-2xl font-bold text-blue-600">{stats.events}</h3>
          </div>
        </div>
      </div>
      
      {/* Working Hours History */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-blue-900">Recent Working Hours</h2>
          <Link to="/working-hours" className="text-blue-600 hover:underline text-sm">View All</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted text-blue-900">
              <tr>
                <th className="p-2 text-left">Activity</th>
                <th className="p-2 text-center">Hours</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">
                    Loading working hours...
                  </td>
                </tr>
              ) : recentWorking.length > 0 ? (
                recentWorking.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">{item.activity}</td>
                    <td className="p-2 text-center">{item.hours.toFixed(1)}</td>
                    <td className="p-2 text-center">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="p-2 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === "Approved" ? "bg-green-100 text-green-800" : 
                        item.status === "Pending" ? "bg-amber-100 text-amber-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">
                    No working hours logged yet. Start by adding your first entry!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Recent Events */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-blue-900">Recent Events</h2>
          <Link to="/events" className="text-blue-600 hover:underline text-sm">View All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentEvents.length > 0 ? (
            recentEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-blue-900">{event.event_name}</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="flex items-center text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    {event.status}
                  </p>
                </div>
                <div className="mt-3">
                  <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    View Details
                  </Button>
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

export default StudentCoordinatorDashboard;
