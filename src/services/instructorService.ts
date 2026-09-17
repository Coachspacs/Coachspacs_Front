import axiosInstance from "@/lib/axios";
import { userService } from "./userService";
import { UserProfileResponse, UpdateProfileRequest } from "@/types/user";
import {
  InstructorDashboardResponse,
  CourseStudentsResponse,
} from "@/types/certificate";

export interface PublicInstructor {
  id: string | number;
  name?: string;
  full_name?: string;
  fullName?: string;
  headline?: string;
  bio?: string;
  avatar?: string;
  courses_count?: number;
  total_courses?: number;
  students_count?: number;
  rating?: number;
  reviews_count?: number;
  [key: string]: any;
}

export const instructorService = {
  async getProfile(): Promise<UserProfileResponse> {
    return userService.getMyProfile();
  },

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfileResponse> {
    return userService.updateMyProfile(data);
  },

  /**
   * List approved instructors
   * GET /api/users/instructors
   */
  async getInstructors(locale?: string): Promise<PublicInstructor[]> {
    const headers: Record<string, string> = {};
    if (locale) {
      headers["Accept-Language"] = locale;
    }
    const response = await axiosInstance.get("/users/instructors", { headers });
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  },

  /**
   * Instructor Dashboard Summary Metrics (US-17)
   * GET /api/instructor/dashboard
   * Returns distinct total_students, total_courses, and per-course enrollment metrics.
   */
  async getDashboard(): Promise<InstructorDashboardResponse> {
    const response = await axiosInstance.get<InstructorDashboardResponse>(
      "/instructor/dashboard"
    );
    return response.data;
  },

  /**
   * Enrolled Students in Instructor's Course (US-17)
   * GET /api/instructor/courses/{id}/students
   * Supports pagination: page, page_size
   */
  async getCourseStudents(
    courseId: number | string,
    page = 1,
    pageSize = 10
  ): Promise<CourseStudentsResponse> {
    try {
      const response = await axiosInstance.get<
        CourseStudentsResponse | any[]
      >(`/instructor/courses/${courseId}/students`, {
        params: {
          page,
          page_size: pageSize,
        },
      });

      const data = response.data;
      const rawList = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];
      const count = data?.count ?? rawList.length;

      const normalizedResults = rawList.map((st: any, idx: number) => {
        const nested =
          (typeof st.student === "object" && st.student !== null ? st.student : null) ||
          (typeof st.user === "object" && st.user !== null ? st.user : null) ||
          (typeof st.learner === "object" && st.learner !== null ? st.learner : null) ||
          (typeof st.profile === "object" && st.profile !== null ? st.profile : null) ||
          (typeof st.student_profile === "object" && st.student_profile !== null ? st.student_profile : null);

        const email =
          st.email ||
          nested?.email ||
          st.student_email ||
          st.user_email ||
          st.learner_email ||
          (typeof st.student === "string" && st.student.includes("@") ? st.student : "") ||
          (typeof st.user === "string" && st.user.includes("@") ? st.user : "") ||
          "";

        let full_name =
          st.full_name ||
          st.fullName ||
          st.student_full_name ||
          st.student_name ||
          st.studentName ||
          nested?.full_name ||
          nested?.fullName ||
          nested?.student_full_name ||
          nested?.student_name ||
          nested?.name ||
          st.name ||
          nested?.username ||
          st.username ||
          st.student_username ||
          "";

        if (!full_name || full_name.trim().length === 0) {
          const fn = st.first_name || nested?.first_name || "";
          const ln = st.last_name || nested?.last_name || "";
          if (fn || ln) {
            full_name = `${fn} ${ln}`.trim();
          }
        }

        if ((!full_name || full_name.toLowerCase() === "student") && email) {
          const prefix = email.split("@")[0];
          full_name = prefix
            .replace(/[._-]+/g, " ")
            .split(" ")
            .filter(Boolean)
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
        }

        const avatar =
          st.avatar ||
          nested?.avatar ||
          st.student_avatar ||
          st.user_avatar ||
          st.avatar_url ||
          nested?.avatar_url ||
          st.profile_picture ||
          nested?.profile_picture ||
          null;

        return {
          ...st,
          full_name: full_name || st.full_name || "",
          name: full_name || st.name || "",
          email: email || st.email || "",
          avatar: avatar || st.avatar || null,
        };
      });

      return {
        count,
        next: data?.next ?? null,
        previous: data?.previous ?? null,
        results: normalizedResults,
      };
    } catch (err: any) {
      if (err?.response?.status === 403) {
        const forbiddenErr: any = new Error(
          err.response?.data?.detail ||
            "You are not authorized to view students for this course."
        );
        forbiddenErr.status = 403;
        forbiddenErr.isForbidden = true;
        throw forbiddenErr;
      }
      throw err;
    }
  },
};

export default instructorService;
