import dayjs from "dayjs";
import { FieldType } from "./Event";
import axios from "axios";

export const generateFormData = (values: FieldType) => {
  const formData = new FormData();

  formData.append("title", values.title);
  formData.append("description", values.description);
  const date = dayjs(values.date).format("YYYY-MM-DD");
  const time = values.timeRange.map((t) =>
    dayjs(t).utc().format("HH:mm:ss.SSS")
  );
  formData.append("startTime", `${date}T${time[0]}Z`);
  formData.append("endTime", `${date}T${time[1]}Z`);
  values.media?.fileList.forEach((file) => {
    if (!file.originFileObj) {
      formData.append("mediaIds", file.uid);
    } else {
      formData.append("media", file.originFileObj as Blob);
    }
  });
  return formData;
};

export const createEvent = async (values: FieldType) => {
  const formData = generateFormData(values);
  try {
    await axios.post(process.env.REACT_APP_BACKEND_URL + "/event", formData);
    return { success: true, message: "Event Created Successfully" };
  } catch {
    return { success: false, message: "Failed to create event" };
  }
};

export const updateEvent = async (values: FieldType, id: string) => {
  const formData = generateFormData(values);
  try {
    await axios.patch(
      process.env.REACT_APP_BACKEND_URL + `/event/${id}`,
      formData
    );
    return { success: true, message: "Event Updated Sucessfully" };
  } catch {
    return { success: false, message: "Failed to Update Event" };
  }
};
