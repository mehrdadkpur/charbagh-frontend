export const getUserGender = (gender : number) => {
    switch (gender) {
      case gender = 0:
        return 'خانم';
      case gender = 1:
        return 'آقا';
        case gender = 2:
            return 'سایر';
        case gender = 3:
            return 'نامشخص'
      default:
        return gender;
    }
  };