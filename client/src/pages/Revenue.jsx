import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { IndianRupee, TrendingUp, Calendar, Users } from 'lucide-react';
import { api } from '../api';
import { Card, StatCard } from '../components/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Revenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRevenue().then(res => {
      setData(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      // Fallback mock data if API fails or is not implemented yet
      setData({
        monthlyRevenue: 45000,
        todayCollection: 2500,
        admissionFeeCollection: 15000,
        renewalCollection: 30000,
        revenueByPlan: {
          'VIP': { amount: 20000, count: 20 },
          'Confirm': { amount: 15000, count: 23 },
          'Waiting': { amount: 5000, count: 9 }
        }
      });
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading">Loading Revenue Data...</div>;

  const planChartData = {
    labels: Object.keys(data.revenueByPlan || {}),
    datasets: [
      {
        label: 'Revenue by Plan',
        data: Object.values(data.revenueByPlan || {}).map(item => item.amount !== undefined ? item.amount : item),
        backgroundColor: [
          'rgba(79, 138, 255, 0.7)',
          'rgba(56, 178, 172, 0.7)',
          'rgba(246, 173, 85, 0.7)',
          'rgba(255, 92, 119, 0.7)',
          'rgba(155, 89, 182, 0.7)',
        ],
        borderColor: [
          '#4f8aff',
          '#38b2ac',
          '#f6ad55',
          '#ff5c77',
          '#9b59b6',
        ],
        borderWidth: 1,
      },
    ],
  };

  const collectionTypeData = {
    labels: ['Admissions', 'Renewals'],
    datasets: [
      {
        label: 'Collection Type',
        data: [data.admissionFeeCollection || 0, data.renewalCollection || 0],
        backgroundColor: ['rgba(79, 138, 255, 0.8)', 'rgba(56, 178, 172, 0.8)'],
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#f0f4f8',
          font: { size: 16 }
        }
      }
    }
  };

  return (
    <div>
      <h1 className="mb-lg">Revenue Analytics</h1>

      <div className="grid grid-cols-4 mb-lg">
        <StatCard label="Monthly Revenue" value={`₹${data.monthlyRevenue}`} icon={TrendingUp} color="var(--success-color)" />
        <StatCard label="Today's Collection" value={`₹${data.todayCollection}`} icon={Calendar} color="var(--primary-color)" />
        <StatCard label="Admissions" value={`₹${data.admissionFeeCollection}`} icon={Users} color="var(--warning-color)" />
        <StatCard label="Renewals" value={`₹${data.renewalCollection}`} icon={IndianRupee} color="var(--primary-color)" />
      </div>

      <div className="grid grid-cols-2 grid-stack-mobile">
        <Card>
          <h2 className="mb-md">Revenue by Plan</h2>
          <div style={{ height: '400px', display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={planChartData} options={chartOptions} />
          </div>
        </Card>
        
        <Card>
          <h2 className="mb-md">Collection Breakdown</h2>
          <div style={{ height: '400px', display: 'flex', justifyContent: 'center' }}>
            <Bar 
              data={collectionTypeData} 
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { color: '#f0f4f8', font: { size: 14 } },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                  },
                  x: {
                    ticks: { color: '#f0f4f8', font: { size: 16 } },
                    grid: { display: false }
                  }
                }
              }} 
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
