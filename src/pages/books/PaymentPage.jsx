import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { clearCart } from '../../redux/features/cartSlice';

const PaymentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const [addInfo, setAddInfo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showAllItems, setShowAllItems] = useState(false);

  const orderInfo = JSON.parse(localStorage.getItem('orderInfo') || '{}');
  const { orderId, customerInfo, items = [], totalPriceVND, totalPrice } = orderInfo;

  const handleGenerateQR = async () => {
    if (!orderId || !totalPriceVND) {
      alert('Thông tin đơn hàng không đủ để tạo mã QR.');
      return;
    }
    setLoading(true);
    setQrImage(""); 
    try {
        const amountInVND = Math.round(totalPriceVND);
        console.log('Sending request with amount:', amountInVND, 'for orderId:', orderId);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/bankqr`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
                amount: amountInVND,
                orderId,
                description: `Book Store - Order ${orderId}`
            }),
        });
        const data = await res.json();
        console.log('Response data from /bankqr:', data);
        if (!data.success) throw new Error(data.message || 'Không thể tạo mã QR');
        setQrImage(data.qrImage);
        setAddInfo(data.addInfo || `Thanh toan don hang ${orderId}`);
    } catch (error) {
        console.error("Lỗi tạo mã QR:", error);
        alert('Không thể tạo mã QR: ' + error.message);
        setQrImage("");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentMethod === "bank" && orderId && totalPriceVND) {
      handleGenerateQR();
    } else if (paymentMethod === "cod") {
      setQrImage("");
      setAddInfo("");
    }
  }, [paymentMethod, orderId, totalPriceVND]);

  const handleCompleteOrder = async () => {
    if (!orderInfo || !orderInfo.orderId) {
      alert('Không tìm thấy thông tin đơn hàng.');
      return;
    }
    try {
      setLoading(true);
      const paymentStatusForUpdate = paymentMethod === "bank" ? "completed" : "pending_cod";
      await fetch(`${import.meta.env.VITE_API_URL}/api/payment/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderInfo.orderId, status: paymentStatusForUpdate })
      });
      dispatch(clearCart());
      localStorage.removeItem('orderInfo');
      navigate('/orders/thanks');
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Có lỗi xảy ra khi hoàn tất đơn hàng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const itemsToDisplay = items.length > 1 && !showAllItems ? [items[0]] : items;

  return (
    <div className="min-h-screen bg-gray-100 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="md:flex">
          {/* Thông tin đơn hàng */}
          <div className="md:w-2/3 p-6 sm:p-8">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Xác nhận thanh toán</h2>
            
            {customerInfo && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">Thông tin người nhận</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-800">Họ tên:</span> {customerInfo.name}</p>
                  <p><span className="font-medium text-gray-800">Email:</span> {customerInfo.email}</p>
                  <p><span className="font-medium text-gray-800">SĐT:</span> {customerInfo.phone}</p>
                  <p className="sm:col-span-2"><span className="font-medium text-gray-800">Địa chỉ:</span> {customerInfo.address}</p>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Sản phẩm đã đặt</h3>
              <div className="space-y-6"> {/* Tăng space-y để có khoảng cách lớn hơn giữa các item */}
                {itemsToDisplay.map((item) => (
                  <div 
                    key={item._id || item.id} 
                    className="flex items-start sm:items-center gap-4 sm:gap-6 border-b border-gray-200 pb-6 last:border-b-0"
                  >
                    <img 
                      src={item.coverImage} 
                      alt={item.title}
                      className="w-24 h-36 sm:w-28 sm:h-40 object-cover rounded-md shadow-sm flex-shrink-0" // Tăng kích thước ảnh, thêm flex-shrink-0
                    />
                    <div className="flex-grow min-w-0"> {/* Thêm min-w-0 để text wrap tốt hơn */}
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 truncate" title={item.title}> {/* Tăng font, thêm truncate */}
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-500 mb-1">Tác giả: {item.author?.name || 'N/A'}</p>
                      <p className="text-sm sm:text-base text-gray-700">Số lượng: {item.quantity}</p>
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-gray-700 whitespace-nowrap pl-2"> {/* Tăng font, thêm pl-2 */}
                      ${(item.newPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              {items.length > 1 && (
                <div className="mt-6 text-center sm:text-left"> {/* Điều chỉnh vị trí nút */}
                    <button
                    onClick={() => setShowAllItems(!showAllItems)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium py-2 px-4 rounded-md hover:bg-blue-50 transition-colors"
                    >
                    {showAllItems ? "Ẩn bớt sản phẩm" : `Xem tất cả (${items.length} sản phẩm)`}
                    </button>
                </div>
              )}
            </div>

            {totalPrice !== undefined && totalPriceVND !== undefined && (
              <div className="text-right mt-6 pt-6 border-t border-gray-200">
                <p className="text-xl sm:text-2xl font-bold text-gray-800">
                  Tổng tiền: ${Number(totalPrice).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  (Tương đương: {Number(totalPriceVND).toLocaleString('vi-VN')} VNĐ)
                </p>
              </div>
            )}
          </div>

          {/* Phương thức thanh toán */}
          <div className="md:w-1/3 bg-gray-50 p-6 sm:p-8 border-t md:border-t-0 md:border-l border-gray-200"> {/* Điều chỉnh border */}
            <h3 className="text-xl font-semibold text-gray-700 mb-6">Phương thức thanh toán</h3>
            
            <div className="space-y-4 mb-8">
              <label className="flex items-center p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-all bg-white shadow-sm">
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 font-medium">Thanh toán khi nhận hàng (COD)</span>
              </label>
              
              <label className="flex items-center p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-all bg-white shadow-sm">
                <input
                  type="radio"
                  value="bank"
                  checked={paymentMethod === "bank"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 font-medium">Chuyển khoản ngân hàng</span>
              </label>
            </div>

            {paymentMethod === "bank" && (
              <div className="text-center p-4 bg-white rounded-lg shadow-lg"> {/* Thêm shadow-lg */}
                {loading && !qrImage ? (
                  <div className="animate-pulse text-gray-600 py-10">Đang tạo mã QR...</div>
                ) : qrImage ? (
                  <div>
                    <p className="mb-2 text-sm text-gray-600">Quét mã QR để thanh toán:</p>
                    <img 
                      src={qrImage} 
                      alt="QR chuyển khoản" 
                      className="mx-auto w-56 h-56 sm:w-64 sm:h-64 object-contain border-2 border-gray-300 rounded-md p-1 bg-white" // Thêm border, padding, bg
                    />
                    <div className="mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-md"> {/* Bọc thông tin thêm vào box */}
                      <p><span className="font-semibold">Nội dung:</span> <strong className="text-blue-600 block break-all">{addInfo}</strong></p>
                      <p className="mt-1"><span className="font-semibold">Số tiền:</span> {Number(totalPriceVND).toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                  </div>
                ) : !loading && (
                  <p className="text-sm text-red-500 py-10">Không thể hiển thị mã QR. Vui lòng thử lại.</p>
                )}
              </div>
            )}

            <button
              onClick={handleCompleteOrder}
              disabled={loading || (paymentMethod === "bank" && !qrImage && !loading)}
              className="w-full mt-8 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : paymentMethod === "cod" ? "Hoàn tất đặt hàng" : "Tôi đã chuyển khoản"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;