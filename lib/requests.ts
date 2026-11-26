import type { IUserDetails } from "@/lib/types";
import { ApiError } from "@/helper/ApiError";
import { apiFetch } from "@/lib/apiFetch";


const apiDomain = (process.env.NEXT_PUBLIC_API_URL || "https://localhost:7003").replace(/\/+$/, "");

function unwrapCollection<T>(data: any): T[] {
  const value = data?.$values ?? data;
  return Array.isArray(value) ? value : [];
}

export async function fetchInstruments() {
    try {
      const res = await fetch(`${apiDomain}/api/Instruments`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!res.ok) {
        throw new Error(`Failed to fetch Instruments. Status: ${res.status}`);
      }
      const data = await res.json();
      const instruments = data?.$values ?? data; 
  
      return {
        success: true,
        instruments
      };
  
    } catch (error) {
      console.error("❌ Fetch Instruments Error:", error);
      return {
        success: false,
        instruments: [],
        error: (error as Error).message
      };
    }
  }

  export async function fetchAdminInstruments() {
    try {
      const res = await fetch(`${apiDomain}/api/instruments`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch Instruments. Status: ${res.status}`);
      }
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("❌ Fetch Instruments Error:", error);
    }
  }
  export async function fetchProfileInstruments() {
    try {
      const res = await fetch(`${apiDomain}/api/Profile/instruments`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch Instruments. Status: ${res.status}`);
      }
      const data = await res.json();
      
      return data;
    } catch (error) {
      console.error("❌ Fetch Instruments Error:", error);
    }
  }
export async function fetchBooksInstrument(id:string) {
        const res = await fetch(`${apiDomain}/api/Instrument/instruments/${id}`);
            if(!res.ok){
                throw new Error("Fail To Fetch Data");
        }
        return res.json();
}
export async function fetchAdminBlogs() {
  const blogsData = await apiFetch("/api/Blogs");
  return { blogs: blogsData };
}
export async function fetchBlogs() {
  const blogsData = await fetch(`${apiDomain}/api/Blogs/published`, { cache: "no-store" });
  if (!blogsData.ok) throw new Error("Failed to fetch published blogs");
  return { blogs: await blogsData.json() };
}

export async function fetchCurrentUser() {
  const token =
    localStorage.getItem("accessToken") ??
    localStorage.getItem("token");

  if (!token) {
    throw new ApiError("Authentication required", 401);
  }

  const res = await fetch(`${apiDomain}/api/auth/me`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new ApiError(
      "Failed to fetch current user",
      res.status
    );
  }

  return await res.json();
}

export async function fetchConfirmedBlogs() {
  const res = await fetch(`${apiDomain}/api/Blogs/published`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch published blogs");
  return { blogs: await res.json() };
}

export async function fetchPendingBlogs() {
  return apiFetch("/api/Blogs");
}

export async function fetchStudents() {
    const res = await fetch(`${apiDomain}/api/User/students` , {
        method:"GET",
        cache:"no-store",
        headers:{
            'Content-type':'application/json'
        }});
        if(!res.ok){
            throw new Error ('Failed To Fetch Users')
        }
        const users = await res.json();
        return users;
}
export async function fetchAdmins() {
    const res = await fetch(`${apiDomain}/api/User/admins` , {
        method:"GET",
        cache:"no-store",
        headers:{
            'Content-type':'application/json'
        }});
        if(!res.ok){
            throw new Error ('Failed To Fetch Admins')
        }
        const users = await res.json();
        return users;
}
export async function fetchAdminInstrument (id:string){

    const res = await fetch(`${apiDomain}/api/Admin/instrument/${id}`);
        if(!res.ok){
            throw new Error("Fail To Fetch Data");
    }  
    return res.json();
}
export async function fetchProfileInstrument (id:string){

    const res = await fetch(`${apiDomain}/api/Profile/instrument/${id}`);
        if(!res.ok){
            throw new Error("Fail To Fetch Data");
    }  
    return res.json();
}
export async function fetchInstrument(id: string) {
  const res = await fetch(`${apiDomain}/api/Instruments/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch instrument. Status: ${res.status}`);
  return res.json();
}
export async function fetchFullInstrument (id:number){
    try {
        if(!apiDomain){
            return null ;
        }
        const res = await fetch(`${apiDomain}/api/Instrument/instruments/${id}`);
            if(!res.ok){
                throw new Error("Fail To Fetch Data");
        }
        return res.json();
    } catch (error) {
        console.log(error);
        return null;
    }
}
export async function fetchComments() {
    
    const res = await fetch(`${apiDomain}/api/comments` , {
        method: 'GET',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        }});
    if (!res.ok) {
        throw new Error('Failed to Fetch Comments');
    }
    const comments = await res.json();
    return comments
} 
export async function fetchAdminCourses() {
    const res = await fetch(`${apiDomain}/api/Admin/courses`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        throw new Error('Failed to fetch Courses');
    }

    const courses = await res.json();
    
    
    return courses ;
}
export async function fetchProfileCourses() {
    const res = await fetch(`${apiDomain}/api/Profile/courses`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        throw new Error('Failed to fetch Courses');
    }

    const courses = await res.json();
    
    
    return courses ;
}
export async function fetchBooks() {
  const res = await fetch(`${apiDomain}/api/Books`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch books. Status: ${res.status}`);
  return unwrapCollection(await res.json());
}

export async function fetchBook(id: string) {
  const res = await fetch(`${apiDomain}/api/Books/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch book. Status: ${res.status}`);
  return res.json();
}
export async function fetchGalleries() {
  const res = await fetch(`${apiDomain}/api/Galleries/published`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch published galleries");
  return { galleries: await res.json() };
}
export async function fetchAdminUser(id: string) {
    const res = await fetch(`${apiDomain}/api/Admin/user/${id}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || `Failed to fetch user with ID ${id}`);
    }
    
    return await res.json();
}
export async function fetchUser(id: string, signal?: AbortSignal): Promise<IUserDetails> {
     if (typeof window === "undefined") {
    throw new Error("This request must run in the browser.");
  }

  const token = localStorage.getItem("accessToken")
  const branchId = localStorage.getItem("currentBranchId")
   if (!token) {
    throw new Error("Access token not found.");
  }

  if (!branchId) {
    throw new Error("Current branch not selected.");
  }



    const res = await fetch(`${apiDomain}/api/Users/${id}`, {
      method: 'GET',
      cache: 'no-store',
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Branch-Id": branchId,
      }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || `Failed to fetch teacher with ID ${id}`);
    }
    
    return await res.json();
}

export async function fetchRole(id: string) {
     if (typeof window === "undefined") {
    throw new Error("This request must run in the browser.");
  }

  const token = localStorage.getItem("accessToken")
  const branchId = localStorage.getItem("currentBranchId")
   if (!token) {
    throw new Error("Access token not found.");
  }

  if (!branchId) {
    throw new Error("Current branch not selected.");
  }

    const res = await fetch(`${apiDomain}/api/roles/${id}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Branch-Id": branchId,
      }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || `Failed to fetch Role with ID ${id}`);
    }
    
    return await res.json();
}

export async function fetchStudent (id:string){
    try {
        if(!apiDomain){
            return null ;
        }
        const res = await fetch(`${apiDomain}/api/admin/students/${id}`);
            if(!res.ok){
                throw new Error("Fail To Fetch Data");
        }
        return res.json();
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function fetchBlog(id: string) {
  const res = await fetch(`${apiDomain}/api/Blogs/published/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch published blog");
  return res.json();
}
export async function fetchTeacher(id: string) {
    const res = await fetch(`${apiDomain}/api/Teachers/public/${encodeURIComponent(id)}`, {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || `Failed to fetch teacher with ID ${id}`);
    }
    
    return await res.json();
}
export async function fetchTeachers() {
  const res = await fetch(`${apiDomain}/api/Teachers/public`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch teachers. Status: ${res.status}`);
  return unwrapCollection(await res.json());
}

export async function fetchUsers() {
  if (typeof window === "undefined") {
    throw new Error("This request must run in the browser.");
  }

  const token = localStorage.getItem("accessToken");
  const branchId = localStorage.getItem("currentBranchId");

  if (!token) {
    throw new Error("Access token not found.");
  }

  if (!branchId) {
    throw new Error("Current branch not selected.");
  }

  const res = await fetch(`${apiDomain}/api/users`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Branch-Id": branchId,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();

    throw new Error(
      `Failed to fetch Users (${res.status}): ${errorBody}`
    );
  }

  return res.json();
}

export async function fetchRoles() {
    
if (typeof window === "undefined") {
    throw new Error("This request must run in the browser.");
  }

  const token = localStorage.getItem("accessToken");
  const branchId = localStorage.getItem("currentBranchId");

  if (!token) {
    throw new Error("Access token not found.");
  }

  if (!branchId) {
    throw new Error("Current branch not selected.");
  }

  const res = await fetch(`${apiDomain}/api/roles`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Branch-Id": branchId,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();

    throw new Error(
      `Failed to fetch Roles (${res.status}): ${errorBody}`
    );
  }

  return res.json();
}

export async function fetchPermissions() {
    
if (typeof window === "undefined") {
    throw new Error("This request must run in the browser.");
  }

  const token = localStorage.getItem("accessToken");
  const branchId = localStorage.getItem("currentBranchId");

  if (!token) {
    throw new Error("Access token not found.");
  }

  if (!branchId) {
    throw new Error("Current branch not selected.");
  }

  const res = await fetch(`${apiDomain}/api/permissions`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Branch-Id": branchId,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();

    throw new Error(
      `Failed to fetch Permissions (${res.status}): ${errorBody}`
    );
  }

  return res.json();
}
export async function fetchVideo(id: string) {
  const res = await fetch(`${apiDomain}/api/GalleryItems/public/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch public gallery video");
  return res.json();
}


export async function fetchStats() {
    
    const res = await fetch(`${apiDomain}/api/Dashboard/stats`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json'
        }});
    if (!res.ok) {
        throw new Error('Failed to Fetch Stats');
    }
    const photos = await res.json();
    
    return photos;
}

export async function fetchVideos() {
  const res = await fetch(`${apiDomain}/api/GalleryItems/public?mediaType=2`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch public gallery videos");
  return res.json();
}

export async function fetchPhotos() {
  const res = await fetch(`${apiDomain}/api/GalleryItems/public?mediaType=1`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch public gallery photos");
  return res.json();
}

export async function fetchAllVideos() {
  return fetchVideos();
}

export async function fetchPublicGallery(id: string) {
  const res = await fetch(`${apiDomain}/api/Galleries/published/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch published gallery");
  return res.json();
}

export async function fetchPublicGalleryItems(galleryId: string) {
  const res = await fetch(`${apiDomain}/api/GalleryItems/public?galleryId=${encodeURIComponent(galleryId)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch published gallery items");
  return res.json();
}

export async function fetchAdminGuidances() {
  return apiFetch("/api/Contacts");
}

export async function fetchGuidances() {
  return apiFetch("/api/Contacts");
}


