
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  Users 
} from "lucide-react";
import { Link } from "react-router-dom";

const ProgramOfficerDashboard = () => {
  // Mock data
  const stats = {
    studentCoordinators: 12,
    volunteers: 180,
    pendingApprovals: 3,
    upcomingEvents: 2,
    completedEvents: 15
  };
  
  const pendingApprovals = [
    { id: 1, type: "Working Hours", name: "Ravi Kumar", date: "2023-05-14", department: "Computer Science" },
    { id: 2, type: "Event Report", name: "Tree Plantation Report", date: "2023-05-10", department: "Computer Science" },
    { id: 3, type: "Working Hours", name: "Priya Sharma", date: "2023-05-09", department: "Computer Science" }
  ];
  
  const recentEvents = [
    { id: 1, name: "Blood Donation Camp", date: "2023-05-05", volunteers: 25 },
    { id: 2, name: "Career Guidance Workshop", date: "2023-05-02", volunteers: 32 }
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900">Program Officer Dashboard</h1>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Generate Report</Button>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="nss-dashboard-card flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Student Coordinators</p>
            <h3 className="text-2xl font-bold text-blue-600">{stats.studentCoordinators}</h3>
          </div>
        </div>
        
        <div className="nss-dashboard-card flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Volunteers</p>
            <h3 className="text-2xl font-bold text-blue-600">{stats.volunteers}</h3>
          </div>
        </div>
        
        <div className="nss-dashboard-card flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-blue-600">{stats.pendingApprovals}</h3>
          </div>
        </div>
        
        <div className="nss-dashboard-card flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Upcoming Events</p>
            <h3 className="text-2xl font-bold text-blue-600">{stats.upcomingEvents}</h3>
          </div>
        </div>
        
        <div className="nss-dashboard-card flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <CheckCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed Events</p>
            <h3 className="text-2xl font-bold text-blue-600">{stats.completedEvents}</h3>
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
          <table className="w-full">
            <thead className="bg-muted text-blue-900">
              <tr>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Department</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/50">
                  <td className="p-2">{item.type}</td>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.department}</td>
                  <td className="p-2">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="p-2 flex justify-center space-x-2">
                    <Button variant="outline" size="sm" className="border-green-500 text-green-500 hover:bg-green-50">
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-50">
                      Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Recent Events Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-blue-900">Recent Events</h2>
          <Link to="/events" className="text-blue-600 hover:underline text-sm">View All</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentEvents.map((event) => (
            <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-medium text-blue-900">{event.name}</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="flex items-center text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  {event.volunteers} volunteers
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Link to={`/events/${event.id}`} className="text-blue-600 text-sm hover:underline">
                  View Details
                </Link>
                <Link to={`/events/${event.id}/report`} className="flex items-center text-blue-600 text-sm hover:underline">
                  <FileText className="h-4 w-4 mr-1" />
                  Report
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ProgramOfficerDashboard;
