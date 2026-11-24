
export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  nationalIdentificationNumber: string;
  email: string;
  birthDate: string;
  gender: 0| 1 | 2 | 3;
  address: string;
  bio: string;
  profileImageUrl: string;
  fullName: string;
  status: 0 | 1 | 2 | 3;
  createdAt: string;
  nationality:{
    id:string;
    englishCountryName: string;
    persianCountryName : string

  }
}

export interface IRole{
  id: string;
  name:string;
  displayName: string;
  description:string;
  isActive:boolean;
  isSystem: boolean;
}

export interface IPermission{
  id: string;
  module:string;
  name: string;
  action:number;
  displayName:string;
  description: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt : Date;
}


  export interface IBlog {
    id:string;
    title: string;
    text: string;
    firstName:string;
    lastName:string;
    imageUrl: string;
    userId: string;
    author:IUser;
    status:number
    createdAt:string;
    updatedAt: string;
  }


  export interface ICourse {
      id: string; 
      course_name: string;
      course_img: string;
      course_description: string;
      status: number;
      teacher:IUser;
      teacherId:string;
      books:IBook[];
      instrumentId:string;
      students:IUser[];
      start_course_date:string;
      courseUserRole:null| number;
    };
  
  export interface IComment{
    id: string;
    comment_text:string;
    comment_date: string;
    status:number;
    user:IUser;
  }

  export interface IPhoto {
    id: string
    photo_title: string
    photo_url: string
    photo_date?: string
    photo_description: string
    category: number  
  }

  export interface IVideo {
    id: string
    video_url: string
    video_title: string
    video_date?: string
    video_description: string
    category: any
}


export interface Instrument {
  id: string;
  instrumentCategoryId: string;
  name: string;
  englishName:string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  isActive:boolean
}


  export interface IBook {
    id:string;
    book_name:string;
    book_description:string;
    book_img: string;
    courseId:string;
    songs:ISong[];
  }

  export interface ISong {
    id:string
    song_title:string
    song_artist:string
    song_file_url:string
    bookId: string
  }
  
export interface IContact {
  id: string;
  fullName: string;
  mobile: string;
  status: 0 | 1 | 2 | 3;
  createdAt : Date;
  updatedAt: Date; 
}

export interface IStats {
  totalUsers: number
  totalTeachers: number
  totalStudents: number
  totalStaffs:number
  totalBranches: number
  totalBlogs: number
  totalBooks: number
  totalInstruments: number
}

export interface WizardData {
  instrument: Instrument;
  course: ICourse;
  books: IBook[];
}

export interface ITeacher {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  profileImageUrl: string | null;
  personnelCode: string;
  employmentDate: string;
  education: number;
  experienceYears: number | null;
  biography: string | null;
  status: number;
}

export interface IStudent {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  nationalIdentificationNumber: string;
  birthDate: string | null;
  email: string | null;
  profileImageUrl: string | null;
  studentCode: string;
  registrationDate: string;
  status: number;
  biography: string | null;
}

export interface IStudentParentDetails {
  id: string;
  parentId: string;
  relationship: number;
  firstName: string;
  lastName: string;
  nationalIdentificationNumber: string | null;
  mobile: string | null;
  profileImageUrl: string | null;
  email: string | null;
}

export interface IStudentDetails extends IStudent {
  mobile: string;
  gender: number;
  address: string | null;
  nationality: string | null;
  parents: IStudentParentDetails[];
}

export interface IStaff {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  profileImageUrl: string | null;
  personnelCode: string;
  employmentDate: string;
  terminationDate: string; 
  employmentType: number;
  status: number;
  bio: string;
}

export interface IParent {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  nationalIdentificationNumber: string;
  email: string | null;
  profileImageUrl: string | null;
  status: number;
  bio: string | null;
}

export interface IParentStudentDetails {
  studentId: string;
  firstName: string;
  lastName: string;
  studentCode: string;
  birthDate: string | null;
  profileImageUrl: string | null;
  status: number;
  relationship: number;
}

export interface IParentDetails extends IParent {
  children: IParentStudentDetails[];
}

export interface ICreateTeacherRequest {
  userId: string;
  employmentDate: string;
}

export interface ICreateStudentRequest {
  userId: string;
  registrationDate: string;
}

export interface ICreateStaffRequest {
  userId: string;
  employmentDate: string;
  employmentType:number;
}
export interface ICreateParentRequest {
  userId: string;
}


export interface IUserRoleDetails {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
  assignedAt: string;
}

export interface IUserBranchDetails {
  id: string;
  branchId: string;
  branchName: string;
  branchCode: string | null;
  isDefault: boolean;
  isActive: boolean;
  assignedAt: string;
  roles: IUserRoleDetails[];
}

export interface IUserProfileDetails {
  id: string;
  code: string;
  status: number;
  secondaryCode?: string | null;
}

export type IUserDetailsBase = Omit<IUser, "email" | "birthDate" | "address" | "bio" | "profileImageUrl" | "nationality"> & {
  email: string | null;
  birthDate: string | null;
  address: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  nationality: IUser["nationality"] | null;
};

export interface IUserDetails {
  user: IUserDetailsBase;
  mobileConfirmed: boolean;
  emailConfirmed: boolean;
  lastLoginAt: string | null;
  student: IUserProfileDetails | null;
  teacher: IUserProfileDetails | null;
  parent: IUserProfileDetails | null;
  staff: IUserProfileDetails | null;
  branches: IUserBranchDetails[];
}
