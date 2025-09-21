// In src/components/CaseCard.tsx
// ✅ THIS FILE IS ALREADY CORRECT. No changes were needed.
import React from 'react';

// Assuming these types are defined in a central types file
type CaseStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
interface Case {
  id: number;
  title: string;
  status: CaseStatus;
  description: string;
  date: string;
  potholeSize?: string; // Optional property
  imageUrl?: string; // Optional property
}

// Props definition for the component
interface CaseCardProps {
  caseData: Case;
  onStatusChange: (id: number, newStatus: CaseStatus) => void;
}

// A helper object to map status to colors for the badge
const statusStyles: { [key in CaseStatus]: string } = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
  Resolved: 'bg-green-100 text-green-800 border-green-300',
  Rejected: 'bg-red-100 text-red-800 border-red-300',
};

const CaseCard = ({ caseData, onStatusChange }: CaseCardProps) => {
  
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as CaseStatus;
    onStatusChange(caseData.id, newStatus);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold text-gray-800">{caseData.title}</h2>
        <span
          className={`px-3 py-1 text-sm font-medium rounded-full border ${statusStyles[caseData.status]}`}
        >
          {caseData.status}
        </span>
      </div>

      <div className="mt-4 text-gray-600">
        <p>{caseData.description}</p>
        <div className="text-sm text-gray-500 mt-2">
          <span>{caseData.date}</span> | <span>View on Map</span>
        </div>
        <p className="mt-1">
          <span className="font-semibold">Pothole Size:</span> {caseData.potholeSize}
        </p>
      </div>

      {caseData.imageUrl && (
        <div className="mt-4">
          <p className="font-semibold text-gray-700">Attached Images:</p>
          <img src={caseData.imageUrl} alt="Pothole" className="mt-2 rounded-md max-w-xs border" />
        </div>
      )}

      <div className="mt-6 flex items-center justify-end space-x-3">
        {caseData.status === 'Pending' && (
           <button 
             onClick={() => onStatusChange(caseData.id, 'In Progress')}
             className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
           >
             Mark In Progress
           </button>
        )}
        {caseData.status === 'In Progress' && (
           <button 
             onClick={() => onStatusChange(caseData.id, 'Resolved')}
             className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
           >
             Mark as Resolved
           </button>
        )}
        
        <div>
          <label htmlFor={`status-select-${caseData.id}`} className="sr-only">Update Status</label>
          <select 
            id={`status-select-${caseData.id}`}
            value={caseData.status}
            onChange={handleDropdownChange}
            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CaseCard;