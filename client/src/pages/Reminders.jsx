import { useEffect, useState } from 'react';
import { CalendarPlus, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

export default function Reminders() {
  const [dueStudents, setDueStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDueStudents = () => {
    setLoading(true);
    api.getDueToday().then(data => {
      setDueStudents(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDueStudents();
  }, []);

  const handleRenew = async (id) => {
    if (window.confirm('Are you sure you want to renew this subscription for 1 month?')) {
      try {
        const payload = { renewalDate: new Date().toISOString().split('T')[0] };
        const updatedStudent = await api.renewStudent(id, payload);
        alert(`Successfully renewed! New End Date: ${new Date(updatedStudent.expiryDate).toLocaleDateString()}`);
        fetchDueStudents();
      } catch (error) {
        alert(error.message || 'Failed to renew subscription');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        await api.deleteStudent(id);
        fetchDueStudents();
      } catch {
        alert('Failed to delete student');
      }
    }
  };

  if (loading) return <div className="loading">Loading Reminders...</div>;

  return (
    <div>
      <div className="mb-lg">
        <h1>Action Required</h1>
        <p className="text-muted">Manage students whose subscription is due today or has expired.</p>
      </div>

      <Card>
        <div className="flex items-center gap-md mb-lg">
          <AlertTriangle color="var(--warning-color)" size={32} />
          <h2>Needs Attention ({dueStudents.length})</h2>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Seat</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dueStudents.map(student => {
                const isExpired = new Date(student.expiryDate) < new Date();
                return (
                  <tr key={student._id}>
                    <td>
                      <div className="font-large">{student.name}</div>
                    </td>
                    <td>{student.mobile}</td>
                    <td>{student.seatNumber || 'Waiting'}</td>
                    <td>{new Date(student.expiryDate).toLocaleDateString()}</td>
                    <td>
                      <Badge variant={isExpired ? 'danger' : 'warning'}>
                        {student.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex gap-sm">
                        <Button 
                          variant="primary" 
                          icon={CalendarPlus} 
                          onClick={() => handleRenew(student._id)}
                        >
                          Renew
                        </Button>
                        <Button 
                          variant="danger" 
                          icon={Trash2} 
                          onClick={() => handleDelete(student._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {dueStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted" style={{ padding: '40px 0' }}>
                    <Clock size={48} className="mb-sm mx-auto opacity-50" />
                    <div>All caught up! No students are due or expired.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
