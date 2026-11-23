export const UserRoleDisplay = ({ roles }: { roles: number[] }) => {
  if (!roles || roles.length === 0)
    return (
      <span className="text-xs px-2 py-1 rounded-full inline-block bg-orange-100 text-orange-700">
        بدون نقش
      </span>
    );

  const colorMap: Record<number, { bg: string; text: string }> = {
    1: { bg: "bg-red-100", text: "text-red-700" },
    2: { bg: "bg-blue-100", text: "text-blue-700" },
    3: { bg: "bg-green-100", text: "text-green-700" },
    4: { bg: "bg-gray-100", text: "text-gray-700" },
  };

  return (
    <>
      {roles.map((role:any) => {
        const colors = colorMap[role.id] ?? { bg: "bg-orange-100", text: "text-orange-700" };
        return (
          <span
            key={role.id}
            className={` text-xs mx-1 px-2 py-1 rounded-full inline-block ${colors.bg} ${colors.text}`}
          >
            {role.role_description || "بدون نقش"}
          </span>
        );
      })}
    </>
  );
};




export const CourseUserRoleDisplay = (role: number) => {
  switch (role) {
    case 0:
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
          مدرس
        </span>
      );
    case 1:
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-sky-100 text-sky-700">
          هنرجو
        </span>
      );
    default:
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
          نامشخص
        </span>
      );
  }
};
