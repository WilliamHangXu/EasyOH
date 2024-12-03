import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { EventApi, EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import { getFirestore, collection, getDocs, count } from "firebase/firestore";
import { Modal, Button } from "antd";
import { EventInput } from "@fullcalendar/core";
import OfficeHour from "../models/OfficeHour";

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<EventInput[]>([]); // FullCalendar's event type
  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null); // Selected event from FullCalendar
  const [showModal, setShowModal] = useState(false); // Modal visibility

  // successful data model!!
  // const dummyEvents = [
  //   {
  //     id: "1asadjw",
  //     title: "Office Hour by John Doe",
  //     start: "2024-11-30T23:00:00Z",
  //     end: "2024-12-01T02:00:00Z",
  //     extendedProps: {
  //       location: "FGH 201",
  //       createdBy: "John Doe",
  //       createdAt: "2024-12-01T09:00:00",
  //     },
  //   },
  // ];

  const workedRecurringEvent = {
    id: "JaoT2cOfULfPrJuS1VWSBjGljIZZ",
    title: "Office Hour by ins1@test.edu",
    rrule:
      "FREQ=WEEKLY;BYDAY=TU,TH;DTSTART=20241201T030000Z;UNTIL=20250101T030000Z", // Define recurrence
    duration: "02:00", // Event duration: 2 hours
    extendedProps: {
      location: "FGH 201",
      createdBy: "ins1@test.edu",
      createdAt: "2024-12-01T20:34:08Z",
    },
  };

  const dummyRecurringEvents = [
    {
      id: "JaoT2cOf",
      title: "Office Hour by",
      exdate: ["2024-12-02"],
      rrule: {
        freq: "weekly",
        byweekday: ["tu", "mo"],
        dtstart: "2024-12-01T03:00:00Z",
        until: "2025-01-01T03:00:00Z",
        count: 5,
        tzid: "GMT",
      },
      extendedProps: {
        location: "hi",
        createdBy: "mom",
        createdAt: "asdf",
      },
    },
  ];

  const mapOfficeHourToEventInput = (officeHour: OfficeHour): EventInput => {
    if (officeHour.isRecurring) {
      // Recurring Event
      return {
        id: officeHour.userId,
        title: `Office Hour by ${officeHour.createdBy}`,
        tzid: "GMT",
        // rrule: {
        //   freq: "weekly",
        //   // byweekday: [officeHour?.dayOfWeek],
        //   dtstart: "2024-12-01T03:00:00Z",
        //   until: "2025-01-01T03:00:00Z",
        //   count: 5,
        //   // exdate: [officeHour.exceptions],
        // },
        extendedProps: {
          location: officeHour.location,
          createdBy: officeHour.createdBy,
          createdAt: officeHour.createdAt,
        },
        startTime: officeHour.startTime,
        endTime: officeHour.endTime,
        daysOfWeek: [officeHour.dayOfWeek],
      };
    } else {
      // One-Time Event
      if (!officeHour?.tmpDate) {
        throw new Error("Invalid input: tmpDate or startTime is missing");
      }
      const datePart = officeHour?.tmpDate.split("T")[0];

      const adjustToUTCMinus6 = (date: string, time: string): string => {
        const utcDate = new Date(`${date}T${time}:00Z`);
        const localDate = new Date(utcDate.getTime() + 6 * 60 * 60 * 1000); // Subtract 6 hours
        return localDate.toISOString().replace(".000Z", "Z"); // Format to ISO string
      };

      const start = adjustToUTCMinus6(datePart, officeHour.startTime);
      const end = adjustToUTCMinus6(datePart, officeHour.endTime);

      return {
        id: officeHour.userId,
        title: `Office Hour by ${officeHour.createdBy}`,
        start: start,
        end: end,
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
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          rrulePlugin,
        ]}
        initialView="timeGridWeek"
        events={events}
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
