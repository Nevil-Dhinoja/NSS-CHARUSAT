
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { Download, BarChart2, PieChart as PieChartIcon } from "lucide-react";

const Statistics = () => {
  const [userRole, setUserRole] = React.useState<"pc" | "po" | "sc" | null>(null);
  const [userName, setUserName] = React.useState<string>("");
  const [userEmail, setUserEmail] = React.useState<string>("");
  const [selectedYear, setSelectedYear] = React.useState("2023");

  // Mock data for charts
  const departmentData = [
    { name: "Computer Science", volunteers: 45 },
    { name: "Mechanical", volunteers: 38 },
    { name: "Electrical", volunteers: 32 },
    { name: "Civil", volunteers: 40 },
    { name: "Information Tech", volunteers: 35 },
  ];

  const monthlyEventsData = [
    { name: "Jan", events: 3 },
    { name: "Feb", events: 2 },
    { name: "Mar", events: 4 },
    { name: "Apr", events: 5 },
    { name: "May", events: 3 },
    { name: "Jun", events: 1 },
    { name: "Jul", events: 0 },
    { name: "Aug", events: 2 },
    { name: "Sep", events: 4 },
    { name: "Oct", events: 3 },
    { name: "Nov", events: 5 },
    { name: "Dec", events: 3 },
  ];

  const eventTypeData = [
    { name: "Health & Wellness", value: 35 },
    { name: "Environmental", value: 25 },
    { name: "Education", value: 20 },
    { name: "Community Service", value: 15 },
    { name: "Other", value: 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const beneficiaryData = [
    { name: "Jan", beneficiaries: 120 },
    { name: "Feb", beneficiaries: 180 },
    { name: "Mar", beneficiaries: 250 },
    { name: "Apr", beneficiaries: 320 },
    { name: "May", beneficiaries: 280 },
    { name: "Jun", beneficiaries: 150 },
    { name: "Jul", beneficiaries: 100 },
    { name: "Aug", beneficiaries: 200 },
    { name: "Sep", beneficiaries: 270 },
    { name: "Oct", beneficiaries: 310 },
    { name: "Nov", beneficiaries: 350 },
    { name: "Dec", beneficiaries: 290 },
  ];

  const yearComparison = [
    { year: "2021", volunteers: 350, events: 25, beneficiaries: 1800 },
    { year: "2022", volunteers: 390, events: 28, beneficiaries: 2100 },
    { year: "2023", volunteers: 450, events: 35, beneficiaries: 2500 },
  ];

  React.useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("nssUserToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    
    // Get user role from localStorage
    const role = localStorage.getItem("nssUserRole") as "pc" | "po" | "sc" | null;
    const name = localStorage.getItem("nssUserName") || "";
    const email = localStorage.getItem("nssUserEmail") || "";
    
    // Only Program Coordinator and Program Officer should access this page
    if (role !== "pc" && role !== "po") {
      window.location.href = "/dashboard";
      return;
    }
    
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
  }, []);

  if (!userRole || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={userEmail}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-nss-primary">Statistics & Analytics</h1>
          
          <div className="flex items-center space-x-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {yearComparison
            .filter(data => data.year === selectedYear)
            .map(data => (
              <React.Fragment key={data.year}>
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Volunteers</h3>
                  <p className="text-3xl font-bold mt-2 text-nss-primary">{data.volunteers}</p>
                  <div className="mt-2 text-xs text-green-600 flex items-center">
                    +5% from last year
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Events</h3>
                  <p className="text-3xl font-bold mt-2 text-nss-primary">{data.events}</p>
                  <div className="mt-2 text-xs text-green-600 flex items-center">
                    +10% from last year
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Beneficiaries</h3>
                  <p className="text-3xl font-bold mt-2 text-nss-primary">{data.beneficiaries}</p>
                  <div className="mt-2 text-xs text-green-600 flex items-center">
                    +12% from last year
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Avg. Hours per Volunteer</h3>
                  <p className="text-3xl font-bold mt-2 text-nss-primary">42</p>
                  <div className="mt-2 text-xs text-green-600 flex items-center">
                    +8% from last year
                  </div>
                </Card>
              </React.Fragment>
            ))}
        </div>
        
        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center">
                <BarChart2 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="distribution" className="flex items-center">
                <PieChartIcon className="h-4 w-4 mr-2" />
                Distribution
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="text-md font-semibold mb-4">Monthly Events</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyEventsData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="events" fill="#8884d8" name="Events" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="text-md font-semibold mb-4">Beneficiaries Reached</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={beneficiaryData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="beneficiaries" stroke="#8884d8" name="Beneficiaries" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
            
            <Card className="p-4">
              <h3 className="text-md font-semibold mb-4">Yearly Comparison</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={yearComparison}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="volunteers" fill="#8884d8" name="Volunteers" />
                    <Bar yAxisId="left" dataKey="events" fill="#82ca9d" name="Events" />
                    <Bar yAxisId="right" dataKey="beneficiaries" fill="#ffc658" name="Beneficiaries" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="distribution" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="text-md font-semibold mb-4">Volunteers by Department</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentData}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 70,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="volunteers" fill="#8884d8" name="Volunteers" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="text-md font-semibold mb-4">Events by Type</h3>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={eventTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {eventTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Statistics;
