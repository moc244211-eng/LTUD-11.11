require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");
const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");
const Coupon = require("./models/Coupon");
const Article = require("./models/Article");
const articlesData = require("./data/articlesData");

const seedData = async () => {
  try {
    console.log("⏳ Đang kết nối MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Đã kết nối MongoDB Atlas thành công.");

    // 1. Dọn dẹp dữ liệu cũ
    console.log("🧹 Đang dọn dẹp dữ liệu cũ...");
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Coupon.deleteMany({});
    await Article.deleteMany({});

    // 2. Tạo tài khoản mẫu (Admin & Customers)
    console.log("👥 Đang tạo tài khoản mẫu...");
    const adminUser = await User.create({
      name: "Quản Trị Viên MENSTYLE",
      email: "admin@menstyle.vn",
      password: process.env.ADMIN_PASSWORD || "AdminSecret2026@",
      phone: "0901234567",
      role: "admin",
    });

    const customerUser1 = await User.create({
      name: "Nguyễn Văn Hùng",
      email: "hung.nguyen@gmail.com",
      password: "KhachPassword123@",
      phone: "0987654321",
      role: "customer",
      address: "123 Huỳnh Thúc Kháng, TP. Biên Hòa, Đồng Nai",
    });

    const customerUser2 = await User.create({
      name: "Lê Hoàng Nam",
      email: "nam.le@gmail.com",
      password: "KhachPassword123@",
      phone: "0934567890",
      role: "customer",
      address: "88 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    });

    const customerUser3 = await User.create({
      name: "Đặng Quốc Anh",
      email: "quocanh.dang@gmail.com",
      password: "KhachPassword123@",
      phone: "0918765432",
      role: "customer",
      address: "15 Cầu Giấy, Hà Nội",
    });

    console.log("✅ Tạo tài khoản thành công:");
    console.log(" 👑 Admin: admin@menstyle.vn / (Mật khẩu bảo mật cá nhân)");
    console.log(" 👤 Khách 1: hung.nguyen@gmail.com / KhachPassword123@");
    console.log(" 👤 Khách 2: nam.le@gmail.com / KhachPassword123@");

    // 3. Tạo danh mục Thời Trang Nam
    console.log("📁 Đang nạp danh mục Thời Trang Nam...");
    const categoriesData = [
      {
        name: "Áo Sơ Mi & Áo Polo Nam",
        slug: "ao-so-mi-polo",
        description: "Các mẫu sơ mi công sở cao cấp, polo năng động tôn dáng phái mạnh.",
        image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
      },
      {
        name: "Áo Thun & Áo Hoodie Nam",
        slug: "ao-thun-hoodie",
        description: "Áo thun cotton thoáng mát, áo hoodie nỉ streetwear thời thượng.",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600",
      },
      {
        name: "Quần Tây Âu & Quần Jeans",
        slug: "quan-tay-jeans",
        description: "Quần âu may đo chỉn chu, quần jean co giãn cá tính.",
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600",
      },
      {
        name: "Quần Kaki & Quần Short",
        slug: "quan-kaki-short",
        description: "Quần kaki thanh lịch và short dạo phố thoải mái cho ngày hè.",
        image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600",
      },
      {
        name: "Áo Khoác & Blazer Nam",
        slug: "ao-khoac-blazer",
        description: "Blazer phong cách Hàn Quốc, bomber dù trẻ trung thời thượng.",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600",
      },
      {
        name: "Phụ Kiện Nam Cao Cấp",
        slug: "phu-kien-nam",
        description: "Thắt lưng da bò, ví da nam và phụ kiện định hình phong cách.",
        image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600",
      },
    ];

    const createdCats = await Category.insertMany(categoriesData);
    console.log(`✅ Đã nạp ${createdCats.length} danh mục.`);

    // 4. Tạo sản phẩm Thời Trang Nam thực tế
    console.log("👕 Đang nạp sản phẩm Thời Trang Nam...");
    const productsData = [
      {
        name: "Áo Sơ Mi Nam Oxford Slimfit Chống Nhăn",
        category: createdCats[0]._id,
        brand: "MENSTYLE",
        originalPrice: 380000,
        salePrice: 289000,
        stock: 45,
        sizes: ["M", "L", "XL", "2XL"],
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
        description: "Chất liệu 100% cotton Oxford dệt chéo thoáng khí, chống nhăn tự nhiên, form slimfit tôn dáng chỉn chu đi làm hay gặp gỡ đối tác.",
        rating: 4.9,
        isFeatured: true,
      },
      {
        name: "Áo Polo Nam Bo Cổ Dệt Kim Pique Cao Cấp",
        category: createdCats[0]._id,
        brand: "MENSTYLE",
        originalPrice: 320000,
        salePrice: 249000,
        stock: 60,
        sizes: ["M", "L", "XL", "2XL"],
        image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600",
        description: "Vải cá sấu mắt chim co giãn 4 chiều, bo cổ dệt viền sắc sảo, thấm hút mồ hôi cực tốt, giữ form áo phẳng phiu sau nhiều lần giặt.",
        rating: 5.0,
        isFeatured: true,
      },
      {
        name: "Áo Sơ Mi Lụa Hàn Quốc Dài Tay Form Rộng",
        category: createdCats[0]._id,
        brand: "K-HOMME",
        originalPrice: 269000,
        salePrice: 269000,
        stock: 35,
        sizes: ["M", "L", "XL"],
        image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600",
        description: "Lụa mềm rũ mát lạnh không nhăn, bề mặt ánh nhẹ sang trọng phong cách soái ca Hàn Quốc, thích hợp đi tiệc, đi chơi hay hẹn hò.",
        rating: 4.8,
        isFeatured: false,
      },
      {
        name: "Áo Thun Nam Oversize Cotton 100% Định Lượng 250gsm",
        category: createdCats[1]._id,
        brand: "URBAN STREET",
        originalPrice: 250000,
        salePrice: 179000,
        stock: 80,
        sizes: ["M", "L", "XL", "2XL"],
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600",
        description: "Cotton compact 2 chiều 250gsm dày dặn đứng form chuẩn streetwear, không xù lông, cổ áo dệt bo spandex không bai dão.",
        rating: 4.9,
        isFeatured: true,
      },
      {
        name: "Áo Hoodie Nam Nỉ Bông Unisex Túi Kangaroo",
        category: createdCats[1]._id,
        brand: "URBAN STREET",
        originalPrice: 349000,
        salePrice: 349000,
        stock: 30,
        sizes: ["L", "XL", "2XL"],
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600",
        description: "Vải nỉ chân cua trần bông dày dặn ấm áp, form rộng giấu dáng cực chất, nón 2 lớp giữ form cứng cáp.",
        rating: 5.0,
        isFeatured: false,
      },
      {
        name: "Áo Thun Nam Cổ Tròn Basic Mềm Mát",
        category: createdCats[1]._id,
        brand: "MENSTYLE",
        originalPrice: 129000,
        salePrice: 129000,
        stock: 95,
        sizes: ["M", "L", "XL", "2XL"],
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600",
        description: "Vải thun cotton mát lạnh kháng khuẩn, co giãn đàn hồi tốt, mặc lót bên trong sơ mi hoặc mặc nhà thể thao nhẹ nhõm.",
        rating: 4.7,
        isFeatured: false,
      },
      {
        name: "Quần Tây Nam Ống Đứng Cạp Chun Thông Minh",
        category: createdCats[2]._id,
        brand: "GENTLEMAN",
        originalPrice: 450000,
        salePrice: 329000,
        stock: 40,
        sizes: ["29", "30", "31", "32", "34"],
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600",
        description: "Chất liệu tuysi cao cấp không nhăn, ly quần dập định hình sắc nét, cạp quần thiết kế chun ẩn co giãn 4cm giúp ngồi làm việc không bị tức bụng.",
        rating: 5.0,
        isFeatured: true,
      },
      {
        name: "Quần Jeans Nam Xanh Khói Slimfit Co Giãn",
        category: createdCats[2]._id,
        brand: "DENIM LAB",
        originalPrice: 389000,
        salePrice: 389000,
        stock: 35,
        sizes: ["29", "30", "31", "32"],
        image: "https://images.unsplash.com/photo-1542272604-780c96856592?w=600",
        description: "Vải jean denim nhập khẩu wash màu xanh khói bụi bặm cá tính, sợi spandex co giãn giúp thoải mái vận động cả ngày.",
        rating: 4.8,
        isFeatured: false,
      },
      {
        name: "Quần Kaki Nam Dáng Suông Vintage Form Chuẩn",
        category: createdCats[3]._id,
        brand: "MENSTYLE",
        originalPrice: 299000,
        salePrice: 299000,
        stock: 50,
        sizes: ["M", "L", "XL"],
        image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600",
        description: "Chất vải kaki chéo mềm mại giữ phom, tone màu be vintage nhã nhặn dễ phối với giày sneaker và áo sơ mi.",
        rating: 4.9,
        isFeatured: false,
      },
      {
        name: "Quần Short Đũi Nam Dạo Phố Thoáng Khí",
        category: createdCats[3]._id,
        brand: "SUMMER VIBE",
        originalPrice: 159000,
        salePrice: 159000,
        stock: 70,
        sizes: ["M", "L", "XL"],
        image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600",
        description: "Chất đũi xước tự nhiên thoáng mát nhẹ tênh, cạp chun có dây rút thể thao, hai túi bên sâu đựng điện thoại tiện lợi.",
        rating: 4.8,
        isFeatured: false,
      },
      {
        name: "Áo Khoác Blazer Nam 2 Cúc Phong Cách Hàn Quốc",
        category: createdCats[4]._id,
        brand: "SEOUL HOMME",
        originalPrice: 790000,
        salePrice: 589000,
        stock: 25,
        sizes: ["M", "L", "XL"],
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600",
        description: "Thiết kế blazer hiện đại 2 cúc, ve áo xuôi thanh lịch, lót lụa mềm êm ái, đệm vai tinh tế giúp tôn bờ vai nam tính vững chãi.",
        rating: 5.0,
        isFeatured: true,
      },
      {
        name: "Áo Khoác Gió Bomber Nam 2 Lớp Chống Nước Nhẹ",
        category: createdCats[4]._id,
        brand: "URBAN STREET",
        originalPrice: 359000,
        salePrice: 359000,
        stock: 35,
        sizes: ["M", "L", "XL", "2XL"],
        image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=600",
        description: "Vải dù gió tráng nano kháng nước nhẹ, chắn gió chống bụi hiệu quả, khóa kéo kim loại cao cấp dập chìm logo.",
        rating: 4.8,
        isFeatured: false,
      },
      {
        name: "Thắt Lưng Nam Da Bò Thật Khóa Tự Động Sang Trọng",
        category: createdCats[5]._id,
        brand: "GENTLEMAN",
        originalPrice: 239000,
        salePrice: 239000,
        stock: 55,
        sizes: ["Freesize"],
        image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600",
        description: "Da bò thật nguyên tấm 2 lớp mềm dẻo không gãy gập, đầu khóa hợp kim đúc mạ chrome chống xước, cơ chế bấm ray tự động chuẩn từng centimet.",
        rating: 4.9,
        isFeatured: false,
      },
      {
        name: "Ví Da Nam Dáng Ngang Nhỏ Gọn Da Bò Sáp",
        category: createdCats[5]._id,
        brand: "GENTLEMAN",
        originalPrice: 219000,
        salePrice: 219000,
        stock: 40,
        sizes: ["Freesize"],
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600",
        description: "Da bò sáp mộc càng dùng càng bóng đẹp, thiết kế mỏng nhẹ 8 ngăn thẻ và ngăn tiền rộng rãi, không cộm túi quần.",
        rating: 4.9,
        isFeatured: false,
      },
    ];

    const createdProds = await Product.insertMany(productsData);
    console.log(`✅ Đã nạp ${createdProds.length} sản phẩm Thời Trang Nam.`);

    // 5. Tạo các đơn hàng mẫu để Admin Dashboard hiển thị thống kê
    console.log("📦 Đang tạo đơn hàng mẫu cho Admin...");
    await Order.create({
      orderCode: "MS10023456",
      user: customerUser1._id,
      customerName: "Nguyễn Văn Hùng",
      customerPhone: "0987654321",
      customerEmail: "hung.nguyen@gmail.com",
      shippingAddress: "Số 123 Đường Nguyễn Ái Quốc, TP. Biên Hòa, Đồng Nai",
      items: [
        {
          productId: createdProds[0]._id,
          name: createdProds[0].name,
          quantity: 1,
          price: createdProds[0].salePrice,
          size: "L",
          image: createdProds[0].image,
        },
        {
          productId: createdProds[6]._id,
          name: createdProds[6].name,
          quantity: 1,
          price: createdProds[6].salePrice,
          size: "31",
          image: createdProds[6].image,
        },
      ],
      shippingFee: 25000,
      totalAmount: createdProds[0].salePrice + createdProds[6].salePrice + 25000,
      paymentMethod: "VIETQR",
      paymentStatus: "PAID",
      orderStatus: "CONFIRMED",
      note: "Giao trong giờ hành chính giúp mình",
    });

    await Order.create({
      orderCode: "MS10023457",
      customerName: "Trần Minh Quân",
      customerPhone: "0912345678",
      customerEmail: "quan.tran@gmail.com",
      shippingAddress: "45 Lê Duẩn, Quận 1, TP. Hồ Chí Minh",
      items: [
        {
          productId: createdProds[1]._id,
          name: createdProds[1].name,
          quantity: 2,
          price: createdProds[1].salePrice,
          size: "XL",
          image: createdProds[1].image,
        },
      ],
      shippingFee: 25000,
      totalAmount: createdProds[1].salePrice * 2 + 25000,
      paymentMethod: "COD",
      paymentStatus: "UNPAID",
      orderStatus: "PENDING",
      note: "Gọi trước khi giao hàng 15 phút",
    });

    await Order.create({
      orderCode: "MS10023458",
      user: customerUser2._id,
      customerName: "Lê Hoàng Nam",
      customerPhone: "0934567890",
      customerEmail: "nam.le@gmail.com",
      shippingAddress: "88 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
      items: [
        {
          productId: createdProds[4]._id,
          name: createdProds[4].name,
          quantity: 1,
          price: createdProds[4].salePrice,
          size: "L",
          image: createdProds[4].image,
        },
        {
          productId: createdProds[12]._id,
          name: createdProds[12].name,
          quantity: 1,
          price: createdProds[12].salePrice,
          size: "Tiêu chuẩn",
          image: createdProds[12].image,
        },
      ],
      shippingFee: 0,
      totalAmount: createdProds[4].salePrice + createdProds[12].salePrice,
      paymentMethod: "VIETQR",
      paymentStatus: "PAID",
      orderStatus: "COMPLETED",
      note: "Đóng gói hộp quà tặng sang trọng",
    });

    await Order.create({
      orderCode: "MS10023459",
      user: customerUser3._id,
      customerName: "Đặng Quốc Anh",
      customerPhone: "0918765432",
      customerEmail: "quocanh.dang@gmail.com",
      shippingAddress: "15 Cầu Giấy, Hà Nội",
      items: [
        {
          productId: createdProds[2]._id,
          name: createdProds[2].name,
          quantity: 2,
          price: createdProds[2].salePrice,
          size: "M",
          image: createdProds[2].image,
        },
      ],
      shippingFee: 25000,
      totalAmount: createdProds[2].salePrice * 2 + 25000,
      paymentMethod: "COD",
      paymentStatus: "PAID",
      orderStatus: "SHIPPING",
      note: "Giao giờ hành chính",
    });

    // 6. Nạp Mã Giảm Giá (Coupons)
    console.log("🎟️ Đang nạp mã giảm giá mẫu...");
    await Coupon.create([
      {
        code: "MENSTYLE10",
        discountType: "PERCENT",
        discountValue: 10,
        minOrderValue: 300000,
        maxUsage: 100,
        expiryDate: new Date("2026-12-31"),
        isActive: true,
      },
      {
        code: "VIP50K",
        discountType: "FIXED",
        discountValue: 50000,
        minOrderValue: 500000,
        maxUsage: 50,
        expiryDate: new Date("2026-12-31"),
        isActive: true,
      },
      {
        code: "FREESHIP",
        discountType: "FIXED",
        discountValue: 25000,
        minOrderValue: 250000,
        maxUsage: 200,
        expiryDate: new Date("2026-12-31"),
        isActive: true,
      },
    ]);
    console.log("✅ Đã nạp 3 mã giảm giá mẫu.");

    // 7. Nạp Bài Viết Tạp Chí Thời Trang (MENSTYLE Magazine chuẩn SEO & GEO)
    console.log("📰 Đang nạp 8 bài viết Tạp chí MENSTYLE chuẩn SEO & Google AI Overviews...");
    await Article.insertMany(articlesData);
    console.log(`✅ Đã nạp thành công ${articlesData.length} bài viết Tạp chí MENSTYLE chuẩn SEO.`);

    console.log("====================================================");
    console.log("🎉 NẠP TOÀN BỘ DỮ LIỆU THỜI TRANG NAM THÀNH CÔNG!");
    console.log("====================================================");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi Seeder:", error.message);
    process.exit(1);
  }
};

seedData();
