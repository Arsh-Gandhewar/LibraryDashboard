import { useEffect, useState } from 'react';
import { Send, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

export default function Reminders() {
  const [dueStudents, setDueStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDueToday().then(data => {
      setDueStudents(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const sendWhatsApp = (student) => {
    const isExpired = new Date(student.endDate) < new Date();
    const status = isExpired ? 'expired' : 'due today';
    
    // Format the phone number (remove spaces, ensure country code)
    let phone = student.phone.replace(/\D/g, '');
    if (phone.length === 10) {
      phone = '91' + phone; // Add India country code by default if missing
    }

    const message = `Hello ${student.name}, this is a gentle reminder from the Library that your subscription has ${status}. Please renew it to continue your seamless study experience. Thank you!`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
  };

  if (loading) return <div className="loading">Loading Reminders...</div>;

  return (
    <div>
      <div className="mb-lg">
        <h1>WhatsApp Reminders</h1>
        <p className="text-muted">Send automated messages to students whose subscription is due today or has expired.</p>
      </div>

      <Card>
        <div className="flex items-center gap-md mb-lg">
          <AlertTriangle color="var(--warning-color)" size={32} />
          <h2>Action Required ({dueStudents.length})</h2>
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
                const isExpired = new Date(student.endDate) < new Date();
                return (
                  <tr key={student._id}>
                    <td>
                      <div className="font-large">{student.name}</div>
                    </td>
                    <td>{student.phone}</td>
                    <td>{student.seatNumber || 'Waiting'}</td>
                    <td>{new Date(student.endDate).toLocaleDateString()}</td>
                    <td>
                      <Badge variant={isExpired ? 'danger' : 'warning'}>
                        {isExpired ? 'Expired' : 'Due Today'}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant="success" 
                        icon={Send} 
                        onClick={() => sendWhatsApp(student)}
                      >
                        Send WhatsApp
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {dueStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted" style={{ padding: '40px 0' }}>
                    <Clock size={48} className="mb-sm mx-auto opacity-50" />
                    <div>All caught up! No students are due today.</div>
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
