import React, { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../config/Firebase'; // Adjust the import based on your Firebase configuration
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../css/Instructor.css'; // Optional CSS file for styling

interface TAUser {
  userId: string;
  fname: string;
  lname: string;
  email: string;
}

interface OfficeHour {
  ohId: string;
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
}

interface ChangeRequest {
  requestId: string;
  ta_id: string;
  ohId: string;
  action: 'change' | 'cancel';
  date: string;
  newDate?: string;
  newStartTime?: string;
  newEndTime?: string;
  instructorId: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: Timestamp;
  processed_at?: Timestamp;
  response_note?: string;
}

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const InstructorPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [tas, setTAs] = useState<TAUser[]>([]);
  const [newTAEmail, setNewTAEmail] = useState('');

  const [selectedTA, setSelectedTA] = useState<TAUser | null>(null);
  const [taOfficeHours, setTAOfficeHours] = useState<OfficeHour[]>([]);
  const [newOfficeHour, setNewOfficeHour] = useState({
    dayOfWeek: 0,
    startTime: '',
    endTime: '',
    location: '',
  });

  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);

  const [ownOfficeHours, setOwnOfficeHours] = useState<OfficeHour[]>([]);
  const [newOwnOfficeHour, setNewOwnOfficeHour] = useState({
    dayOfWeek: 0,
    startTime: '',
    endTime: '',
    location: '',
  });

  // State variables for the override form
  const [selectedOfficeHour, setSelectedOfficeHour] = useState<OfficeHour | null>(null);
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideAction, setOverrideAction] = useState<'change' | 'cancel'>('change');
  const [newOverrideDate, setNewOverrideDate] = useState('');
  const [newOverrideStartTime, setNewOverrideStartTime] = useState('');
  const [newOverrideEndTime, setNewOverrideEndTime] = useState('');





  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch TAs
    const fetchTAs = async () => {
      const taQuery = query(collection(db, 'users'), where('role', '==', 'ta'));
      const querySnapshot = await getDocs(taQuery);
      const taData = querySnapshot.docs.map((doc) => ({
        userId: doc.id,
        fname: doc.data().fname,
        lname: doc.data().lname,
        email: doc.data().email,
      })) as TAUser[];
      setTAs(taData);
    };

    // Fetch change requests sent to the instructor
    const changeRequestsQuery = query(
      collection(db, 'changeRequests'),
      where('instructorId', '==', user.uid),
      where('status', '==', 'pending')
    );
    const unsubscribeChangeRequests = onSnapshot(changeRequestsQuery, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        requestId: doc.id,
        ...doc.data(),
      })) as ChangeRequest[];
      setChangeRequests(requests);
    });

    // Fetch instructor's own office hours
    const fetchOwnOfficeHours = async () => {
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
      setOwnOfficeHours(officeHoursData);
    };

    fetchTAs();
    fetchOwnOfficeHours();

    return () => {
      unsubscribeChangeRequests();
    };
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to the home or login page
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  // Add TA by email
  const handleAddTA = async () => {
    if (!newTAEmail) {
      alert('Please enter the TA\'s email.');
      return;
    }

    try {
      // Add TA's email to authorized_emails collection
      await setDoc(doc(db, 'authorizedEmails', newTAEmail), {
        email: newTAEmail,
        instructorId: user?.uid,
        addTime: Timestamp.now(),
      });

      alert('TA added successfully. An invitation has been sent to the TA.');
      setNewTAEmail('');
    } catch (error) {
      console.error('Error adding TA:', error);
      alert('Failed to add TA. Please try again.');
    }
  };


  const handleRemoveTA = async (ta_id: string) => {
    if (!window.confirm('Are you sure you want to remove this TA?')) {
      return;
    }

    try {
      // Set the TA's active status to false
      await updateDoc(doc(db, 'users', ta_id), {
        active: false,
      });

      // Remove TA from the state
      setTAs(tas.filter((ta) => ta.userId !== ta_id));

      alert('TA removed successfully.');
    } catch (error) {
      console.error('Error removing TA:', error);
      alert('Failed to remove TA. Please try again.');
    }
  };


  // Fetch selected TA's office hours
  const fetchTAOfficeHours = async (ta_id: string) => {
    const officeHoursQuery = query(
      collection(db, 'officeHours'),
      where('userId', '==', ta_id),
      where('active', '==', true)
    );
    const querySnapshot = await getDocs(officeHoursQuery);
    const officeHoursData = querySnapshot.docs.map((doc) => ({
      ohId: doc.id,
      ...doc.data(),
    })) as OfficeHour[];
    setTAOfficeHours(officeHoursData);
  };

  // Add or Modify TA's Office Hours
  const handleAddTAOfficeHour = async () => {
    if (!selectedTA) {
      alert('Please select a TA.');
      return;
    }

    try {
      const newOfficeHourData = {
        userId: selectedTA.userId,
        dayOfWeek: newOfficeHour.dayOfWeek,
        startTime: newOfficeHour.startTime,
        endTime: newOfficeHour.endTime,
        location: newOfficeHour.location,
        active: true,
        createdBy: user?.uid,
        createTime: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'officeHours'), newOfficeHourData);

      setTAOfficeHours([...taOfficeHours, { ohId: docRef.id, ...newOfficeHourData }]);

      // Reset the form
      setNewOfficeHour({
        dayOfWeek: 0,
        startTime: '',
        endTime: '',
        location: '',
      });

      alert('Office hour added successfully.');
    } catch (error) {
      console.error('Error adding office hour:', error);
      alert('Failed to add office hour. Please try again.');
    }
  };

  const handleDeleteTAOfficeHour = async (ohId: string) => {
    if (!window.confirm('Are you sure you want to delete this office hour?')) {
      return;
    }
  
    try {
      // Delete the office hour document from Firestore
      await deleteDoc(doc(db, 'officeHours', ohId));
  
      // Remove the office hour from the state
      setTAOfficeHours(taOfficeHours.filter((oh) => oh.ohId !== ohId));
  
      alert('Office hour deleted successfully.');
    } catch (error) {
      console.error('Error deleting office hour:', error);
      alert('Failed to delete office hour. Please try again.');
    }
  };

  // Approve or Reject Change Request
  const handleProcessChangeRequest = async (request: ChangeRequest, approve: boolean) => {
    const responseNote = window.prompt('Enter a response note (optional):', '');

    try {
      // Update the change request status
      await updateDoc(doc(db, 'changeRequests', request.requestId), {
        status: approve ? 'approved' : 'rejected',
        processed_at: Timestamp.now(),
        response_note: responseNote || '',
      });

      if (approve) {
        // Create an override in ohOverrides
        const overrideData = {
          userId: request.ta_id,
          ohId: request.ohId,
          date: request.date,
          action: request.action,
          newDate: request.newDate || null,
          newStartTime: request.newStartTime || null,
          newEndTime: request.newEndTime || null,
          createTime: Timestamp.now(),
          approveBy: user?.uid,
          requestId: request.requestId,
        };

        await addDoc(collection(db, 'ohOverrides'), overrideData);
      }

      // Remove the request from the state
      setChangeRequests(changeRequests.filter((req) => req.requestId !== request.requestId));

      alert(`Request has been ${approve ? 'approved' : 'rejected'}.`);
    } catch (error) {
      console.error('Error processing change request:', error);
      alert('Failed to process the request. Please try again.');
    }
  };

  // Add Own Default Office Hours
  const handleAddOwnOfficeHour = async () => {
    try {
      // if (newOwnOfficeHour.dayOfWeek == 0 || newOwnOfficeHour.endTime == '' || newOwnOfficeHour.startTime == '' ||newOwnOfficeHour.location == '') {
      //   alert('Please fill in all required fields.');
      //   return;
      // }
      const newOfficeHourData = {
        userId: user!.uid, // Changed from user?.uid to user.uid
        dayOfWeek: newOwnOfficeHour.dayOfWeek,
        startTime: newOwnOfficeHour.startTime,
        endTime: newOwnOfficeHour.endTime,
        location: newOwnOfficeHour.location,
        active: true,
        createdBy: user!.uid, // Changed from user?.uid to user.uid
        createTime: Timestamp.now(),
      };
  
      const docRef = await addDoc(collection(db, 'officeHours'), newOfficeHourData);
  
      setOwnOfficeHours([
        ...ownOfficeHours,
        { ohId: docRef.id, ...newOfficeHourData },
      ]);
  
      // Reset the form
      setNewOwnOfficeHour({
        dayOfWeek: 0,
        startTime: '',
        endTime: '',
        location: '',
      });

      alert('Your office hour added successfully.');
    } catch (error) {
      console.error('Error adding your office hour:', error);
      alert('Failed to add your office hour. Please try again.');
    }
  };

  const handleDeleteOwnOfficeHour = async (ohId: string) => {
    if (!window.confirm('Are you sure you want to delete this office hour permanently?')) {
      return;
    }
  
    try {
      // Delete the office hour document from Firestore
      await deleteDoc(doc(db, 'officeHours', ohId));
  
      // Remove the office hour from the state
      setOwnOfficeHours(ownOfficeHours.filter((oh) => oh.ohId !== ohId));
  
      alert('Office hour deleted successfully.');
    } catch (error) {
      console.error('Error deleting office hour:', error);
      alert('Failed to delete office hour. Please try again.');
    }
  };
  
  
  const handleOverrideOwnOfficeHour = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!selectedOfficeHour) {
      alert('No office hour selected.');
      return;
    }
  
    if (!overrideDate || !overrideAction) {
      alert('Please fill in all required fields.');
      return;
    }
  
    try {
      const overrideData: any = {
        userId: user!.uid,
        ohId: selectedOfficeHour.ohId,
        date: overrideDate,
        action: overrideAction,
        created_at: Timestamp.now(),
        approved_by: user!.uid, // Since the instructor approves their own changes
      };
  
      if (overrideAction === 'change') {
        if (!newOverrideDate || !newOverrideStartTime || !newOverrideEndTime) {
          alert('Please provide new date and time for rescheduling.');
          return;
        }
        overrideData.new_date = newOverrideDate;
        overrideData.new_start_time = newOverrideStartTime;
        overrideData.new_end_time = newOverrideEndTime;
      }
  
      // Add the override to the 'ohOverrides' collection
      await addDoc(collection(db, 'ohOverrides'), overrideData);
  
      // Reset the form
      setSelectedOfficeHour(null);
      setOverrideDate('');
      setOverrideAction('change');
      setNewOverrideDate('');
      setNewOverrideStartTime('');
      setNewOverrideEndTime('');
  
      alert('Office hour override created successfully.');
    } catch (error) {
      console.error('Error creating override:', error);
      alert('Failed to create override. Please try again.');
    }
  };
  
  
  
  

  return (
    <div className="instructor-container">
      <header className="instructor-header">
        <h1>Instructor Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Log Out
        </button>
      </header>

      <section className="add-ta-section">
        <h2>Add TA</h2>
        <div className="form-group">
          <label>
            TA's Email:
            <input
              type="email"
              value={newTAEmail}
              onChange={(e) => setNewTAEmail(e.target.value)}
              required
            />
          </label>
        </div>
        <button onClick={handleAddTA} className="submit-button">
          Add TA
        </button>
      </section>

      <section className="manage-ta-section">
        <h2>Manage TAs</h2>
        <ul className="ta-list">
          {tas.map((ta) => (
            <li key={ta.userId}>
              {ta.fname} {ta.lname} ({ta.email})
              <button onClick={() => handleRemoveTA(ta.userId)} className="remove-button">
                Remove
              </button>
              <button
                onClick={() => {
                  setSelectedTA(ta);
                  fetchTAOfficeHours(ta.userId);
                }}
                className="manage-button"
              >
                Manage Office Hours
              </button>
            </li>
          ))}
        </ul>
      </section>

      {selectedTA && (
        <section className="ta-office-hours-section">
          <h2>
            {selectedTA.fname}'s Office Hours{' '}
            <button
              onClick={() => {
                setSelectedTA(null);
                setTAOfficeHours([]);
              }}
              className="close-button"
            >
              Close
            </button>
          </h2>

          <ul className="office-hours-list">
            {taOfficeHours.map((oh) => (
              <li key={oh.ohId}>
                <strong>{daysOfWeek[oh.dayOfWeek]}</strong> {oh.startTime} - {oh.endTime}{' '}
                {oh.location && `at ${oh.location}`}
                <button
                  onClick={() => handleDeleteTAOfficeHour(oh.ohId)}
                  className="delete-button"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>


          <h3>Add Office Hour for {selectedTA.fname}</h3>
          <div className="form-group">
            <label>
              Day of Week:
              <select
                value={newOfficeHour.dayOfWeek}
                onChange={(e) => setNewOfficeHour({ ...newOfficeHour, dayOfWeek: Number(e.target.value) })}
              >
                {daysOfWeek.map((day, index) => (
                  <option key={index} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-group">
            <label>
              Start Time:
              <input
                type="time"
                value={newOfficeHour.startTime}
                onChange={(e) => setNewOfficeHour({ ...newOfficeHour, startTime: e.target.value })}
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              End Time:
              <input
                type="time"
                value={newOfficeHour.endTime}
                onChange={(e) => setNewOfficeHour({ ...newOfficeHour, endTime: e.target.value })}
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Location:
              <input
                type="text"
                value={newOfficeHour.location}
                onChange={(e) => setNewOfficeHour({ ...newOfficeHour, location: e.target.value })}
                required
              />
            </label>
          </div>
          <button onClick={handleAddTAOfficeHour} className="submit-button">
            Add Office Hour
          </button>
        </section>
      )}

      <section className="change-requests-section">
        <h2>Pending Change Requests</h2>
        <table className="requests-table">
          <thead>
            <tr>
              <th>TA Name</th>
              <th>Office Hour</th>
              <th>Action</th>
              <th>Date</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {changeRequests.map((req) => (
              <tr key={req.requestId}>
                <td>{tas.find((ta) => ta.userId === req.ta_id)?.fname || 'TA'}</td>
                <td>{req.ohId}</td>
                <td>{req.action}</td>
                <td>{req.date}</td>
                <td>{req.note || 'N/A'}</td>
                <td>
                  <button onClick={() => handleProcessChangeRequest(req, true)} className="approve-button">
                    Approve
                  </button>
                  <button onClick={() => handleProcessChangeRequest(req, false)} className="reject-button">
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="own-office-hours-section">
      <h2>Your Default Office Hours</h2>
      <ul className="office-hours-list">
        {ownOfficeHours.map((oh) => (
          <li key={oh.ohId}>
            <strong>{daysOfWeek[oh.dayOfWeek]}</strong> {oh.startTime} - {oh.endTime}{' '}
            {oh.location && `at ${oh.location}`}
            <button
              onClick={() => handleDeleteOwnOfficeHour(oh.ohId)}
              className="delete-button"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setSelectedOfficeHour(oh);
                setOverrideDate(''); // Reset the override date
                setOverrideAction('change'); // Default action
                setNewOverrideDate(''); // Reset new date
                setNewOverrideStartTime('');
                setNewOverrideEndTime('');
              }}
              className="override-button"
            >
              Change/Cancel
            </button>
          </li>
        ))}
      </ul>
      {selectedOfficeHour && (
        <section className="override-form-section">
          <h3>
            Change/Cancel Office Hour on {daysOfWeek[selectedOfficeHour.dayOfWeek]} at{' '}
            {selectedOfficeHour.startTime} - {selectedOfficeHour.endTime}
          </h3>
          <form onSubmit={handleOverrideOwnOfficeHour} className="override-form">
            <div className="form-group">
              <label>
                Date of Office Hour to Override:
                <input
                  type="date"
                  value={overrideDate}
                  onChange={(e) => setOverrideDate(e.target.value)}
                  required
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Action:
                <select
                  value={overrideAction}
                  onChange={(e) => setOverrideAction(e.target.value as 'change' | 'cancel')}
                >
                  <option value="change">Reschedule</option>
                  <option value="cancel">Cancel</option>
                </select>
              </label>
            </div>
            {overrideAction === 'change' && (
              <>
                <div className="form-group">
                  <label>
                    New Date:
                    <input
                      type="date"
                      value={newOverrideDate}
                      onChange={(e) => setNewOverrideDate(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    New Start Time:
                    <input
                      type="time"
                      value={newOverrideStartTime}
                      onChange={(e) => setNewOverrideStartTime(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    New End Time:
                    <input
                      type="time"
                      value={newOverrideEndTime}
                      onChange={(e) => setNewOverrideEndTime(e.target.value)}
                      required
                    />
                  </label>
                </div>
              </>
            )}
            <button type="submit" className="submit-button">
              Submit
            </button>
            <button
              type="button"
              onClick={() => setSelectedOfficeHour(null)}
              className="close-button"
            >
              Cancel
            </button>
          </form>
        </section>
      )}



        <h3>Add Your Office Hour</h3>
        <div className="form-group">
          <label>
            Day of Week:
            <select
              value={newOwnOfficeHour.dayOfWeek}
              onChange={(e) => setNewOwnOfficeHour({ ...newOwnOfficeHour, dayOfWeek: Number(e.target.value) })}
            >
              {daysOfWeek.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-group">
          <label>
            Start Time:
            <input
              type="time"
              value={newOwnOfficeHour.startTime}
              onChange={(e) => setNewOwnOfficeHour({ ...newOwnOfficeHour, startTime: e.target.value })}
              required
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            End Time:
            <input
              type="time"
              value={newOwnOfficeHour.endTime}
              onChange={(e) => setNewOwnOfficeHour({ ...newOwnOfficeHour, endTime: e.target.value })}
              required
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Location:
            <input
              type="text"
              value={newOwnOfficeHour.location}
              onChange={(e) => setNewOwnOfficeHour({ ...newOwnOfficeHour, location: e.target.value })}
            />
          </label>
        </div>
        <button onClick={handleAddOwnOfficeHour} className="submit-button">
          Add Office Hour
        </button>
      </section>

      <section className="calendar-section">
        <h2>Your Office Hours Calendar</h2>
        <iframe
          src="https://calendar.google.com/calendar/embed?src=c_5402a26b28164d318527d4655119ac3ae212f331f32594e1634372420687502f%40group.calendar.google.com&ctz=America%2FChicago&mode=week"
          style={{ border: 0 }}
          width="800"
          height="600"
          frameBorder="0"
          scrolling="no"
          title="Office Hours Calendar"
        ></iframe>
      </section>
    </div>
  );
};

export default InstructorPage;
