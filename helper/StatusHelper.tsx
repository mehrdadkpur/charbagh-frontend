export const StatusHelper = (status: number) => {
  switch (status) {
    case 0:
      return (
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
          در انتظار تایید
        </div>
      );
    case 1:
      return (
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
          در حال برگزاری
        </div>
      );
      case 2:
        return (
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
            معلق
          </div>
        );
    case 3:
      return (
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
          غیرفعال
        </div>
      );
    default:
      return <div>-</div>;
  }
};
export const BlogStatusHelper = (status: number) => {
  switch (status) {
    case 0:
      return (
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
          در انتظار تایید
        </div>
      );
    case 1:
      return (
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
          منتشر شده
        </div>
      );
      case 2:
        return (
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
            معلق
          </div>
        );
    case 3:
      return (
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
          غیرفعال
        </div>
      );
    default:
      return <div>-</div>;
  }
};

export const InstrumentStatusHelper = (isActive: boolean) => {
  switch (isActive) {
    case true:
      return (
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
         فعال
        </div>
      );
      case false:
        return (
          <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
          غیرفعال
        </div>
      );
  }
};