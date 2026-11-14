const Article = require("../models/Article");

// Dữ liệu bài viết mẫu mặc định (Tự động nạp vào DB nếu rỗng)
const DEFAULT_INITIAL_ARTICLES = [
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
];

// BUG-04: KHÔNG tự nạp lại bài viết mỗi request (làm "hồi sinh" bài admin đã xóa).
// Chỉ nạp mẫu khi bật AUTO_SEED_ARTICLES=true, và tối đa 1 lần cho mỗi lần khởi động server.
let articleSeedChecked = false;
async function autoSeedIfEmpty() {
  if (articleSeedChecked || process.env.AUTO_SEED_ARTICLES !== "true") return;
  articleSeedChecked = true;
  try {
    const count = await Article.countDocuments();
    if (count === 0) {
      console.log("📰 MongoDB chưa có bài viết. Đang tự động nạp 8 bài viết MENSTYLE Magazine...");
      await Article.insertMany(DEFAULT_INITIAL_ARTICLES);
      console.log("✅ Tự động nạp 8 bài viết hoàn tất!");
    }
  } catch (err) {
    console.warn("Lỗi autoSeedIfEmpty (không ảnh hưởng):", err.message);
  }
}

// Hàm chuyển tiêu đề tiếng Việt thành slug URL-friendly
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * @desc Lấy danh sách bài viết (Có lọc danh mục, tìm kiếm, sắp xếp & phân trang)
 * @route GET /api/articles
 * @access Public
 */
exports.getArticles = async (req, res) => {
  try {
    await autoSeedIfEmpty();
    const { category, search, sort, page = 1, limit = 9 } = req.query;

    let query = { status: "PUBLISHED" };

    if (typeof category === "string" && category.trim() !== "" && category !== "Tất cả") {
      query.category = category;
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      const safeSearch = search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const searchRegex = new RegExp(safeSearch, "i");
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { author: searchRegex },
      ];
    }

    let sortOptions = { createdAt: -1 }; // Mặc định mới nhất
    if (sort === "popular") {
      sortOptions = { views: -1, createdAt: -1 };
    } else if (sort === "oldest") {
      sortOptions = { createdAt: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 9), 50);
    const skip = (pageNum - 1) * limitNum;

    const total = await Article.countDocuments(query);
    const articles = await Article.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: articles,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    console.error("Lỗi getArticles:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy danh sách bài viết",
    });
  }
};

/**
 * @desc Lấy top bài viết nổi bật cho khu vực "ĐÁNG CHÚ Ý" (1 bài lớn + 2 bài nhỏ)
 * @route GET /api/articles/featured
 * @access Public
 */
exports.getFeaturedArticles = async (req, res) => {
  try {
    await autoSeedIfEmpty();
    let featured = await Article.find({ status: "PUBLISHED", isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(3);

    // Nếu chưa đủ 3 bài gắn isFeatured, lấy thêm các bài có lượt xem cao nhất
    if (featured.length < 3) {
      const extraCount = 3 - featured.length;
      const existingIds = featured.map((a) => a._id);
      const extra = await Article.find({
        status: "PUBLISHED",
        _id: { $nin: existingIds },
      })
        .sort({ views: -1, createdAt: -1 })
        .limit(extraCount);

      featured = [...featured, ...extra];
    }

    res.status(200).json({
      success: true,
      data: featured,
    });
  } catch (error) {
    console.error("Lỗi getFeaturedArticles:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy bài viết nổi bật",
    });
  }
};

/**
 * @desc Lấy chi tiết bài viết theo Slug + 3 bài viết liên quan cùng chuyên mục
 * @route GET /api/articles/:slug
 * @access Public
 */
exports.getArticleBySlug = async (req, res) => {
  try {
    await autoSeedIfEmpty();
    const { slug } = req.params;

    // Chỉ bài PUBLISHED mới xem được công khai (bài nháp trả 404 và không tăng lượt xem)
    const article = await Article.findOneAndUpdate(
      { slug: String(slug).toLowerCase(), status: "PUBLISHED" },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết theo đường dẫn này",
      });
    }

    // Lấy 3 bài viết liên quan cùng danh mục
    const relatedArticles = await Article.find({
      status: "PUBLISHED",
      category: article.category,
      _id: { $ne: article._id },
    })
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({
      success: true,
      data: article,
      related: relatedArticles,
    });
  } catch (error) {
    console.error("Lỗi getArticleBySlug:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin chi tiết bài viết",
    });
  }
};

/**
 * @desc Tạo bài viết mới (Dành riêng cho Admin)
 * @route POST /api/articles
 * @access Private (Admin)
 */
exports.createArticle = async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      excerpt,
      content,
      image,
      author,
      tags,
      readTime,
      isFeatured,
      status,
    } = req.body;

    if (!title || !excerpt || !content || !image) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ tiêu đề, mô tả ngắn, nội dung và ảnh đại diện",
      });
    }

    let finalSlug = slug ? slugify(slug) : slugify(title);

    // Kiểm tra trùng slug
    const existing = await Article.findOne({ slug: finalSlug });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const article = await Article.create({
      title,
      slug: finalSlug,
      category: category || "Xu hướng thời trang",
      excerpt,
      content,
      image,
      author: author || "MENSTYLE Editorial Team",
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : [],
      readTime: readTime || "5 phút đọc",
      isFeatured: Boolean(isFeatured),
      status: status || "PUBLISHED",
    });

    res.status(201).json({
      success: true,
      message: "Tạo bài viết mới thành công!",
      data: article,
    });
  } catch (error) {
    console.error("Lỗi createArticle:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo bài viết",
    });
  }
};

/**
 * @desc Cập nhật bài viết (Dành riêng cho Admin)
 * @route PUT /api/articles/:id
 * @access Private (Admin)
 */
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.title && !updateData.slug) {
      updateData.slug = slugify(updateData.title);
    } else if (updateData.slug) {
      updateData.slug = slugify(updateData.slug);
    }

    if (typeof updateData.tags === "string") {
      updateData.tags = updateData.tags.split(",").map((t) => t.trim());
    }

    const article = await Article.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết để cập nhật",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật bài viết thành công!",
      data: article,
    });
  } catch (error) {
    console.error("Lỗi updateArticle:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật bài viết",
    });
  }
};

/**
 * @desc Xóa bài viết (Dành riêng cho Admin)
 * @route DELETE /api/articles/:id
 * @access Private (Admin)
 */
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết để xóa",
      });
    }

    res.status(200).json({
      success: true,
      message: `Đã xóa vĩnh viễn bài viết "${article.title}"`,
    });
  } catch (error) {
    console.error("Lỗi deleteArticle:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa bài viết",
    });
  }
};

/**
 * @desc Lấy toàn bộ bài viết trong hệ thống Admin (kể cả DRAFT)
 * @route GET /api/articles/admin/all
 * @access Private (Admin)
 */
exports.getAdminArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: articles,
      total: articles.length,
    });
  } catch (error) {
    console.error("Lỗi getAdminArticles:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách quản trị bài viết",
    });
  }
};
