import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import AdmissionForm from './pages/AdmissionForm';
import StudentDetail from './pages/StudentDetail';
import Revenue from './pages/Revenue';
import Reminders from './pages/Reminders';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="students/new" element={<AdmissionForm />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="students/:id/edit" element={<AdmissionForm />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="reminders" element={<Reminders />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
