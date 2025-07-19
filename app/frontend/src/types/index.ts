export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: number;
  user_id: number;
  bio: string;
  location: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  connections?: any[];
  mutualConnections?: any[];
  activity?: any;
  social?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

export interface Experience {
  id: number;
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  read: boolean;
} 