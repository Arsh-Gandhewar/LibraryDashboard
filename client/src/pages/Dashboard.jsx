import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, Clock, IndianRupee, AlertCircle, PlusCircle } from 'lucide-react';
import { api } from '../api';
import { Card, StatCard } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import SeatMap from '../components/SeatMap';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [seats, setSeats] = useState([]);
  const [dueToday, setDueToday] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDashboard(),
      api.getSeats(),
      api.getDueToday()
    ]).then(([dashboardData, seatsData, dueData]) => {
      setData(dashboardData);
      setSeats(seatsData);
      setDueToday(dueData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="loading">Loading Dashboard...</div>;
  }

  if (!data) return null;

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-sm mb-lg">
        <h1>Dashboard</h1>
        <Link to="/students/new">
          <Button icon={PlusCircle}>New Admission</Button>
        </Link>
      </div>

      <div className="grid grid-cols-4 mb-lg">
        <StatCard label="Total Students" value={data.totalStudents} icon={Users} color="var(--primary-color)" />
        <StatCard label="Active VIP" value={data.vipStudents} icon={UserCheck} color="var(--success-color)" />
        <StatCard label="Active Confirm" value={data.confirmStudents} icon={UserCheck} color="var(--success-color)" />
        <StatCard label="Active Waiting" value={data.waitingStudents} icon={UserCheck} color="var(--success-color)" />
      </div>

      <div className="grid grid-cols-2 mb-lg">
        <StatCard label="Due Today" value={data.dueTodayCount} icon={Clock} color="var(--warning-color)" />
        <StatCard label="Monthly Revenue" value={`₹${data.monthlyRevenue}`} icon={IndianRupee} color="var(--primary-color)" />
      </div>

      <div className="grid grid-cols-2 grid-stack-mobile">
        <Card className="mb-lg">
          <div className="flex justify-between items-center mb-md">
            <h2>Due Today</h2>
            <Link to="/reminders">
              <Button variant="secondary" icon={AlertCircle}>View All</Button>
            </Link>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Seat</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {dueToday.filter(s => s.status === 'Due Today').slice(0, 5).map(student => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.seatNumber || 'Waiting'}</td>
                    <td>
                      <Badge variant="warning">Due Today</Badge>
                    </td>
                    <td>
                      <Link to={`/students/${student._id}/renew`}>
                        <Button variant="primary">Renew</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {dueToday.filter(s => s.status === 'Due Today').length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">No students due today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="mb-lg">
          <div className="flex justify-between items-center mb-md">
            <h2>Recent Admissions</h2>
            <Link to="/students">
              <Button variant="secondary" icon={Users}>View All</Button>
            </Link>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Plan</th>
                  <th>Seat</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAdmissions?.map(student => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.plan}</td>
                    <td>{student.seatNumber || 'Waiting'}</td>
                    <td>{new Date(student.joiningDate).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(!data.recentAdmissions || data.recentAdmissions.length === 0) && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">No recent admissions.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card>
        <h2>Seat Overview</h2>
        <div className="mt-md">
          <SeatMap seats={seats} />
        </div>
      </Card>
    </div>
  );
}
