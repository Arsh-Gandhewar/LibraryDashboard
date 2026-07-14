import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, ArrowLeft } from 'lucide-react';
import { api } from '../api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import SeatMap from '../components/SeatMap';

export default function AdmissionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    plan: 'VIP',
    seatNumber: '',
    joiningDate: new Date().toISOString().split('T')[0]
  });

  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    api.getSeats().then(setSeats).catch(console.error);
    
    if (isEdit) {
      api.getStudent(id).then(data => {
        setFormData({
          name: data.name || '',
          mobile: data.mobile || '',
          plan: data.plan || 'VIP',
          seatNumber: data.seatNumber || '',
          joiningDate: new Date(data.joiningDate || new Date()).toISOString().split('T')[0]
        });
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.plan === 'Waiting') {
        payload.seatNumber = null;
      }
      
      if (isEdit) {
        await api.updateStudent(id, payload);
      } else {
        await api.createStudent(payload);
      }
      navigate('/students');
    } catch (error) {
      alert(error.message || 'An error occurred while saving.');
    }
  };

  if (loading) return <div className="loading">Loading form...</div>;

  return (
    <div>
      <div className="flex items-center flex-wrap gap-md mb-lg">
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>Back</Button>
        <h1>{isEdit ? 'Edit Student' : 'New Admission'}</h1>
      </div>

      <div className="grid grid-cols-2">
        <Card>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" name="mobile" className="form-control" value={formData.mobile} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Subscription Type</label>
              <select name="plan" className="form-control" value={formData.plan} onChange={handleChange}>
                <option value="VIP">VIP</option>
                <option value="Confirm">Confirm</option>
                <option value="Waiting">Waiting</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Join Date</label>
              <input type="date" name="joiningDate" className="form-control" value={formData.joiningDate} onChange={handleChange} required />
            </div>

            {formData.plan !== 'Waiting' && (
              <div className="form-group">
                <label className="form-label">Selected Seat</label>
                <input type="text" className="form-control" value={formData.seatNumber || 'No seat selected'} readOnly />
              </div>
            )}

            <div className="flex items-center justify-end flex-wrap mt-lg">
              <div className="flex flex-wrap gap-md">
                <Button type="button" variant="danger" icon={X} onClick={() => navigate('/students')}>Cancel</Button>
                <Button type="submit" variant="success" icon={Save}>{isEdit ? 'Update Student' : 'Admit Student'}</Button>
              </div>
            </div>
          </form>
        </Card>

        {formData.plan !== 'Waiting' && (
          <Card>
            <h2>Select a Seat</h2>
            <p className="text-muted mb-md">Click on an available seat to assign it to the student.</p>
            <SeatMap 
              seats={seats} 
              selectedSeat={formData.seatNumber} 
              onSeatSelect={(seatId) => setFormData(prev => ({ ...prev, seatNumber: seatId === prev.seatNumber ? '' : seatId }))}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
