
const status: Record<number, string> = {
  0: "Active",
  1: "Inactive",
  2: "Pending",
  3: "Suspended",
};

export const getStatusDisplayText = (status:number) => {
    switch (status) {
      case status = 1:
        return 'مشاوره شد';
      case status = 0:
        return 'در انتظار مشاوره';
      default:
        return status;
    }
  };