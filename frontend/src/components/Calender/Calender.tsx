import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventContentArg } from "@fullcalendar/core";
import { useCallback, useEffect, useState } from "react";
import { getToken } from "firebase/messaging";
import Event from "../Event/Event";
import axios from "axios";
import { Checkbox, Col, Collapse, Input, message, Row, Spin } from "antd";
import "./Calender.css";
import { messaging, onMessageListener } from "../../firebase";

enum MediaType {
  image = "image",
  video = "video",
}

type Media = {
  id: string;
  type: MediaType;
  mediaUrl: string;
};

enum EventStatus {
  Scheduled = "Scheduled",
  Ongoing = "Ongoing",
  Completed = "Completed",
}

export type EventType = {
  id: string;
  title: string;
  description: string;
  status: EventStatus;
  startTime: string;
  endTime: string;
  media: Media[];
};

type CalenderItem = {
  id: string;
  title: string;
  desc: string;
  start: string;
  end: string;
  media: Media[];
};

navigator.serviceWorker
  .register("/firebase-messaging-sw.js")
  .then((registration) => {
    console.log("Service Worker registered with scope:", registration.scope);
  })
  .catch((error) => {
    console.error("Service Worker registration failed:", error);
  });

const Calender = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<CalenderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string>();
  const [searchText, setSearchText] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<EventStatus[]>([
    EventStatus.Completed,
    EventStatus.Ongoing,
    EventStatus.Scheduled,
  ]);

  async function requestPermission() {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPIDKEY,
      });
      console.log(token);
      try {
        await axios.post(process.env.REACT_APP_BACKEND_URL + "/notification", {
          token,
        });
      } catch (error) {
        if (error instanceof Error) {
          message.error(error.message);
          return;
        }
        message.error("Failed to add token! Please try again.");
      }
    } else if (permission === "denied") {
      alert("You denied notifications permission");
    }
  }

  useEffect(() => {
    requestPermission();
  }, []);

  onMessageListener()
    .then((payload: any) => {
      message.success(payload?.data?.title);
    })
    .catch((err) => console.log("failed: ", err));

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<EventType[]>(
        process.env.REACT_APP_BACKEND_URL + "/event",
        {
          params: {
            contains: searchText === "" ? undefined : searchText,
            statuses: selectedFilters,
          },
        }
      );

      const formattedEvents = data.map((event) => ({
        id: event.id,
        title: event.title,
        desc: event.description,
        start: event.startTime,
        end: event.endTime,
        media: event.media,
      }));
      setEvents(formattedEvents);
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
        return;
      }
      message.error("Failed to fetch events! Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchText, selectedFilters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, searchText]);

  const renderEventContent = (
    eventContent: EventContentArg & {
      event: {
        _def: {
          extendedProps: (typeof events)[number];
        };
      };
    }
  ) => {
    const event = {
      id: eventContent.event.id,
      title: eventContent.event._def.title,
      desc: eventContent.event._def.extendedProps.desc,
      start: eventContent.event.start,
      end: eventContent.event.end,
    };

    return (
      <div
        className="calenderItem"
        onClick={() => {
          setEditingEventId(event.id);
          setIsModalOpen(true);
        }}
      >
        <h5 className="calenderItem">{event.title}</h5>
        {event.start !== null && (
          <h6 className="eventTime">
            {new Date(event.start).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </h6>
        )}
      </div>
    );
  };

  const filterCheckboxValue = (value: EventStatus) => {
    return !!selectedFilters.find((filter) => filter === value);
  };

  const updateSelectedFilters = (value: EventStatus, checked: boolean) => {
    if (checked) {
      setSelectedFilters((prev) => Array.from(new Set([...prev, value])));
    } else {
      setSelectedFilters((prev) => prev.filter((item) => item !== value));
    }
  };

  return (
    <Row gutter={[12, 12]} className="calenderContainer">
      <Col md={24} lg={4} className="actionContainer">
        <Input.Search
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Collapse
          defaultActiveKey={["1"]}
          items={[
            {
              key: "1",
              label: "Filter",
              children: (
                <div className="collapseContainer">
                  <Checkbox
                    checked={filterCheckboxValue(EventStatus.Scheduled)}
                    onChange={(e) =>
                      updateSelectedFilters(
                        EventStatus.Scheduled,
                        e.target.checked
                      )
                    }
                  >
                    Scheduled
                  </Checkbox>
                  <Checkbox
                    checked={filterCheckboxValue(EventStatus.Ongoing)}
                    onChange={(e) =>
                      updateSelectedFilters(
                        EventStatus.Ongoing,
                        e.target.checked
                      )
                    }
                  >
                    Ongoing
                  </Checkbox>
                  <Checkbox
                    checked={filterCheckboxValue(EventStatus.Completed)}
                    onChange={(e) =>
                      updateSelectedFilters(
                        EventStatus.Completed,
                        e.target.checked
                      )
                    }
                  >
                    Completed
                  </Checkbox>
                </div>
              ),
            },
          ]}
        />
      </Col>
      <Col md={24} lg={20}>
        <Spin spinning={loading}>
          <Fullcalendar
            events={events}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={"dayGridMonth"}
            customButtons={{
              search: {
                text: "Search",
              },
              filter: {
                text: "Filter",
              },
            }}
            headerToolbar={{
              start: "search",
              center: "prev,title,next",
              end: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            height={"90vh"}
            dateClick={() => {
              setEditingEventId(undefined);
              setIsModalOpen(true);
            }}
            eventContent={renderEventContent}
          />
        </Spin>
      </Col>
      <Event
        isModalOpen={isModalOpen}
        onCancel={() => {
          fetchEvents();
          setIsModalOpen(false);
          setEditingEventId(undefined);
        }}
        editingEventId={editingEventId}
      />
    </Row>
  );
};

export default Calender;
