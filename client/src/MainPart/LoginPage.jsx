import React, { useState } from "react";
import "./LoginForm.css";
import logoNSS from "../assets/NSS.png";
import logoCharusat from "../assets/5.jpg";
import logoNss from "../assets/login2.png";

function LoginPage() {
  const [institute, setInstitute] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const departments = [
    { id: 1, name: "CE", instituteId: 1 },
    { id: 2, name: "IT", instituteId: 1 },
    { id: 3, name: "CSE", instituteId: 1 },
    { id: 4, name: "ME", instituteId: 2 },
    { id: 5, name: "AIML", instituteId: 2 },
    { id: 6, name: "CL", instituteId: 2 },
    { id: 7, name: "EE", instituteId: 2 },
    { id: 8, name: "CSE", instituteId: 2 },
    { id: 9, name: "IT", instituteId: 2 },
    { id: 10, name: "CE", instituteId: 2 },
    { id: 11, name: "EC", instituteId: 2 },
  ];

  const isDepRequired = institute === "1" || institute === "2";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Client-side validation
    if (!institute || !role || !loginId || !password) {
      alert("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    if (isDepRequired && !department) {
      alert("Please select your Department for DEPSTAR or CSPIT.");
      setIsLoading(false);
      return;
    }

    try {
      // Prepare login data
      const loginData = {
        login_id: loginId,
        password: password,
        institute: institute,
        role: role,
        ...(department && { department: department })
      };

      // Make API call to backend
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Show success alert
        alert(`Login successful! Welcome ${data.user.name}`);
        
        // Redirect based on role or handle navigation
        console.log('Login success!', data);
        
        // You can redirect to dashboard here
        // window.location.href = '/dashboard';
        // or use React Router navigation
        
      } else {
        alert(data.message || 'Login failed. Please check your credentials.');
      }

    } catch (error) {
      console.error('Login error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="logo-section">
        <img src={logoNSS} alt="NSS Logo" className="nss-logo" />
        <h1 className="Slogan">
          "Not Me, But <span className="heilight"><h1>You"</h1></span>
        </h1>
      </div>

      <div className="login-card" style={{ background: "#f2f2f2" }}>
        <img src={logoCharusat} alt="Charusat Logo" className="charusat-logo" />

        <form className="form" onSubmit={handleSubmit}>
          <center>
            <select
              className="input-field"
              value={institute}
              onChange={(e) => {
                setInstitute(e.target.value);
                setDepartment("");
              }}
              required
              disabled={isLoading}
            >
              <option value="" disabled hidden>Select Institute</option>
              <option value="1">DEPSTAR</option>
              <option value="2">CSPIT</option>
              <option value="3">PDPIAS</option>
              <option value="4">RPCP</option>
              <option value="5">IIIM</option>
              <option value="6">ARIP</option>
              <option value="7">CMPICA</option>
              <option value="8">BDIPS</option>
              <option value="9">MTIN</option>
            </select>

            <select
              className="input-field"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={!["1", "2"].includes(institute) || isLoading}
            >
              <option value="" disabled hidden>Select Department</option>
              {departments
                .filter((dept) => dept.instituteId.toString() === institute)
                .map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
            </select>

            <select
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="" disabled hidden>Select Role</option>
              <option value="PO">Program Officer</option>
              <option value="SC">Student Coordinator</option>
            </select>

            <input
              type="text"
              placeholder="Username"
              className="input-field"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
              disabled={isLoading}
            />
            <input
              type="password"
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />

            <br />
            <a href="#" className="forgot-password">Register /</a>
            <a href="#" className="forgot-password">Forgot your password</a>
            <br />

            <button 
              type="submit" 
              className="login-button" 
              style={{ width: "200px" }}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            <img src={logoNss} alt="NSS Logo" className="Nss-logo" />
          </center>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;