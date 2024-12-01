import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { EventApi, EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Modal, Button } from "antd";
import { EventInput } from "@fullcalendar/core";
import OfficeHour from "../models/OfficeHour";

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<EventInput[]>([]); // FullCalendar's event type
  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null); // Selected event from FullCalendar
  const [showModal, setShowModal] = useState(false); // Modal visibility

  const mapOfficeHourToEventInput = (officeHour: OfficeHour): EventInput => {
    if (officeHour.isRecurring) {
      // Recurring Event
      return {
        id: officeHour.userId,
        title: `Office Hour by ${officeHour.createdBy}`,
        rrule: officeHour.recurrenceRule, // Recurrence rule for FullCalendar's rrule plugin
        exdate: officeHour.exceptions, // Exception dates for recurring events
        extendedProps: {
          location: officeHour.location,
          createdBy: officeHour.createdBy,
          createdAt: officeHour.createdAt,
        },
      };
    } else {
      // One-Time Event
      return {
        id: officeHour.userId,
        title: `Office Hour by ${officeHour.createdBy}`,
        start: officeHour.startTime, // Start date-time in ISO format
        end: officeHour.endTime, // End date-time in ISO format
        extendedProps: {
          location: officeHour.location,
          createdBy: officeHour.createdBy,
          createdAt: officeHour.createdAt,
        },
      };
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      const db = getFirestore();
      const officeHoursCollection = collection(db, "officeHours");
      const snapshot = await getDocs(officeHoursCollection);
      const eventData: EventInput[] = snapshot.docs.map((doc) =>
        mapOfficeHourToEventInput(doc.data() as OfficeHour)
      );
      setEvents(eventData);
    };

    fetchEvents();
  }, []);

  const handleEventClick = (info: EventClickArg) => {
    setSelectedEvent(info.event); // Correctly set selected event
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={events} // FullCalendar-compatible events
        eventClick={handleEventClick}
      />

      {selectedEvent && (
        <Modal
          title="Event Details"
          open={showModal}
          onCancel={closeModal}
          footer={[
            <Button key="close" onClick={closeModal}>
              Close
            </Button>,
          ]}
        >
          <p>
            <strong>Title:</strong> {selectedEvent.title}
          </p>
          <p>
            <strong>Start Time:</strong> {selectedEvent.start?.toISOString()}
          </p>
          <p>
            <strong>End Time:</strong> {selectedEvent.end?.toISOString()}
          </p>
          <p>
            <strong>Location:</strong>{" "}
            {selectedEvent.extendedProps.location || "FGH 201"}
          </p>
          <p>
            <strong>Created By:</strong> {selectedEvent.extendedProps.createdBy}
          </p>
          <p>
            <strong>Created At:</strong> {selectedEvent.extendedProps.createdAt}
          </p>
        </Modal>
      )}
    </div>
  );
};

export default Calendar;
