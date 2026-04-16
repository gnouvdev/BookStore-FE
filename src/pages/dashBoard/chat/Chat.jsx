import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  MessageCircle,
  Search,
  Send,
  Phone,
  MoreVertical,
  Paperclip,
} from "lucide-react";
import { useSocket } from "../../../context/SocketContext";
import {
  useGetChatHistoryQuery,
  useGetChatUsersQuery,
  useSendMessageMutation,
} from "../../../redux/features/chat/chatApi";

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const socket = useSocket();
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");
  const adminToken = localStorage.getItem("token");

  const { data: chatUsersData, isLoading: isLoadingUsers } = useGetChatUsersQuery(undefined, {
    skip: !adminToken,
    refetchOnMountOrArgChange: true,
  });
  const users = chatUsersData?.data || [];

  const {
    data: chatHistoryData,
    refetch: refetchChatHistory,
  } = useGetChatHistoryQuery(selectedUser?._id, {
    skip: !selectedUser || !adminToken,
    refetchOnMountOrArgChange: true,
  });

  const messages = chatHistoryData?.data || [];
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const filteredUsers = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return users.filter((user) => !normalized || (user.fullName || user.email || "").toLowerCase().includes(normalized));
  }, [searchQuery, users]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket || !selectedUser?._id) {
      return undefined;
    }

    socket.emit("joinChat", selectedUser._id);

    const handleNewMessage = (payload) => {
      const receiverId = payload?.message?.receiverId;
      const senderId = payload?.message?.senderId;
      if (receiverId === selectedUser._id || senderId === selectedUser._id) {
        refetchChatHistory();
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.emit("leaveChat", selectedUser._id);
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser, refetchChatHistory]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!message.trim() || !selectedUser?._id) {
      return;
    }

    try {
      await sendMessage({
        receiverId: selectedUser._id,
        message: message.trim(),
      }).unwrap();
      setMessage("");
      refetchChatHistory();
    } catch {
      // handled by mutation layer
    }
  };

  if (!adminToken || adminUser.role !== "admin") {
    return (
      <div className="archivist-admin-card archivist-empty" style={{ minHeight: 420 }}>
        Khu vực này chỉ dành cho quản trị viên đã đăng nhập.
      </div>
    );
  }

  return (
    <div className="archivist-grid" style={{ gap: 24 }}>
      <section className="archivist-page-header">
        <div>
          <p className="archivist-page-header__eyebrow">Kênh hỗ trợ khách hàng</p>
          <h2>Hỗ trợ chat</h2>
          <p>
            Giao diện chat được đồng bộ với admin mới, ưu tiên cuộc trò chuyện, hồ sơ
            người gửi và khu vực phản hồi rõ ràng, dễ theo dõi.
          </p>
        </div>
      </section>

      <section className="archivist-admin-card archivist-chat-layout archivist-admin-card--strong">
        <aside className="archivist-chat-sidebar">
          <div className="archivist-panel" style={{ borderBottom: "1px solid var(--archivist-line)" }}>
            <p className="archivist-panel__eyebrow">Phiên đang hoạt động</p>
            <h3 className="archivist-panel__title">{filteredUsers.length} cuộc trò chuyện</h3>
            <label className="archivist-searchbox" style={{ marginTop: 16, width: "100%", minWidth: 0 }}>
              <Search size={16} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm cuộc trò chuyện..."
              />
            </label>
          </div>

          <div className="archivist-chat-list">
            {isLoadingUsers ? (
              <div className="archivist-empty">Đang tải danh sách hội thoại...</div>
            ) : filteredUsers.length ? (
              filteredUsers.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  className={`archivist-chat-thread ${selectedUser?._id === user._id ? "is-active" : ""}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="archivist-list-row__leading">
                    <div className="archivist-avatar archivist-avatar--sm">
                      {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <strong className="archivist-list-row__title">
                        {user.fullName || user.email || "Người dùng"}
                      </strong>
                      <span className="archivist-list-row__meta" style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {user.lastMessage?.message || "Chưa có tin nhắn"}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="archivist-empty">Chưa có cuộc trò chuyện nào.</div>
            )}
          </div>
        </aside>

        <section className="archivist-chat-main">
          {selectedUser ? (
            <div className="archivist-chat-pane">
              <div className="archivist-panel" style={{ borderBottom: "1px solid var(--archivist-line)", paddingBottom: 18 }}>
                <div className="archivist-panel__head" style={{ marginBottom: 0 }}>
                  <div>
                    <p className="archivist-panel__eyebrow">Hội thoại hiện tại</p>
                    <h3 className="archivist-panel__title">{selectedUser.fullName || selectedUser.email || "Người dùng"}</h3>
                    <p className="archivist-panel__description">{selectedUser.email || "Không có email"}</p>
                  </div>
                  <div className="archivist-page-actions">
                    <button type="button" className="archivist-icon-button" aria-label="Gọi cho người dùng">
                      <Phone size={15} />
                    </button>
                    <button type="button" className="archivist-icon-button" aria-label="Tùy chọn khác">
                      <MoreVertical size={15} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="archivist-chat-bubbles">
                {messages.length ? (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`archivist-chat-bubble ${msg.senderRole === "admin" ? "archivist-chat-bubble--admin" : "archivist-chat-bubble--guest"}`}
                    >
                      <p style={{ margin: 0, lineHeight: 1.8 }}>{msg.message}</p>
                      <div className="archivist-table-meta" style={{ marginTop: 10, color: msg.senderRole === "admin" ? "rgba(255,248,239,0.7)" : undefined }}>
                        {format(new Date(msg.createdAt), "HH:mm · dd/MM", { locale: vi })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="archivist-empty">Chọn hội thoại để xem nội dung chi tiết.</div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="archivist-chat-composer" onSubmit={handleSendMessage}>
                <div className="archivist-page-actions" style={{ gap: 8 }}>
                  <span className="archivist-status-pill" data-tone="info">Phản hồi trực tiếp</span>
                  <span className="archivist-status-pill" data-tone="warning">Luồng hỗ trợ</span>
                </div>
                <textarea
                  className="archivist-textarea"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Nhập phản hồi cho khách hàng..."
                />
                <div className="archivist-page-actions" style={{ justifyContent: "space-between" }}>
                  <button type="button" className="archivist-icon-button" aria-label="Đính kèm tệp">
                    <Paperclip size={15} />
                  </button>
                  <button type="submit" className="archivist-primary-button" disabled={!message.trim() || isSending}>
                    <Send size={15} />
                    {isSending ? "Đang gửi..." : "Gửi phản hồi"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="archivist-empty">
              <div>
                <MessageCircle size={40} style={{ margin: "0 auto 16px" }} />
                <strong className="archivist-list-row__title" style={{ display: "block" }}>
                  Chọn một cuộc trò chuyện
                </strong>
                <p className="archivist-panel__description">
                  Danh sách hội thoại nằm ở cột trái. Khi chọn một người dùng, nội dung,
                  hồ sơ và khung phản hồi sẽ hiện đầy đủ ở đây.
                </p>
              </div>
            </div>
          )}
        </section>

        <aside className="archivist-chat-detail">
          <div className="archivist-chat-detail-pane">
            <div className="archivist-panel">
              <p className="archivist-panel__eyebrow">Hồ sơ người đọc</p>
              {selectedUser ? (
                <div className="archivist-stack">
                  <div className="archivist-avatar" style={{ width: 96, height: 96 }}>
                    {(selectedUser.fullName || selectedUser.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="archivist-panel__title">{selectedUser.fullName || "Khách ghé thăm"}</h3>
                    <p className="archivist-panel__description">{selectedUser.email || "Không có email"}</p>
                  </div>
                  <div className="archivist-stack">
                    <div className="archivist-list-row">
                      <strong className="archivist-list-row__title">Tin nhắn gần nhất</strong>
                      <span className="archivist-list-row__meta">{selectedUser.lastMessage?.message || "Chưa có dữ liệu"}</span>
                    </div>
                    <div className="archivist-list-row">
                      <strong className="archivist-list-row__title">Trạng thái phiên</strong>
                      <span className="archivist-list-row__meta">Đang mở hội thoại</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="archivist-empty" style={{ minHeight: 260 }}>
                  Hồ sơ hội thoại sẽ hiện ở đây khi bạn chọn một người dùng.
                </div>
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
