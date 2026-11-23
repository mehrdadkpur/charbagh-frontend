
const status: Record<number, string> = {
  0: "Active",
  1: "Inactive",
  2: "Pending",
  3: "Suspended",
};

const instrumentType: Record<number , string> ={
  0: "String",
  1: "Keyboard",
  2: "Wind",
  3: "Percussion",
  10: "Other"
}

const Origin: Record<number , string> ={
  0: "Westren",
  1: "Eastren",
  2: "Persian",
  10: "Other"
}

const Gender: Record<number , string> ={
  0: "Female",
  1: "Male",
  2: "Other",
  3: "Unknown"
}

const Category: Record<number , string> ={
  0: "None",
  1: "Classical",
  2: "Pop",
  3: "Traditional",
  4:  "Training",
  5: "Training",
  10: "Other"
}

export const getStatusDisplayText = (status:number) => {
    switch (status) {
      case status = 1:
        return 'مشاوره شد';
      case status = 2:
        return 'در انتظار';
      default:
        return status;
    }
  };

export const getInstrumentType = (type : number)=>{
  switch (type) {
    case type = 0:
      return 'زهی';
    case type = 1:
      return 'کیبورد';
    case type = 2:
      return 'بادی';
    case type = 3:
      return 'کوبه ای';
    case type = 4:
      return 'الکتریکی';
    case type = 10:
      return 'سایر';
    default:
      return type;
  }
}