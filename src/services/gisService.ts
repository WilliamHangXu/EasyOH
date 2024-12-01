export const initializeGisClient = (
    clientId: string,
    scope: string,
    onTokenCallback: (response: any) => void
  ) => {
    return (window as any).google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope,
      callback: onTokenCallback,
    });
  };
  