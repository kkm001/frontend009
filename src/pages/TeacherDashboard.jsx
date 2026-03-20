import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  ClipboardList,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "./Subject";
import Header from "../components/header";
import Footer from "../components/footer";

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    todayAttendance: 0,
  });

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);

      // 🔹 เช็ค login
      const token = JSON.parse(localStorage.getItem("loginToken"));
      if (!token || token.data.role !== "2") {
        location.href = "/";
        return;
      }

      setTeacherInfo(token.data);

      // 🔹 ดึงรายวิชา
      const coursesRes = await axios.get(`${API_URL}/get-all-subjects`);
      const courseData = coursesRes.data.data || [];
      setCourses(courseData);

      // 🔥 ดึง Dashboard Stats
      const statsRes = await axios.get(`${API_URL}/get-dashboard-stats`);
      const statsData = statsRes.data.data;

      // 🔥 รวมจำนวนเช็คชื่อทั้งหมด
      const totalAttendance =
        statsData.present +
        statsData.leave +
        statsData.absent +
        statsData.late;

      setStats({
        totalCourses: statsData.totalCourses,
        totalStudents: statsData.totalStudents,
        todayAttendance: totalAttendance,
      });

    } catch (error) {
      console.error(error);
      setError("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto mt-20 p-6">
        {/* Welcome */}
        <h1 className="text-2xl font-bold mb-4">
          สวัสดี {teacherInfo?.fullname}
        </h1>

        {/* Error */}
        {error && (
          <div className="bg-red-100 p-3 mb-4 flex gap-2">
            <AlertCircle /> {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <BookOpen />
            <p>รายวิชา</p>
            <h2 className="text-2xl">{stats.totalCourses}</h2>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <Users />
            <p>นักศึกษา</p>
            <h2 className="text-2xl">{stats.totalStudents}</h2>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <ClipboardList />
            <p>เช็คชื่อทั้งหมด</p>
            <h2 className="text-2xl">{stats.todayAttendance}</h2>
          </div>
        </div>

        {/* Course List */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">รายวิชา</h2>

          {courses.length === 0 ? (
            <p>ไม่มีรายวิชา</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {courses.map((course) => (
                <Link
                  key={course.course_id}
                  to={`/check-class/${course.course_id}`}
                  className="p-4 border rounded hover:bg-gray-100"
                >
                  <h3 className="font-bold">{course.course_name}</h3>
                  <p>{course.course_id}</p>
                  <p className="text-sm text-gray-500">
                    {course.teacher_name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}