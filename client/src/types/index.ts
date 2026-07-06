export interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description: string | null;
  photoUrl: string | null;
  pricePerHour: number | null;
  pricePerDay: number | null;
  amenities: string | null;
  _count?: { sessions: number };
  sessions?: Session[];
}

export interface PersonSummary {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
}

export interface Session {
  id: string;
  title: string;
  topic: string;
  description: string | null;
  startsAt: string;
  maxParticipants: number | null;
  customLocation: string | null;
  place: Place | null;
  creator: PersonSummary;
  participants: PersonSummary[];
  participantsCount: number;
  isJoined: boolean;
  isMine: boolean;
}

export interface BookingRequest {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  peopleCount: number;
  comment: string | null;
  status: string;
  place: Place;
}
