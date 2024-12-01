export const initializeGapiClient = async (
  apiKey: string,
  discoveryDocs: string[]
) => {
  await (window as any).gapi.client.init({
    apiKey,
    discoveryDocs,
  });
};

export const listCalendars = async (): Promise<any[]> => {
  const response = await (
    window as any
  ).gapi.client.calendar.calendarList.list();
  return response.result.items;
};

export const listEvents = async (
  calendarId: string,
  maxResults = 10
): Promise<any[]> => {
  const response = await (window as any).gapi.client.calendar.events.list({
    calendarId,
    timeMin: new Date().toISOString(),
    showDeleted: false,
    singleEvents: true,
    maxResults,
    orderBy: "startTime",
  });
  return response.result.items;
};

export const addEvent = async (
  calendarId: string,
  event: any
): Promise<any> => {
  const response = await (window as any).gapi.client.calendar.events.insert({
    calendarId,
    resource: event,
  });
  return response.result;
};
