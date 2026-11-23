import { FaClock, FaCheckCircle, FaPauseCircle } from "react-icons/fa";

type StatusType = 0 | 1 | 2 | 3;

const statusOptions: {
  value: StatusType;
  label: string;
  icon: JSX.Element;
}[] = [
  { value: 0, label: "در انتظار تایید", icon: <FaClock /> },
  { value: 1, label: "تایید شده", icon: <FaCheckCircle /> },
  { value: 2, label: "معلق", icon: <FaPauseCircle /> },
  { value: 3, label: "غیرفعال", icon: <FaPauseCircle /> },
];

const colorMap: Record<StatusType, string> = {
  0: "bg-blue-100 border-blue-500 text-blue-700",
  1: "bg-green-100 border-green-500 text-green-700",
  2: "bg-yellow-100 border-yellow-500 text-yellow-700",
  3: "bg-red-100 border-red-500 text-red-700",
};

export const StatusChanger = ({
  status,
  onChange,
}: {
  status: number;
  onChange: (newStatus: number) => void;
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {statusOptions.map((opt) => {
        const active = status === opt.value;

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
              ${active
                ? colorMap[opt.value]
                : "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
          >
            <span className="text-lg">{opt.icon}</span>
            <span className="text-sm font-medium">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
