import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  FormProps,
  Input,
  message,
  Modal,
  Space,
  TimePicker,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { useCallback, useEffect, useState } from "react";
import { EventType } from "../Calender/Calender";
import { createEvent, updateEvent } from "./util";

// Extend Day.js with the UTC plugin
dayjs.extend(utc);

export type FieldType = {
  title: string;
  description: string;
  date: Dayjs;
  timeRange: [Dayjs, Dayjs];
  media?: { file?: UploadFile; fileList: UploadFile[] };
};

const getDisabledTime = () => {
  const now = dayjs();

  return {
    disabledHours: () => {
      const hours = [];
      for (let i = 0; i < now.hour(); i++) {
        hours.push(i);
      }
      return hours;
    },
    disabledMinutes: (selectedHour: number) => {
      if (selectedHour === now.hour()) {
        const minutes = [];
        for (let i = 0; i < now.minute(); i++) {
          minutes.push(i);
        }
        return minutes;
      }
      return [];
    },
  };
};

const Event = ({
  isModalOpen,
  onCancel,
  editingEventId,
}: {
  isModalOpen: boolean;
  onCancel: () => void;
  editingEventId?: string;
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialFormData, setInitialFormData] = useState<
    FormData | undefined
  >();
  const { disabledHours, disabledMinutes } = getDisabledTime();

  const resetState = () => {
    setFileList([]);
    setInitialFormData(undefined);
    form.resetFields();
    onCancel();
  };

  const fetchEventById = useCallback(async () => {
    if (!editingEventId) return;
    setLoading(true);
    try {
      const { data } = await axios.get<EventType>(
        process.env.REACT_APP_BACKEND_URL + `/event/${editingEventId}`
      );

      const fileList = data.media.map((file) => ({
        uid: file.id,
        name: file.mediaUrl.split("/").pop() ?? file.id,
        url: file.mediaUrl,
      }));

      setFileList(fileList);
      form.setFieldsValue({
        title: data.title,
        description: data.description,
        date: dayjs(data.startTime),
        timeRange: [dayjs(data.startTime), dayjs(data.endTime)],
        media: {
          fileList,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
        return;
      }
      message.error("Unable to fetch event details! Please try again.");
    } finally {
      setLoading(false);
    }
  }, [form, editingEventId]);

  useEffect(() => {
    fetchEventById();
  }, [fetchEventById, editingEventId]);

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList.map((file) => ({ ...file, status: "done" })));

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    let response;
    setLoading(true);
    if (editingEventId) {
      response = await updateEvent(values, editingEventId);
    } else {
      response = await createEvent(values);
    }
    setLoading(false);
    resetState();
    if (response.success) {
      message.success(response.message);
    } else {
      message.error(response.message);
    }
  };

  const deleteEvent = async () => {
    try {
      await axios.delete(
        process.env.REACT_APP_BACKEND_URL + `/event/${editingEventId}`
      );
      message.success("Event deleted successfully!");
      resetState();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
        return;
      }
      message.error("Failed to delete event! Please try again.");
    }
  };

  return (
    <Modal
      title="Calender Event"
      open={isModalOpen}
      footer={null}
      destroyOnClose
      onCancel={onCancel}
      afterClose={() => resetState()}
    >
      <Form
        form={form}
        name="basic"
        initialValues={initialFormData}
        layout="vertical"
        onFinish={onFinish}
        disabled={loading}
      >
        <Form.Item<FieldType>
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please enter event title" }]}
        >
          <Input maxLength={20} />
        </Form.Item>

        <Form.Item<FieldType>
          label="Description"
          name="description"
          rules={[
            { required: true, message: "Please enter event description" },
          ]}
        >
          <Input.TextArea autoSize={false} maxLength={1000} />
        </Form.Item>

        <Space>
          <Form.Item<FieldType>
            label="Select Date"
            name="date"
            rules={[{ required: true, message: "Please enter date" }]}
          >
            <DatePicker minDate={dayjs()} />
          </Form.Item>
          <Form.Item<FieldType>
            label="Select Time"
            name="timeRange"
            rules={[{ required: true, message: "Please enter time range" }]}
          >
            <TimePicker.RangePicker
              showSecond={false}
              disabledTime={() => ({
                disabledHours,
                disabledMinutes,
              })}
            />
          </Form.Item>
        </Space>

        <Form.Item<FieldType> label="Upload Image" name="media">
          <Upload
            accept="image/jpeg,image/jpg,image/png,video/mp4"
            listType="picture-card"
            fileList={fileList}
            onChange={handleChange}
          >
            {fileList.length >= 8 ? null : (
              <button style={{ border: 0, background: "none" }} type="button">
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </button>
            )}
          </Upload>
        </Form.Item>

        <Space>
          {!!editingEventId && (
            <Form.Item<FieldType>>
              <Button
                onClick={deleteEvent}
                disabled={loading}
                danger
                type="default"
                htmlType="button"
              >
                Delete
              </Button>
            </Form.Item>
          )}
          <Form.Item<FieldType>>
            <Button loading={loading} type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
};

export default Event;
