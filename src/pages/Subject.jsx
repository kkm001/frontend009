import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  BookOpen,
  Loader2,
  CheckCircle,
  FileText,
  Home,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import Swal from "sweetalert2";
import axios from "axios";

export const API_URL = import.meta.env.VITE_API;

export default function CourseCRUD() {
  const token = JSON.parse(localStorage.getItem("loginToken")).data;
  console.log("🚀 ~ CourseCRUD ~ token:", token);

  const [teachers, setTeachers] = useState([]);
  const [load, setLoad] = useState(true);
  const getTeacher = async () => {
    try {
      const professors = await axios.get(API_URL + "/get-all-professors");
      setTeachers(professors.data.data);
      console.log(
        "🚀 ~ getAllList ~ professors.data.data:",
        professors.data.data,
      );
    } catch (error) {
      console.error(error);
      Swal.fire("โปรดตรวจสอบเครือข่าย", "", "error");
    } finally {
      setLoad(false);
    }
  };
  useEffect(() => {
    getTeacher();
  }, []);

  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    course_name: "",
    teacher_id: "",   // ✅ เพิ่มตัวนี้
    time_check: "",   // ✅ เพิ่มตัวนี้ด้วย
  });

  // เปลี่ยน URL ตามที่คุณตั้งค่าใน .env

  // Load data from API on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/get-all-subjects`);
      const data = await response.json();
      setCourses(data.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      alert("ไม่สามารถโหลดข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (editingCourse) {
        // ✅ Update — เรียก PUT พร้อม course_id
        const res = await axios.put(
          `${API_URL}/update-subject/${formData.course_id}`,
          {
            course_name: formData.course_name,
            teacher_id: formData.teacher_id,
            time_check: formData.time_check,
          }
        );

        if (res.data.err) {
          return Swal.fire(res.data.err, "ไม่สามารถบันทึกได้", "warning");
        }

        Swal.fire("แก้ไขข้อมูลแล้ว", "", "success");
      } else {
        // ✅ Create — เรียก POST สร้างใหม่
        const res = await axios.post(`${API_URL}/create-subject`, formData);

        if (res.data.err) {
          return Swal.fire(res.data.err, "ไม่สามารถบันทึกได้", "warning");
        }

        Swal.fire("บันทึกข้อมูลแล้ว", "", "success");
      }

      fetchCourses();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving:", error);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      course_id: course.course_id,
      course_name: course.course_name,
      teacher_id: course.teacher_id,
      time_check: course?.time_check,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("คุณต้องการลบรายวิชานี้หรือไม่?")) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/delete-subject/${courseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("ลบข้อมูลสำเร็จ");
        await fetchCourses();
      } else {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("ไม่สามารถลบข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      course_name: "",
      teacher_id: "",
      time_check: "",
    });
    setEditingCourse(null);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <Header />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {token?.role == "1" ? "เช็คชื่อ" : "  ระบบจัดการรายวิชา"}
                </h1>
                {token?.role !== "1" && (
                  <p className="text-gray-500 mt-1">
                    จัดการข้อมูลรายวิชาและอาจารย์ผู้สอน
                  </p>
                )}
              </div>
            </div>
            {token?.role !== "1" && (
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                เพิ่มรายวิชา
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {loading && courses.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                ยังไม่มีรายวิชา กรุณาเพิ่มรายวิชาใหม่
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      ลำดับ
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      รหัสวิชา
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      ชื่อรายวิชา
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      อาจารย์ผู้สอน
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.map((course, index) => {
                    console.log("🚀 ~ CourseCRUD ~ token:", token);
                    return (
                      <tr
                        key={course.course_id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-700">{index + 1}</td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-blue-600">
                            {course.course_id}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-800 font-medium">
                          {token?.role == "1" ? (
                            <Link
                              to={`/check-manual/${course.course_id}/${JSON.parse(localStorage.getItem("loginToken"))
                                .data?.student_id
                                }`}
                              className="hover:text-blue-500 hover:underline"
                            >
                              {" "}
                              {course.course_name}
                            </Link>
                          ) : (
                            <p> {course.course_name}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {course.teacher_name}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {token?.role == "2" || token?.role == "3" ? (
                              <>
                                <button
                                  onClick={() => handleEdit(course)}
                                  disabled={loading}
                                  className="flex items-center gap-1 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="แก้ไข"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  <span className="text-sm">แก้ไข</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(course.course_id)}
                                  disabled={loading}
                                  className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="ลบ"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="text-sm">ลบ</span>
                                </button>
                              </>
                            ) : (
                              <Link
                                className="flex items-center gap-2 p-2 rounded-md text-white bg-blue-500"
                                to={`/class-detail/${course.course_id}/${token?.student_id}`}
                              >
                                <FileText size={18} />
                                รายละเอียด
                              </Link>
                            )}
                            {token?.role == "2" && (
                              <Link
                                className="flex items-center gap-2 p-2 rounded-md text-white bg-green-500"
                                to={`/check-class/${course.course_id}`}
                              >
                                <CheckCircle size={18} />
                                เช็คชื่อ
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          {courses.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                แสดงทั้งหมด{" "}
                <span className="font-semibold text-blue-600">
                  {courses.length}
                </span>{" "}
                รายวิชา
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingCourse ? "แก้ไขรายวิชา" : "เพิ่มรายวิชาใหม่"}
                </h2>
                <button
                  onClick={resetForm}
                  disabled={loading}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      รหัสวิชา
                    </label>
                    <input
                      type="text"
                      value={formData.course_id || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          course_id: e.target.value,
                        })
                      }
                      readOnly
                      className="w-full px-4 py-3 bg-gray-200 border-2 border-gray-50 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      placeholder="สร้างอัตโนมัติ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ชื่อวิชา
                    </label>
                    <input
                      type="text"
                      value={formData.course_name || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          course_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      placeholder="การเขียนโปรแกรม"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ตั้งค่าเวลาเข้าเรียน
                    </label>
                    <input
                      type="time"
                      value={formData.time_check || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          time_check: e.target.value, // เช่น "08:00"
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
               focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      อาจารย์ผู้สอน
                    </label>
                    <select
                      value={formData.teacher_id || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          teacher_id: e.target.value,   // ✅ ใช้ id ตรง ๆ
                        }))
                      }
                      className="w-full p-2 rounded-lg border border-gray-200 outline"
                    >
                      <option value="">เลือกอาจารย์</option>   {/* 🔥 ต้องมี */}
                      {teachers.map((t, index) => (
                        <option value={t.id} key={index}>
                          {t.fullname}
                        </option>
                      ))}
                    </select>
                  </div>
                </>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
                >
                  {loading ? (
                    <Loader2 color="white" className="animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}