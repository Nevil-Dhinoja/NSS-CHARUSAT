// File: src/pages/Dashboard/index.jsx
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProgramCoordinatorDashboard from "./ProgramCoordinatorDashboard";
import ProgramOfficerDashboard from "./ProgramOfficerDashboard";
import StudentCoordinatorDashboard from "./StudentCoordinatorDashboard";
import { isJwtExpired } from "@/components/decodeJwtToken";

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

useEffect(() => {
  const token = localStorage.getItem("nssUserToken");
  const userStr = localStorage.getItem("nssUser");

  if (!token || !userStr || isJwtExpired(token)) {
    localStorage.clear();
    window.location.href = "/login";
    return;
  }

  try {
    const user = JSON.parse(userStr);

    const roleMap = {
      "Program Officer": "po",
      "Program Coordinator": "pc",
      "Student Coordinator": "sc",
      "PO": "po",
      "PC": "pc",
      "SC": "sc",
    };

    const mappedRole = roleMap[user.role] || "unknown";

    setUserRole(mappedRole);
    setUserName(user.name || "");
    setUserEmail(user.email || "");
  } catch (err) {
    console.error("Failed to parse user:", err);
    localStorage.clear();
    window.location.href = "/login";
  }
}, []);


  const renderDashboardContent = () => {
    switch (userRole) {
      case "pc": return <ProgramCoordinatorDashboard />;
      case "po": return <ProgramOfficerDashboard />;
      case "sc": return <StudentCoordinatorDashboard />;
      default: return <div className="text-center text-red-600">Access Denied</div>;
    }
  };

  if (!userRole) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <DashboardLayout userRole={userRole} userName={userName} userEmail={userEmail}>
      {renderDashboardContent()}
    </DashboardLayout>
  );
};

export default Dashboard;




// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import DashboardLayout from "@/components/DashboardLayout";
// import ProgramCoordinatorDashboard from "./ProgramCoordinatorDashboard";
// import ProgramOfficerDashboard from "./ProgramOfficerDashboard";
// import StudentCoordinatorDashboard from "./StudentCoordinatorDashboard";

// const Dashboard = () => {
//   const [userRole, setUserRole] = useState(null);
//   const [userName, setUserName] = useState("");
//   const [userId, setUserId] = useState("");
//   const [userDept, setUserDept] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const initializeDashboard = () => {
//     const token = localStorage.getItem("nssUserToken");
//     const userStr = localStorage.getItem("nssUser");

//       if (!token || !userStr) {
//         navigate("/login", { replace: true });
//         return;
//       }

//       try {
//         const user = JSON.parse(userStr);
//         const role = user.role?.toLowerCase();

//         if (!role || !user.id || !user.name) {
//           throw new Error("Incomplete user info");
//         }

//         setUserRole(role);
//         setUserName(user.name);
//         setUserId(user.id);
//         setUserDept(user.department || "");
//         setIsLoading(false);
//       } catch (err) {
//         localStorage.clear();
//         navigate("/login", { replace: true });
//       }
//     };

//     initializeDashboard();
//   }, [navigate]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   const renderDashboardContent = () => {
//     const commonProps = { userRole, userName, userId, userDept };

//     switch (userRole) {
//       case "pc":
//         return <ProgramCoordinatorDashboard {...commonProps} />;
//       case "po":
//         return <ProgramOfficerDashboard {...commonProps} />;
//       case "sc":
//         return <StudentCoordinatorDashboard {...commonProps} />;
//       default:
//         return (
//           <div className="min-h-screen flex flex-col items-center justify-center text-center">
//             <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
//             <p className="mt-2">Unknown role: {userRole}</p>
//             <button
//               className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
//               onClick={() => {
//                 localStorage.clear();
//                 navigate("/login");
//               }}
//             >
//               Back to Login
//             </button>
//           </div>
//         );
//     }
//   };

//   return (
//     <DashboardLayout userRole={userRole} userName={userName} userId={userId} userDept={userDept}>
//       {renderDashboardContent()}
//     </DashboardLayout>
//   );
// };

// export default Dashboard;
