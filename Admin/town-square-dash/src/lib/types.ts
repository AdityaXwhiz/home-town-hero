export type CaseStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';

export interface Case {
  id: number;
  title: string;
  description: string;
  date: string;
  potholeSize: 'Small' | 'Large';
  imageUrl?: string;
  status: CaseStatus;
}