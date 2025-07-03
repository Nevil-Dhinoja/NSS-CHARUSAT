
import React from "react";
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

const StudentCoordinatorDashboard = ({ isHeadCoordinator = false }) => {
  // Mock data
  const stats = {
    workingHours: 45,
    targetHours: 120,
    events: 8
  };
  
  const percentageComplete = Math.round((stats.workingHours / stats.targetHours) * 100);
  
  const upcomingEvents = [
    { id: 1, name: "Tree Plantation Drive", date: "2023-05-20", role: "Team Member" },
    { id: 2, name: "Digital Literacy Workshop", date: "2023-05-25", role: "Organizer" }
  ];
  
  const recentWorking = [
    { id: 1, activity: "Website Content Creation", hours: 3, date: "2023-05-10", status: "Approved" },
    { id: 2, activity: "Volunteer Training", hours: 2, date: "2023-05-08", status: "Pending" },
    { id: 3, activity: "Event Planning Meeting", hours: 1.5, date: "2023-05-05", status: "Approved" }
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900">
          {isHeadCoordinator ? "Head Student Coordinator Dashboard" : "Student Coordinator Dashboard"}
        </h1>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Working Hours
        </Button>
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
              {stats.workingHours} / {stats.targetHours} hrs
            </span>
          </div>
          <Progress value={percentageComplete} className="h-2" />
          <p className="text-sm text-muted-foreground">
            You have completed <span className="font-semibold text-blue-600">{percentageComplete}%</span> of your target hours.
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
              {recentWorking.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/50">
                  <td className="p-2">{item.activity}</td>
                  <td className="p-2 text-center">{item.hours}</td>
                  <td className="p-2 text-center">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="p-2 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === "Approved" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Upcoming Events */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-blue-900">Upcoming Events</h2>
          <Link to="/events" className="text-blue-600 hover:underline text-sm">View All</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-medium text-blue-900">{event.name}</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="flex items-center text-muted-foreground">
                  <User className="h-4 w-4 mr-2" />
                  Role: {event.role}
                </p>
              </div>
              <div className="mt-3">
                <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default StudentCoordinatorDashboard;
