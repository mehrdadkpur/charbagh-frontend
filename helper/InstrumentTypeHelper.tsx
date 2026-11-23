export const TypeHelper = (type: number) => {
  switch (type) {
    case 0:
      return (
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
            زهی
        </div>
      );
    case 1:
      return (
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
          صفحه کلید
        </div>
      );
      case 2:
        return (
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
            بادی
          </div>
        );
    case 3:
      return (
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
          کوبه ای
        </div>
      );
      case 4:
        return (
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
          الکتریکی
          </div>
        );
      case 10:
      return (
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
           سایر
        </div>
      );
    default:
      return <div>-</div>;
  }
};
export const OriginHelper = (status: number) => {
  switch (status) {
    case 0:
      return (
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
          غربی  
        </div>
      );
    case 1:
      return (
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
           شرقی
        </div>
      );
      case 2:
        return (
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
            ایرانی
          </div>
        );
    case 10:
      return (
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
          سایر
        </div>
      );
    default:
      return <div>-</div>;
  }
};