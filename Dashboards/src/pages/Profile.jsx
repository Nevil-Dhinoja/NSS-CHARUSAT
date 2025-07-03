
import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Camera, Edit, Save, X, User, Mail, Calendar, IdCard, Shield, Building } from "lucide-react";

const Profile = () => {
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    department: "",
    employeeId: "",
    phone: "",
    designation: ""
  });
  const { toast } = useToast();

  React.useEffect(() => {
    const token = localStorage.getItem("nssUserToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    
    const role = localStorage.getItem("nssUserRole");
    const name = localStorage.getItem("nssUserName") || "";
    const email = localStorage.getItem("nssUserEmail") || "";
    
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
    
    setProfileData({
      fullName: name,
      email: email,
      department: role === "pc" ? "Administration" : role === "po" ? "Computer Science" : "Information Technology",
      employeeId: role === "pc" ? "PC001" : role === "po" ? "PO001" : "ST001",
      phone: "+91 9876543210",
      designation: role === "pc" ? "Program Coordinator" : role === "po" ? "Program Officer" : "Student Coordinator"
    });
  }, []);

  const handleSave = () => {
    localStorage.setItem("nssUserName", profileData.fullName);
    localStorage.setItem("nssUserEmail", profileData.email);
    
    setUserName(profileData.fullName);
    setUserEmail(profileData.email);
    setIsEditing(false);
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleCancel = () => {
    setProfileData({
      fullName: userName,
      email: userEmail,
      department: userRole === "pc" ? "Administration" : userRole === "po" ? "Computer Science" : "Information Technology",
      employeeId: userRole === "pc" ? "PC001" : userRole === "po" ? "PO001" : "ST001",
      phone: "+91 9876543210",
      designation: userRole === "pc" ? "Program Coordinator" : userRole === "po" ? "Program Officer" : "Student Coordinator"
    });
    setIsEditing(false);
  };

  if (!userRole || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getRoleDisplayName = () => {
    switch (userRole) {
      case "pc": return "Program Coordinator";
      case "po": return "Program Officer";
      case "sc": return "Student Coordinator";
      default: return "User";
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case "pc": return "from-purple-500 to-purple-700";
      case "po": return "from-blue-500 to-blue-700";
      case "sc": return "from-green-500 to-green-700";
      default: return "from-slate-500 to-slate-700";
    }
  };

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-nss-primary">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your personal information and account settings</p>
          </div>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)} 
              className="bg-nss-primary hover:bg-nss-dark"
            >
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
              <Button 
                onClick={handleCancel} 
                variant="outline"
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="" />
                    <AvatarFallback className={`bg-gradient-to-br ${getRoleColor()} text-white text-2xl font-bold`}>
                      {profileData.fullName.split(" ").map(name => name[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button 
                      size="sm" 
                      className="absolute -bottom-1 -right-1 rounded-full p-2"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">{profileData.fullName}</h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${getRoleColor()} text-white text-sm font-medium`}>
                    <Shield className="mr-1 h-4 w-4" />
                    {getRoleDisplayName()}
                  </div>
                  <p className="text-gray-600 flex items-center justify-center">
                    <Building className="mr-1 h-4 w-4" />
                    {profileData.department}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personal Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  {isEditing ? "Update your personal details below" : "Your personal information and contact details"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center">
                      <User className="mr-1 h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                      disabled={!isEditing}
                      className={isEditing ? "" : "bg-gray-50"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="mr-1 h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      disabled={!isEditing}
                      className={isEditing ? "" : "bg-gray-50"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId" className="flex items-center">
                      <IdCard className="mr-1 h-4 w-4" />
                      {userRole === "sc" ? "Student ID" : "Employee ID"}
                    </Label>
                    <Input
                      id="employeeId"
                      value={profileData.employeeId}
                      onChange={(e) => setProfileData({...profileData, employeeId: e.target.value})}
                      disabled={!isEditing}
                      className={isEditing ? "" : "bg-gray-50"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="flex items-center">
                      <Building className="mr-1 h-4 w-4" />
                      Department
                    </Label>
                    <Input
                      id="department"
                      value={profileData.department}
                      onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                      disabled={!isEditing}
                      className={isEditing ? "" : "bg-gray-50"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      disabled={!isEditing}
                      className={isEditing ? "" : "bg-gray-50"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="designation" className="flex items-center">
                      <Shield className="mr-1 h-4 w-4" />
                      Designation
                    </Label>
                    <Input
                      id="designation"
                      value={profileData.designation}
                      onChange={(e) => setProfileData({...profileData, designation: e.target.value})}
                      disabled={!isEditing}
                      className={isEditing ? "" : "bg-gray-50"}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
