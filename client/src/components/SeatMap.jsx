import React from 'react';

export default function SeatMap({ seats = {}, onSeatSelect, selectedSeat }) {
  // Process seats from backend structure
  const vipSeatsRaw = seats.vipSeats || [];
  const confirmSeatsRaw = seats.confirmSeats || [];

  const vipSeats = [];
  const confirmSeats = [];

  for (let i = 1; i <= 10; i++) {
    const seatId = `V${i}`;
    const seatInfo = vipSeatsRaw.find(s => s.seat === seatId);
    vipSeats.push({
      id: seatId,
      status: seatInfo && seatInfo.occupied ? 'occupied' : 'vacant',
      studentName: seatInfo ? seatInfo.studentName : null,
      joiningDate: seatInfo ? seatInfo.joiningDate : null
    });
  }

  for (let i = 1; i <= 68; i++) {
    const seatId = `C${i}`;
    const seatInfo = confirmSeatsRaw.find(s => s.seat === seatId);
    confirmSeats.push({
      id: seatId,
      status: seatInfo && seatInfo.occupied ? 'occupied' : 'vacant',
      studentName: seatInfo ? seatInfo.studentName : null,
      joiningDate: seatInfo ? seatInfo.joiningDate : null
    });
  }

  const renderSeat = (seat) => {
    let className = 'seat ';
    if (selectedSeat === seat.id) {
      className += 'seat-selected';
    } else if (seat.status === 'vacant') {
      className += 'seat-vacant';
    } else {
      className += 'seat-occupied';
    }

    return (
      <div 
        key={seat.id} 
        className={className}
        onClick={() => {
          if (seat.status === 'vacant' && onSeatSelect) {
            onSeatSelect(seat.id);
          }
        }}
      >
        {seat.id}
        {seat.status === 'occupied' && (
          <div className="seat-tooltip">
            <strong>{seat.studentName}</strong><br />
            Joined: {new Date(seat.joiningDate).toLocaleDateString('en-GB')}
          </div>
        )}
        {seat.status === 'vacant' && (
          <div className="seat-tooltip">Available</div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-lg">
        <h3>VIP Seats (V1 - V10)</h3>
        <div className="seat-map-container mt-md">
          {vipSeats.map(renderSeat)}
        </div>
      </div>
      <div>
        <h3>Confirm Seats (C1 - C68)</h3>
        <div className="seat-map-container mt-md">
          {confirmSeats.map(renderSeat)}
        </div>
      </div>
    </div>
  );
}
