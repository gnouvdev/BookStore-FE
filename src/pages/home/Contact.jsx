/* eslint-disable no-unused-vars */
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  Users,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const contactInfo = [
    {
      icon: Phone,
      title: "Điện thoại",
      value: "+84 123 456 789",
      description: "Thứ 2 - Thứ 6, 8:00 - 17:00",
    },
    {
      icon: Mail,
      title: "Email",
      value: "contact@company.com",
      description: "Phản hồi trong 24h",
    },
    {
      icon: MapPin,
      title: "Địa chỉ",
      value: "123 Đường ABC, Quận 1",
      description: "TP. Hồ Chí Minh, Việt Nam",
    },
    {
      icon: Clock,
      title: "Giờ làm việc",
      value: "8:00 - 17:00",
      description: "Thứ 2 - Thứ 6",
    },
  ];

  const socialLinks = [
    { icon: Facebook, name: "Facebook", url: "#", color: "bg-blue-600" },
    { icon: Twitter, name: "Twitter", url: "#", color: "bg-sky-500" },
    { icon: Instagram, name: "Instagram", url: "#", color: "bg-pink-600" },
    { icon: Linkedin, name: "LinkedIn", url: "#", color: "bg-blue-700" },
    { icon: Youtube, name: "YouTube", url: "#", color: "bg-red-600" },
  ];

  const faqs = [
    {
      question: "Thời gian phản hồi là bao lâu?",
      answer: "Chúng tôi cam kết phản hồi trong vòng 24 giờ làm việc.",
    },
    {
      question: "Có hỗ trợ khách hàng 24/7 không?",
      answer: "Hiện tại chúng tôi hỗ trợ từ 8:00 - 17:00, thứ 2 đến thứ 6.",
    },
    {
      question: "Có thể đặt lịch hẹn trực tiếp không?",
      answer: "Có, bạn có thể gọi điện hoặc gửi email để đặt lịch hẹn.",
    },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Vui lòng nhập chủ đề";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Vui lòng nhập nội dung";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 3000);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10" />
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <MessageSquare className="w-4 h-4 mr-2" />
              Liên hệ với chúng tôi
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Chúng tôi luôn sẵn sàng
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {" "}
                hỗ trợ bạn
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Có câu hỏi hoặc cần hỗ trợ? Đội ngũ chuyên gia của chúng tôi luôn
              sẵn sàng giúp đỡ bạn với mọi thắc mắc và yêu cầu.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <info.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {info.title}
                    </h3>
                    <p className="text-lg font-medium text-blue-600 mb-1">
                      {info.value}
                    </p>
                    <p className="text-sm text-gray-500">{info.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Contact Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Gửi tin nhắn cho chúng tôi
                  </CardTitle>
                  <CardDescription>
                    Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại với bạn
                    sớm nhất có thể.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Gửi thành công!
                      </h3>
                      <p className="text-gray-600">
                        Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời
                        gian sớm nhất.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Input
                            placeholder="Họ và tên *"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            className={errors.name ? "border-red-500" : ""}
                          />
                          {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <Input
                            type="email"
                            placeholder="Email *"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className={errors.email ? "border-red-500" : ""}
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Số điện thoại"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                        />
                        <div>
                          <Input
                            placeholder="Chủ đề *"
                            value={formData.subject}
                            onChange={(e) =>
                              handleInputChange("subject", e.target.value)
                            }
                            className={errors.subject ? "border-red-500" : ""}
                          />
                          {errors.subject && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.subject}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Textarea
                          placeholder="Nội dung tin nhắn *"
                          rows={5}
                          value={formData.message}
                          onChange={(e) =>
                            handleInputChange("message", e.target.value)
                          }
                          className={errors.message ? "border-red-500" : ""}
                        />
                        {errors.message && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Đang gửi...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Send className="w-4 h-4 mr-2" />
                            Gửi tin nhắn
                          </div>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Office Info */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold text-gray-900">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    Văn phòng chính
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Địa chỉ
                    </h4>
                    <p className="text-gray-600">
                      123 Đường ABC, Phường XYZ
                      <br />
                      Quận 1, TP. Hồ Chí Minh
                      <br />
                      Việt Nam
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Thông tin liên hệ
                    </h4>
                    <div className="space-y-2 text-gray-600">
                      <p className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-blue-600" />
                        +84 123 456 789
                      </p>
                      <p className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-blue-600" />
                        contact@company.com
                      </p>
                      <p className="flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-blue-600" />
                        www.company.com
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold text-gray-900">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Kết nối với chúng tôi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((social, index) => (
                      <motion.a
                        key={index}
                        href={social.url}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`${social.color} p-3 rounded-full text-white hover:opacity-90 transition-opacity`}
                      >
                        <social.icon className="w-5 h-5" />
                      </motion.a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Câu hỏi thường gặp
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index}>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                      {index < faqs.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tìm chúng tôi trên bản đồ
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Văn phòng của chúng tôi nằm ở vị trí thuận tiện, dễ dàng tiếp cận
              bằng các phương tiện giao thông công cộng.
            </p>
          </motion.div>

          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="h-96 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Bản đồ sẽ được tích hợp tại đây</p>
                <p className="text-sm text-gray-500 mt-2">
                  (Google Maps hoặc dịch vụ bản đồ khác)
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
