import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import API_PATHS from "../../utils/apiPaths";
import { handleApiError, handleApiSuccess } from "../../utils/apiHandler";

// Bản đồ trạng thái backend -> nhãn hiển thị tiếng Việt.
const statusText = {
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CHECKED_IN: "Đã vào cổng",
  CHECKED_OUT: "Đã ra cổng",
  OVERDUE: "Quá giờ",
  CANCELLED: "Đã hủy",
};

const GateConsole = () => {
  // Mã để tra cứu: có thể là QR token hoặc request code dạng REQ-... .
  const [lookupCode, setLookupCode] = useState("");
  // Số giấy tờ nhập thêm để đối chiếu danh tính tại cổng.
  const [idNumber, setIdNumber] = useState("");
  // Trạng thái loading cho thao tác verify.
  const [loading, setLoading] = useState(false);
  // Lý do từ chối thủ công theo FM-02.
  const [manualReason, setManualReason] = useState("");
  // Hồ sơ hiện tại sau khi verify thành công.
  const [currentVisit, setCurrentVisit] = useState(null);

  // Bước 1: verify mã tại cổng để lấy hồ sơ cần xử lý.
  const verify = async () => {
    if (!lookupCode.trim()) {
      handleApiError(
        { response: { data: { message: "" } } },
        "Vui lòng nhập mã QR hoặc mã yêu cầu",
      );
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(API_PATHS.GATE_VERIFY_QR, {
        qrCode: lookupCode.trim(),
        idNumber: idNumber.trim() || undefined,
      });
      setCurrentVisit(response.data?.visit || null);
      handleApiSuccess("Xác minh thành công");
    } catch (error) {
      setCurrentVisit(null);
      handleApiError(error, "Xác minh thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: check-in khách, chỉ cho phép khi hồ sơ đã APPROVED.
  const checkIn = async () => {
    if (!currentVisit?._id) return;

    try {
      const response = await axiosInstance.post(API_PATHS.GATE_CHECK_IN, {
        visitId: currentVisit._id,
      });
      setCurrentVisit(response.data?.visit || currentVisit);
      handleApiSuccess("Check-in thành công");
    } catch (error) {
      handleApiError(error, "Check-in thất bại");
    }
  };

  // Bước 3: check-out khách, chỉ cho phép khi đã CHECKED_IN/OVERDUE.
  const checkOut = async () => {
    if (!currentVisit?._id) return;

    try {
      const response = await axiosInstance.post(API_PATHS.GATE_CHECK_OUT, {
        visitId: currentVisit._id,
      });
      setCurrentVisit(response.data?.visit || currentVisit);
      handleApiSuccess("Check-out thành công");
    } catch (error) {
      handleApiError(error, "Check-out thất bại");
    }
  };

  // Trường hợp ngoại lệ: ghi nhận từ chối thủ công để phục vụ audit FM-02.
  const manualDeny = async () => {
    if (!currentVisit?._id) {
      handleApiError(
        { response: { data: { message: "" } } },
        "Hãy xác minh hồ sơ trước",
      );
      return;
    }

    if (!manualReason.trim()) {
      handleApiError(
        { response: { data: { message: "" } } },
        "Vui lòng nhập lý do từ chối",
      );
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.GATE_MANUAL_DENY, {
        visitId: currentVisit._id,
        reason: manualReason.trim(),
      });
      setManualReason("");
      handleApiSuccess("Đã ghi nhận từ chối thủ công");
    } catch (error) {
      handleApiError(error, "Không thể ghi nhận từ chối");
    }
  };

  // Cờ điều khiển trạng thái nút bấm theo trạng thái hồ sơ hiện tại.
  const canCheckIn = currentVisit?.status === "APPROVED";
  const canCheckOut = ["CHECKED_IN", "OVERDUE"].includes(currentVisit?.status);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Cột trái: thao tác vận hành tại cổng */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3">
          <h1 className="text-xl font-semibold text-slate-800">Gate Console</h1>
          <p className="mt-1 text-sm text-slate-600">
            Dùng để xác minh mã, check-in/check-out và ghi nhận từ chối thủ công
            tại cổng.
          </p>

          {/* Khu vực nhập dữ liệu tra cứu */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Mã QR hoặc mã yêu cầu (REQ-...)"
              value={lookupCode}
              onChange={(event) => setLookupCode(event.target.value)}
            />
            <input
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Số giấy tờ (tùy chọn để đối chiếu)"
              value={idNumber}
              onChange={(event) => setIdNumber(event.target.value)}
            />
          </div>

          {/* Nhóm nút thao tác chính của bảo vệ */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              onClick={verify}
              disabled={loading}
            >
              {loading ? "Đang xác minh..." : "Verify"}
            </button>
            <button
              type="button"
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              onClick={checkIn}
              disabled={!canCheckIn}
            >
              Check-in
            </button>
            <button
              type="button"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              onClick={checkOut}
              disabled={!canCheckOut}
            >
              Check-out
            </button>
          </div>

          {/* Khối ngoại lệ: ghi nhận từ chối thủ công có lý do */}
          <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-medium text-rose-800">
              Manual Deny (FM-02)
            </p>
            <div className="mt-3 flex flex-col gap-2 md:flex-row">
              <input
                className="w-full rounded-md border border-rose-300 px-3 py-2 text-sm"
                placeholder="Nhập lý do từ chối thủ công"
                value={manualReason}
                onChange={(event) => setManualReason(event.target.value)}
              />
              <button
                type="button"
                className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
                onClick={manualDeny}
              >
                Ghi nhận từ chối
              </button>
            </div>
          </div>
        </section>

        {/* Cột phải: hiển thị thông tin hồ sơ sau khi verify */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800">
            Kết quả xác minh
          </h2>

          {!currentVisit ? (
            <p className="mt-3 text-sm text-slate-500">
              Chưa có dữ liệu. Hãy verify mã để xem chi tiết.
            </p>
          ) : (
            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="font-medium text-slate-700">Mã yêu cầu:</span>{" "}
                {currentVisit.requestCode}
              </p>
              <p>
                <span className="font-medium text-slate-700">Khách:</span>{" "}
                {currentVisit.visitorName}
              </p>
              <p>
                <span className="font-medium text-slate-700">SĐT:</span>{" "}
                {currentVisit.visitorPhone}
              </p>
              <p>
                <span className="font-medium text-slate-700">Mục đích:</span>{" "}
                {currentVisit.purpose}
              </p>
              <p>
                <span className="font-medium text-slate-700">Khu vực:</span>{" "}
                {currentVisit.areaAllowed}
              </p>
              <p>
                <span className="font-medium text-slate-700">Trạng thái:</span>{" "}
                {statusText[currentVisit.status] || currentVisit.status}
              </p>
              <p>
                <span className="font-medium text-slate-700">
                  Giờ vào dự kiến:
                </span>{" "}
                {new Date(currentVisit.expectedCheckInAt).toLocaleString(
                  "vi-VN",
                )}
              </p>
              <p>
                <span className="font-medium text-slate-700">
                  Giờ ra dự kiến:
                </span>{" "}
                {new Date(currentVisit.expectedCheckOutAt).toLocaleString(
                  "vi-VN",
                )}
              </p>
              {currentVisit.checkInAt ? (
                <p>
                  <span className="font-medium text-slate-700">
                    Check-in thực tế:
                  </span>{" "}
                  {new Date(currentVisit.checkInAt).toLocaleString("vi-VN")}
                </p>
              ) : null}
              {currentVisit.checkOutAt ? (
                <p>
                  <span className="font-medium text-slate-700">
                    Check-out thực tế:
                  </span>{" "}
                  {new Date(currentVisit.checkOutAt).toLocaleString("vi-VN")}
                </p>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default GateConsole;
