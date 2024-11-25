// function Assistant() {
//   return (
//     <div>
//       <h1>Assistant</h1>
//     </div>
//   );
// }

// export default Assistant;
// TAOfficeHoursPage.tsx

// TAOfficeHoursPage.tsx

import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../config/Firebase'; // Adjust the import based on your Firebase configuration
import { useAuthState } from 'react-firebase-hooks/auth';
import '../css/Assistant.css'; // Import the CSS file
import { signOut } from 'firebase/auth';

// Add this function inside your component
const handleLogout = async () => {
  try {
    await signOut(auth); // Sign out the current user
    window.location.href = '/'; // Redirect to the home or login page
  } catch (error) {
    console.error('Error logging out:', error);
    alert('Failed to log out. Please try again.');
  }
};

interface OfficeHour {
  ohId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
}

interface ChangeRequest {
  change_request_id: string;
  ohId: string;
  action: 'change' | 'cancel';
  date: string;
  newDate?: string;
  newStartTime?: string;
  newEndTime?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitTime: Timestamp;
  processed_at?: Timestamp;
  response_note?: string;
  note?: string;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TAOfficeHoursPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([]);
  const [selectedOfficeHourId, setSelectedOfficeHourId] = useState('');
  const [action, setAction] = useState<'change' | 'cancel'>('change');
  const [date, setDate] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [note, setNote] = useState('');
  const [instructors, setInstructors] = useState<{ user_id: string; name: string }[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);

  useEffect(() => {
    if (!user) return;

    // Fetch TA's default office hours
    const fetchOfficeHours = async () => {
      const officeHoursQuery = query(
        collection(db, 'officeHours'),
        where('userId', '==', user.uid),
        where('active', '==', true)
      );
      const querySnapshot = await getDocs(officeHoursQuery);
      const officeHoursData = querySnapshot.docs.map((doc) => ({
        ohId: doc.id,
        ...doc.data(),
      })) as OfficeHour[];
      setOfficeHours(officeHoursData);
    };

    // Fetch instructors
    const fetchInstructors = async () => {
      const instructorsQuery = query(collection(db, 'users'), where('role', '==', 'instructor'));
      const querySnapshot = await getDocs(instructorsQuery);
      const instructorsData = querySnapshot.docs.map((doc) => ({
        user_id: doc.id,
        name: doc.data().name,
      }));
      setInstructors(instructorsData);
    };

    // Fetch TA's change requests
    const changeRequestsQuery = query(
      collection(db, 'changeRequests'),
      where('taId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(changeRequestsQuery, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        change_request_id: doc.id,
        ...doc.data(),
      })) as ChangeRequest[];
      setChangeRequests(requests);
    });

    fetchOfficeHours();
    fetchInstructors();

    return () => {
      unsubscribe();
    };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOfficeHourId || !date || !selectedInstructorId) {
      alert('Please fill in all required fields.');
      return;
    }

    if (action === 'change' && (!newDate || !newStartTime || !newEndTime)) {
      alert('Please provide new date and time for the office hour.');
      return;
    }

    try {
      const newRequest = {
        taId: user?.uid,
        ohId: selectedOfficeHourId,
        action,
        date,
        newDate: action === 'change' ? newDate : null,
        newStartTime: action === 'change' ? newStartTime : null,
        newEndTime: action === 'change' ? newEndTime : null,
        instructorId: selectedInstructorId,
        note,
        status: 'pending',
        submitTime: Timestamp.now(),
      };

      await addDoc(collection(db, 'changeRequests'), newRequest);

      // Reset form fields
      setSelectedOfficeHourId('');
      setAction('change');
      setDate('');
      setNewDate('');
      setNewStartTime('');
      setNewEndTime('');
      setNote('');
      setSelectedInstructorId('');

      alert('Change request submitted successfully.');
    } catch (error) {
      console.error('Error submitting change request:', error);
      alert('Failed to submit change request.');
    }
  };

  return (
    <div className="ta-container">
      <h1 className="ta-heading">TA Dashboard</h1>
      <header className="ta-header">
        <button onClick={handleLogout} className="logout-button">
          Log Out
        </button>
      </header>


      <section className="calendar-section">
        <h2>Your Office Hours Calendar</h2>
        <iframe
          src="https://calendar.google.com/calendar/embed?src=c_5402a26b28164d318527d4655119ac3ae212f331f32594e1634372420687502f%40group.calendar.google.com&ctz=America%2FChicago&mode=week"
          style={{ border: 0 }}
          width="800"
          height="600"
          frameBorder="0"
          scrolling="no"
        ></iframe>
      </section>

      <section className="office-hours-section">
        <h2>Your Default Office Hours</h2>
        <ul className="office-hours-list">
          {officeHours.map((oh) => (
            <li key={oh.ohId}>
              <strong>{daysOfWeek[oh.dayOfWeek]}</strong> {oh.startTime} - {oh.endTime}{' '}
              {oh.location && `at ${oh.location}`}
            </li>
          ))}
        </ul>
      </section>

      <section className="change-request-section">
        <h2>Submit Office Hour Change Request</h2>
        <form onSubmit={handleSubmit} className="change-request-form">
          <div className="form-group">
            <label>
              Office Hour to Change:
              <select
                value={selectedOfficeHourId}
                onChange={(e) => setSelectedOfficeHourId(e.target.value)}
                required
              >
                <option value="">Select Office Hour</option>
                {officeHours.map((oh) => (
                  <option key={oh.ohId} value={oh.ohId}>
                    {daysOfWeek[oh.dayOfWeek]}: {oh.startTime} - {oh.endTime}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-group">
            <label>
              Action:
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as 'change' | 'cancel')}
              >
                <option value="change">Change</option>
                <option value="cancel">Cancel</option>
              </select>
            </label>
          </div>

          <div className="form-group">
            <label>
              Date of Original Office Hour:
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>
          </div>

          {action === 'change' && (
            <>
              <div className="form-group">
                <label>
                  New Date:
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  New Start Time:
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    required
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  New End Time:
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    required
                  />
                </label>
              </div>
            </>
          )}

          <div className="form-group">
            <label>
              Instructor:
              <select
                value={selectedInstructorId}
                onChange={(e) => setSelectedInstructorId(e.target.value)}
                required
              >
                <option value="">Select Instructor</option>
                {instructors.map((inst) => (
                  <option key={inst.user_id} value={inst.user_id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-group">
            <label>
              Note to Instructor:
              <textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
          </div>

          <button type="submit" className="submit-button">
            Submit Request
          </button>
        </form>
      </section>

      <section className="requests-section">
        <h2>Your Change Requests</h2>
        <table className="requests-table">
          <thead>
            <tr>
              <th>Office Hour</th>
              <th>Action</th>
              <th>Date</th>
              <th>Status</th>
              <th>Response Note</th>
            </tr>
          </thead>
          <tbody>
            {changeRequests.map((req) => (
              <tr key={req.change_request_id}>
                <td>
                  {officeHours.find((oh) => oh.ohId === req.ohId)
                    ? `${daysOfWeek[
                        officeHours.find((oh) => oh.ohId === req.ohId)!.dayOfWeek
                      ]} ${officeHours.find((oh) => oh.ohId === req.ohId)!.startTime} - ${
                        officeHours.find((oh) => oh.ohId === req.ohId)!.endTime
                      }`
                    : 'Office Hour'}
                </td>
                <td>{req.action}</td>
                <td>{req.date}</td>
                <td>{req.status}</td>
                <td>{req.response_note || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default TAOfficeHoursPage;
