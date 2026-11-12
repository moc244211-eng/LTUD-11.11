require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");
const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");
const Coupon = require("./models/Coupon");
const Article = require("./models/Article");

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
      password: "AdminPassword123@",
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
    console.log(" 👑 Admin: admin@menstyle.vn / AdminPassword123@");
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
        originalPrice: 350000,
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
        originalPrice: 450000,
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
        originalPrice: 180000,
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
        originalPrice: 490000,
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
        originalPrice: 390000,
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
        originalPrice: 220000,
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
        originalPrice: 490000,
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
        originalPrice: 350000,
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
        originalPrice: 320000,
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

    // 7. Nạp Bài Viết Tạp Chí Thời Trang (MENSTYLE Magazine)
    console.log("📰 Đang nạp các bài viết Tạp chí MENSTYLE...");
    await Article.create([
      {
        title: "Xu Hướng Thời Trang Nam 2026: Phong Cách Tối Giản Minimalist & Smart Casual Lên Ngôi",
        slug: "xu-huong-thoi-trang-nam-2026-minimalist-smart-casual",
        category: "Xu hướng thời trang",
        excerpt: "Năm 2026 đánh dấu sự trở lại mạnh mẽ của vẻ đẹp tinh giản, chú trọng vào đường cắt may sắc nét, bảng màu trung tính và chất liệu tự nhiên thượng hạng.",
        content: `
<h2>1. Sự Trỗi Dậy Của Chủ Nghĩa Cổ Điển Tinh Giản</h2>
<p>Bước sang năm 2026, thời trang nam chứng kiến bước ngoặt rõ nét khi người tiêu dùng thông thái dần rời xa những họa tiết sặc sỡ để tìm về những giá trị nguyên bản. Phong cách Minimalist không hề đơn điệu, mà là tuyên ngôn của sự tự tin, chú trọng vào phom dáng may đo chuẩn xác (tailoring) và bảng màu đơn sắc như be, xám khói, xanh navy và đen huyền bí.</p>

<p>Một chiếc áo sơ mi poplin hoặc áo thun Supima cotton đi kèm quần âu xếp ly nhẹ chính là công thức nền tảng giúp phái mạnh khẳng định gu thẩm mỹ tinh tế trong mọi hoàn cảnh.</p>

<h2>2. Bảng Màu Trung Tính Định Hình Phong Thái</h2>
<p>Bảng màu chủ đạo của năm hướng đến sự êm dịu của thiên nhiên: màu cát sa mạc (sand), màu xanh rêu quân đội trầm (olive drab), và tông than chì (graphite). Những sắc thái này mang lại cảm giác chững chạc, dễ dàng phối ghép theo phong cách tone-sur-tone mà không lo lỗi mốt.</p>

<blockquote>"Phong cách đích thực không phải là để người khác chú ý ngay lập tức, mà là để người ta nhớ mãi không quên." - Giorgio Armani</blockquote>

<h2>3. Xu Hướng Kết Hợp Smart Casual Linh Hoạt</h2>
<p>Ranh giới giữa trang phục công sở và trang phục dạo phố đang dần mờ đi. Thay vì comple gò bó, quý ông hiện đại ưa chuộng blazer không lót mỏng nhẹ phối cùng áo thun cổ tròn và quần tây cạp cao. Đây là diện mạo hoàn hảo cho các buổi họp sáng lẫn bữa tiệc cocktail buổi tối.</p>
        `,
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200",
        author: "Hoàng Nam - Giám đốc Sáng tạo",
        tags: ["Xu hướng 2026", "Minimalist", "Smart Casual", "Thời trang nam"],
        views: 2840,
        readTime: "6 phút đọc",
        isFeatured: true,
        status: "PUBLISHED",
      },
      {
        title: "5 Bí Quyết Phối Áo Sơ Mi Oxford Chuẩn Quý Ông Thành Đạt",
        slug: "5-bi-quyet-phoi-ao-so-mi-oxford-chuan-quy-ong",
        category: "Bí quyết phối đồ",
        excerpt: "Áo sơ mi Oxford dệt sợi rổ kinh điển là món đồ không thể thiếu trong tủ đồ nam. Khám phá 5 cách biến tấu từ thanh lịch đến năng động.",
        content: `
<h2>1. Hiểu Đúng Về Chất Liệu Vải Dệt Oxford</h2>
<p>Vải Oxford được dệt từ hai loại sợi đan xen đặc trưng, tạo nên bề mặt có chiều sâu, dày dặn vừa phải và cực kỳ thoáng khí. Khác với vải poplin bóng bẩy công sở, sơ mi Oxford sở hữu nét phóng khoáng tự nhiên nhưng vẫn giữ trọn nét chỉn chu.</p>

<h2>2. Phối Cùng Quần Tây Xếp Ly Xanh Navy</h2>
<p>Một chiếc sơ mi Oxford trắng phối cùng quần âu xanh navy là quy chuẩn kinh điển của phong cách Ivy League. Hãy xắn tay áo lên hai nếp và kết hợp cùng đồng hồ mặt thép không gỉ để tôn lên vẻ rắn rỏi.</p>

<h2>3. Mặc Khoác Ngoài Áo Thun Basic Trắng</h2>
<p>Mở toàn bộ nút áo Oxford màu xanh baby blue và khoác bên ngoài chiếc áo thun trắng trơn. Đi cùng quần kaki chinos và giày sneaker trắng tối giản để có set đồ cuối tuần hoàn hảo.</p>
        `,
        image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
        author: "Trần Minh - Stylist MENSTYLE",
        tags: ["Sơ mi Oxford", "Phối đồ nam", "Ivy League"],
        views: 1950,
        readTime: "4 phút đọc",
        isFeatured: true,
        status: "PUBLISHED",
      },
      {
        title: "Nghệ Thuật Xây Dựng Capsule Wardrobe Tối Giản Cho Quý Ông Bận Rộn",
        slug: "nghe-thuat-xay-dung-capsule-wardrobe-toi-gian",
        category: "Phong cách nam",
        excerpt: "Chỉ với 15 món đồ cốt lõi, bạn hoàn toàn có thể tạo nên hơn 40 outfit khác biệt cho cả tháng làm việc và du lịch.",
        content: `
<h2>1. Khái Niệm Tủ Đồ Nhộng (Capsule Wardrobe)</h2>
<p>Capsule Wardrobe là triết lý thời trang hướng đến việc sở hữu một số lượng trang phục vừa đủ nhưng có tính linh hoạt cao nhất. Mục tiêu là tiết kiệm thời gian chọn đồ mỗi sáng và luôn giữ được diện mạo chỉn chu nhất quán.</p>

<h2>2. Danh Sách 15 Món Đồ Cốt Lõi Tại MENSTYLE</h2>
<ul>
  <li><strong>3 Áo Sơ Mi:</strong> 1 Trắng Oxford, 1 Xanh Nhạt, 1 Đen Khuy Ngọc Trai.</li>
  <li><strong>4 Áo Thun & Polo:</strong> 2 Áo thun Supima (Trắng/Đen), 2 Áo Polo dệt kim (Xám/Navy).</li>
  <li><strong>3 Quần Dài:</strong> 1 Quần tây âu may đo, 1 Quần Chinos Kaki be, 1 Quần Jeans Selvedge đậm màu.</li>
  <li><strong>2 Áo Khoác:</strong> 1 Blazer đen/navy, 1 Bomber da lộn hoặc gió dù.</li>
  <li><strong>3 Đôi Giày:</strong> 1 Loafer da bò, 1 Sneaker trắng tối giản, 1 Chelsea Boots.</li>
</ul>
        `,
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
        author: "Đức Trí - Senior Editor",
        tags: ["Capsule Wardrobe", "Phong cách sống", "Tối giản"],
        views: 1680,
        readTime: "5 phút đọc",
        isFeatured: true,
        status: "PUBLISHED",
      },
      {
        title: "Hướng Dẫn Chọn Size Quần Tây & Quần Jeans Vừa Vặn Từng Điểm Cơ Thể",
        slug: "huong-dan-chon-size-quan-tay-quan-jeans-chuan-voc-dang",
        category: "Mẹo chọn trang phục",
        excerpt: "3 thông số quan trọng nhất: Vòng bụng, Đũng quần và Chiều dài ống gấu. Đừng để một chiếc quần sai size làm hỏng cả tỷ lệ cơ thể.",
        content: `
<h2>1. Tầm Quan Trọng Của Độ Rơi Của Gấu Quần (The Break)</h2>
<p>Gấu quần chạm vào giày như thế nào quyết định phong thái của bạn. No-break (gấu vừa chạm nhẹ cổ giày) mang lại nét trẻ trung năng động, trong khi Half-break (gấu gãy một nếp nhẹ) tạo vẻ lịch lãm trang trọng.</p>
<h2>2. Vòng Eo và Vòng Hông</h2>
<p>Quần âu may đo chuẩn không cần phải dùng thắt lưng quá chặt. Khoảng cách lý tưởng giữa lưng quần và bụng khi đứng thẳng là vừa khít 2 ngón tay luồn vào.</p>
        `,
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800",
        author: "Đội ngũ Đo may MENSTYLE",
        tags: ["Mẹo chọn size", "Quần âu", "Quần Jean"],
        views: 1220,
        readTime: "4 phút đọc",
        isFeatured: false,
        status: "PUBLISHED",
      },
      {
        title: "Bí Quyết Giặt Ủi Và Bảo Quản Áo Sơ Mi & Đồ Len Cao Cấp",
        slug: "bi-quyet-giat-ui-va-bao-quan-so-mi-do-len-cao-cap",
        category: "Chăm sóc và bảo quản",
        excerpt: "Làm thế nào để chiếc áo sơ mi giữ nguyên phom cổ sắc nét và áo len không bị xù lông qua nhiều năm sử dụng?",
        content: `
<h2>1. Nhiệt Độ Nước Và Chế Độ Giặt</h2>
<p>Luôn giặt sơ mi và áo len bằng nước lạnh dưới 30°C. Nước nóng là kẻ thù số một khiến sợi vải co rút và mất phom dáng ban đầu.</p>
<h2>2. Cách Treo Và Gấp Đồ Chuẩn Savile Row</h2>
<p>Tuyệt đối không treo áo len bằng móc vì trọng lượng sẽ làm dão phần vai áo. Ngược lại, sơ mi may đo cần được treo trên móc gỗ bản to để giữ phom cầu vai đứng dáng.</p>
        `,
        image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800",
        author: "MENSTYLE Care",
        tags: ["Bảo quản quần áo", "Mẹo giặt ủi", "Chăm sóc đồ len"],
        views: 940,
        readTime: "5 phút đọc",
        isFeatured: false,
        status: "PUBLISHED",
      },
      {
        title: "MENSTYLE Ra Mắt Bộ Sưu Tập Xuân Hè 2026: 'Urban Elegance'",
        slug: "menstyle-ra-mat-bo-suu-tap-xuan-he-2026-urban-elegance",
        category: "Tin tức MENSTYLE",
        excerpt: "Lấy cảm hứng từ nhịp sống hiện đại của các đô thị quốc tế, BST mới tôn vinh sự thoải mái, phóng khoáng cùng chất liệu Linen và Lụa tơ tằm dệt cao cấp.",
        content: `
<h2>1. Tinh Thần 'Urban Elegance'</h2>
<p>Bộ sưu tập mang thông điệp về sự tự do và sang trọng thầm lặng. Từng thiết kế đều được kiểm định nghiêm ngặt từ sợi vải đến đường may thủ công tỉ mỉ.</p>
<h2>2. Trải Nghiệm Mua Sắm Tại Showroom & Online</h2>
<p>Khách hàng có thể trải nghiệm toàn bộ dòng sản phẩm mới tại website men-style.onrender.com cùng chính sách giao hàng miễn phí và đổi trả tận nơi 7 ngày.</p>
        `,
        image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800",
        author: "Ban Biên Tập MENSTYLE",
        tags: ["BST Mới", "Urban Elegance", "Sự kiện"],
        views: 3120,
        readTime: "3 phút đọc",
        isFeatured: false,
        status: "PUBLISHED",
      },
      {
        title: "Áo Polo Knitwear: Làn Gió Mới Trong Tủ Đồ Quý Ông Hiện Đại",
        slug: "ao-polo-knitwear-lan-gio-moi-trong-tu-do-quy-ong",
        category: "Xu hướng thời trang",
        excerpt: "Không còn là trang phục thể thao thuần túy, polo dệt kim mỏng nhẹ mang đến thần thái lịch thiệp chuẩn phong cách quý ông nước Ý.",
        content: `
<h2>1. Điểm Khác Biệt Của Polo Dệt Kim (Knitwear Polo)</h2>
<p>Được dệt từ sợi cotton chải kỹ hoặc len merino mỏng, áo polo dệt kim có độ rủ tự nhiên ôm nhẹ lấy khuôn ngực và bắp tay, tạo nên vẻ nam tính đầy tinh tế.</p>
<h2>2. Phối Đồ Chuẩn Riviera Style</h2>
<p>Kết hợp cùng quần tây ống suông xếp ly màu kem và giày lười da lộn. Đừng quên một cặp kính râm phi công để hoàn thiện phong thái mùa hè.</p>
        `,
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800",
        author: "Hoàng Nam - Giám đốc Sáng tạo",
        tags: ["Polo Dệt Kim", "Knitwear", "Phong cách Ý"],
        views: 1450,
        readTime: "4 phút đọc",
        isFeatured: false,
        status: "PUBLISHED",
      },
      {
        title: "Phong Cách Lịch Lãm Cho Buổi Gặp Gỡ Đối Tác & Hẹn Hò Tối",
        slug: "phong-cach-lich-lam-cho-buoi-gap-go-doi-tac-va-hen-ho",
        category: "Phong cách nam",
        excerpt: "Làm thế nào để chuyển đổi mượt mà từ bộ đồ công sở ban ngày sang phong thái quyến rũ cho buổi tối lãng mạn?",
        content: `
<h2>1. Đơn Giản Hóa Chi Tiết</h2>
<p>Tháo cà vạt, mở 1 đến 2 cúc cổ áo sơ mi và thay đôi giày công sở bóng lộn bằng đôi giày Loafer da đen hoặc da nâu trầm.</p>
<h2>2. Sức Hút Của Nước Hoa & Phụ Kiện Tinh Tế</h2>
<p>Một hương nước hoa trầm ấm hương gỗ đàn hương và da thuộc sẽ là điểm nhấn khó quên tạo nên sự lôi cuốn đầy nam tính.</p>
        `,
        image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800",
        author: "Đức Trí - Senior Editor",
        tags: ["Hẹn hò", "Lịch lãm", "Phong cách quý ông"],
        views: 1820,
        readTime: "5 phút đọc",
        isFeatured: false,
        status: "PUBLISHED",
      }
    ]);
    console.log("✅ Đã nạp 8 bài viết Tạp chí MENSTYLE mẫu chuẩn SEO.");

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
