import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EventsDebug = () => {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userDepartment, setUserDepartment] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("nssUserToken");
    const userStr = localStorage.getItem("nssUser");
    
    setDebugInfo(`Token: ${token ? 'Present' : 'Missing'}, User: ${userStr ? 'Present' : 'Missing'}`);
    
    if (!token || !userStr) {
      setDebugInfo("No token or user data found");
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      const role = user.role ? user.role.toLowerCase() : "";
      
      setDebugInfo(`User Role: ${role}, Department: ${user.department || 'None'}`);
      
      if (role !== "pc" && role !== "po" && role !== "program coordinator" && role !== "program officer") {
        setDebugInfo(`Access denied for role: ${role}`);
        return;
      }
      
      setUserRole(role);
      setUserName(user.name);
      setUserEmail(user.email);
      setUserDepartment(user.department || "");
      
      setDebugInfo(`User loaded: ${user.name} (${role}) from ${user.department}`);
    } catch (err) {
      setDebugInfo(`Error parsing user data: ${err.message}`);
    }
  }, []);

  const testApiConnection = async () => {
    const token = localStorage.getItem("nssUserToken");
    try {
      const response = await fetch("http://localhost:5000/api/events/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDebugInfo(`API Success: ${data.length} events found`);
      } else {
        const errorData = await response.json();
        setDebugInfo(`API Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      setDebugInfo(`API Connection Error: ${error.message}`);
    }
  };

  if (!userRole || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Events Debug Page</h1>
          <p className="text-lg mb-4">{debugInfo}</p>
          <Button onClick={testApiConnection}>Test API Connection</Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Events Debug Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4"><strong>Debug Info:</strong> {debugInfo}</p>
            <p className="mb-4"><strong>User Role:</strong> {userRole}</p>
            <p className="mb-4"><strong>Department:</strong> {userDepartment}</p>
            <Button onClick={testApiConnection}>Test API Connection</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EventsDebug; 