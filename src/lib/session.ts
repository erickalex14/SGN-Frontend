export type Session = {
  accessToken: string;
  expiresAt: string;
  operatorId: string;
  userName: string;
  affiliation: string;
  jobRole: string;
  accessProfile: string | null;
  serviceCenterId: string | null;
  branchIds: string[];
};

const key = "sgn.session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;

  try {
    const session = JSON.parse(localStorage.getItem(key) ?? "null") as Session | null;
    if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(key);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function saveSession(session: Session) {
  localStorage.setItem(key, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(key);
}

export function getAccessToken() {
  return getSession()?.accessToken;
}
