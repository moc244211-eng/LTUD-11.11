require("dotenv").config();
const mongoose = require("mongoose");
const Article = require("./models/Article");

const seedArticles = async () => {
  try {
    console.log("⏳ Đang kết nối MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Đã kết nối MongoDB Atlas.");

    const count = await Article.countDocuments();
    if (count > 0) {
      console.log(`ℹ️ Hiện đã có ${count} bài viết trong MongoDB Atlas.`);
      process.exit(0);
    }

    console.log("📰 Đang nạp 8 bài viết Tạp chí MENSTYLE mẫu...");
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
    console.log("✅ Đã nạp 8 bài viết Tạp chí MENSTYLE vào MongoDB Atlas thành công.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi nạp bài viết:", error.message);
    process.exit(1);
  }
};

seedArticles();
