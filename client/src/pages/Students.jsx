import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Edit, Eye, UserPlus } from 'lucide-react';
import { api } from '../api';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    setLoading(true);
    api.getStudents().then(data => {
      setStudents(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.mobile && s.mobile.includes(searchTerm)) ||
    (s.seatNumber && s.seatNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-sm mb-lg">
        <h1>Students</h1>
        <Link to="/students/new">
          <Button icon={UserPlus}>New Admission</Button>
        </Link>
      </div>

      <Card className="mb-lg">
        <div className="form-group mb-0 relative flex items-center gap-md">
          <Search size={24} className="text-muted" />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by name, phone, or seat number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="loading">Loading Students...</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Plan</th>
                  <th>Seat</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const isExpired = new Date(student.expiryDate) < new Date();
                  return (
                    <tr key={student._id}>
                      <td>{student.name}</td>
                      <td>{student.mobile}</td>
                      <td>{student.plan}</td>
                      <td>{student.seatNumber || 'Waiting'}</td>
                      <td>{new Date(student.joiningDate).toLocaleDateString()}</td>
                      <td>
                        <Badge variant={isExpired ? 'danger' : 'success'}>
                          {isExpired ? 'Expired' : 'Active'}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex gap-sm">
                          <Link to={`/students/${student._id}`}>
                            <Button variant="secondary" icon={Eye}>View</Button>
                          </Link>
                          <Link to={`/students/${student._id}/edit`}>
                            <Button variant="secondary" icon={Edit}>Edit</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">No students found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
