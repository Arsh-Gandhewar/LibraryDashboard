import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { api } from '../api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export default function RenewalForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    newEndDate: '',
    amountPaid: ''
  });

  useEffect(() => {
    api.getStudent(id).then(data => {
      setStudent(data);
      // Auto-calculate new end date (+1 month from current end date)
      const currentEndDate = new Date(data.endDate);
      const newEnd = new Date(currentEndDate.setMonth(currentEndDate.getMonth() + 1));
      
      setFormData({
        newEndDate: newEnd.toISOString().split('T')[0],
        amountPaid: data.monthlyFee || 1000
      });
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.renewStudent(id, {
        newEndDate: formData.newEndDate,
        amountPaid: Number(formData.amountPaid)
      });
      navigate(`/students/${id}`);
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-md mb-lg">
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>Back</Button>
        <h1>Renew Student: {student.name}</h1>
      </div>

      <div className="grid grid-cols-2">
        <Card>
          <div className="mb-lg">
            <h3 className="text-muted mb-sm">Current Plan Details</h3>
            <div className="flex justify-between items-center bg-black/20 p-4 rounded-md">
              <div>
                <span className="block text-muted">Current End Date</span>
                <span className="font-large">{new Date(student.endDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="block text-muted">Plan</span>
                <span className="font-large">{student.plan}</span>
              </div>
              <div>
                <span className="block text-muted">Seat</span>
                <span className="font-large">{student.seatNumber || 'Waiting'}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New End Date</label>
              <input 
                type="date" 
                name="newEndDate" 
                className="form-control" 
                value={formData.newEndDate} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Renewal Fee Paid (₹)</label>
              <input 
                type="number" 
                name="amountPaid" 
                className="form-control" 
                value={formData.amountPaid} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="flex justify-end mt-lg">
              <Button type="submit" variant="success" icon={Save}>Confirm Renewal</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
