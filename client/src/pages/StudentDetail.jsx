import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, CalendarPlus, Trash2 } from 'lucide-react';
import { api } from '../api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStudent(id).then(data => {
      setStudent(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        await api.deleteStudent(id);
        navigate('/students');
      } catch {
        alert('Failed to delete student');
      }
    }
  };

  const handleRenew = async () => {
    if (window.confirm('Are you sure you want to renew this subscription for 1 month?')) {
      try {
        const updatedStudent = await api.renewStudent(id, {});
        setStudent(updatedStudent);
        alert(`Successfully renewed! New End Date: ${new Date(updatedStudent.expiryDate).toLocaleDateString('en-GB')}`);
      } catch (error) {
        alert(error.message || 'Failed to renew subscription');
      }
    }
  };

  if (loading) return <div className="loading">Loading details...</div>;
  if (!student) return <div>Student not found.</div>;

  const isExpired = new Date(student.expiryDate) < new Date();

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-sm mb-lg">
        <div className="flex items-center gap-md">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>Back</Button>
          <h1>Student Details</h1>
        </div>
        <div className="flex gap-md">
          <Link to={`/students/${id}/edit`}>
            <Button variant="secondary" icon={Edit}>Edit</Button>
          </Link>
          <Button variant="danger" icon={Trash2} onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 grid-stack-mobile">
        <Card>
          <div className="flex justify-between items-center mb-md">
            <h2>Profile Information</h2>
            <Badge variant={isExpired ? 'danger' : 'success'}>
              {isExpired ? 'Expired' : 'Active'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-md mt-md">
            <div>
              <span className="text-muted block mb-sm">Full Name</span>
              <div className="font-large">{student.name}</div>
            </div>
            <div>
              <span className="text-muted block mb-sm">Phone Number</span>
              <div className="font-large">{student.mobile}</div>
            </div>
            <div>
              <span className="text-muted block mb-sm">Plan</span>
              <div className="font-large">{student.plan}</div>
            </div>
            <div>
              <span className="text-muted block mb-sm">Seat Number</span>
              <div className="font-large">{student.seatNumber || 'N/A'}</div>
            </div>
            <div>
              <div className="text-muted text-sm mb-xs">Join Date</div>
              <div className="font-large">{new Date(student.joiningDate).toLocaleDateString('en-GB')}</div>
            </div>
            <div>
              <div className="text-muted text-sm mb-xs">End Date</div>
              <div className="font-large" style={{ color: isExpired ? 'var(--danger-color)' : 'inherit' }}>
                {new Date(student.expiryDate).toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>
          
          <div className="mt-lg pt-md" style={{ borderTop: '1px solid var(--card-border)' }}>
            <Button variant="primary" icon={CalendarPlus} style={{ width: '100%' }} onClick={handleRenew}>
              Renew Subscription
            </Button>
          </div>
        </Card>

        <Card>
          <h2>Renewal History</h2>
          <div className="table-responsive mt-md">
            <table className="table">
              <thead>
                <tr>
                  <th>Payment Date</th>
                  <th>Amount Paid</th>
                  <th>New End Date</th>
                </tr>
              </thead>
              <tbody>
                {student.renewalHistory && student.renewalHistory.length > 0 ? (
                  student.renewalHistory.map((history, idx) => (
                    <tr key={idx}>
                      <td>
                        {new Date(history.paidAt || history.renewalDate).toLocaleString('en-GB', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', hour12: true
                        })}
                      </td>
                      <td>₹{history.amount}</td>
                      <td>{new Date(history.expiryDate).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">No renewal history.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
