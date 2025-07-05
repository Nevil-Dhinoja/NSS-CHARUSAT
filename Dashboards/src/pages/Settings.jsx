import React from "react";
import DashboardLayout from "@/components/DashboardLayout.jsx";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const [userRole, setUserRole] = React.useState(null);
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const { toast } = useToast();

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
    } catch (err) {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  if (!userRole || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-nss-primary">Settings</h1>

        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
              <div className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={userName} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue={userEmail} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={
                      userRole === "pc" ? "Program Coordinator" :
                        userRole === "po" ? "Program Officer" :
                          "Student Coordinator"
                    }
                    disabled
                  />
                </div>

                <Button
                  onClick={handleSaveSettings}
                  className="mt-4 bg-nss-primary hover:bg-nss-dark"
                >
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <p>Configure how you want to receive notifications.</p>
                {/* Notification settings will be added here */}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
              <div className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>

                <Button
                  onClick={() => toast({
                    title: "Password Updated",
                    description: "Your password has been changed successfully.",
                  })}
                  className="mt-4 bg-nss-primary hover:bg-nss-dark"
                >
                  Update Password
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
