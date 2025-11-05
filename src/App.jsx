import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProjectView from "./components/projects/ProjectView";
import SuiteListPage from "./components/suites/SuiteListPage";
import LoginPage from "./common/LoginPage";
import Home from "./components/Home/Home";
import MainLayout from "./common/layout/Main_Layout";
import AutomateEditor from "./components/AutomateEditor";
import { decrypt } from "./hooks/crypt";
import AssignDialogBox from "./components/ui/AssignUserDialog";

export default function App() {
  const user = decrypt("User"); 
  return (
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<LoginPage/>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/projectview" element={<ProjectView />} />
              <Route path="/projects/:projectId" element={<SuiteListPage />} />
              <Route path="/AutomateEditor" element={<AutomateEditor />} />
            </Route>
            <Route path="/login" element={<Navigate to="/home" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
