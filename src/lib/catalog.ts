// Category structure & mock product catalog for Intech Computer Shop.
// Replace with real DB-backed data when admin & cloud are added.

export type SubCategory = { slug: string; name: string };
export type Category = {
  slug: string;
  name: string;
  icon: string; // lucide icon name
  featured?: boolean;
  subs?: SubCategory[];
};

export const CATEGORIES: Category[] = [
  {
    slug: "laptops-desktops",
    name: "Laptops & Desktops",
    icon: "Laptop",
    featured: true,
    subs: [
      { slug: "lenovo-laptops", name: "Lenovo Laptops" },
      { slug: "hp-laptops", name: "HP Laptops" },
      { slug: "dell-laptops", name: "Dell Laptops" },
      { slug: "refurbished-laptops", name: "Refurbished Laptops" },
      { slug: "all-in-one-desktops", name: "All-in-One Desktops" },
      { slug: "servers", name: "Servers" },
    ],
  },
  {
    slug: "tvs",
    name: "TVs & TV Accessories",
    icon: "Tv",
    featured: true,
    subs: [
      { slug: "smart-tvs", name: "Smart TVs" },
      { slug: "firestick", name: "Amazon FireStick 4K" },
    ],
  },
  { slug: "phones-tablets", name: "Phones & Tablets", icon: "Smartphone" },
  {
    slug: "computer-accessories",
    name: "Laptop & Computer Accessories",
    icon: "Keyboard",
    subs: [
      { slug: "laptop-bags", name: "Laptop Bags" },
      { slug: "keyboards", name: "Keyboards (incl. Wireless)" },
      { slug: "mouse", name: "Mouse" },
      { slug: "laptop-batteries", name: "Laptop Batteries" },
    ],
  },
  {
    slug: "data-storage",
    name: "Computer Data Storage",
    icon: "HardDrive",
    subs: [
      { slug: "external-hdd", name: "External Hard Drives" },
      { slug: "usb-flash", name: "USB Flash Drives" },
      { slug: "memory-cards", name: "Memory Cards" },
      { slug: "ssd", name: "Solid State Drives (SSD)" },
    ],
  },
  {
    slug: "printers",
    name: "Printers & Accessories",
    icon: "Printer",
    subs: [
      { slug: "all-in-one-printers", name: "All-in-One Printers" },
      { slug: "ink-toners", name: "Printer Ink & Toners" },
      { slug: "epson-printers", name: "Epson Printers" },
    ],
  },
  {
    slug: "cctv-networking",
    name: "CCTV & Networking",
    icon: "Cctv",
    subs: [
      { slug: "routers", name: "Routers" },
      { slug: "ip-cameras", name: "IP Cameras" },
    ],
  },
  {
    slug: "scanners-projectors",
    name: "Scanners & Projectors",
    icon: "ScanLine",
    subs: [{ slug: "epson-projectors", name: "Epson Projectors" }],
  },
  { slug: "gaming", name: "Gaming", icon: "Gamepad2" },
  { slug: "antivirus-software", name: "Antivirus & Software", icon: "ShieldCheck" },
  {
    slug: "audio",
    name: "Audio & Accessories",
    icon: "Headphones",
    subs: [{ slug: "earpods", name: "Earpods / Earphones" }],
  },
  { slug: "ups", name: "UPS & Power Backup", icon: "BatteryCharging" },
  { slug: "repairs", name: "Repairs & Services", icon: "Wrench" },
  { slug: "ac", name: "Air Conditioners", icon: "Snowflake" },
  { slug: "fridges", name: "Refrigerators", icon: "Refrigerator" },
];

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string; // category slug
  sub?: string; // sub slug
  price: number; // KES
  oldPrice?: number; // KES (for discount badge)
  image: string; // emoji or unicode shape used as visual fallback
  bg: string; // tailwind bg class for the visual tile
  rating: number;
  reviews: number;
  stock: number;
  badge?: "new" | "hot" | "flash" | "best";
  specs?: Record<string, string>;
  description?: string;
  imageUrl?: string; // optional real image; falls back to emoji tile
};

// Visual placeholder approach: each product gets a colored tile + emoji mark.
// Generates a clean grid look without needing dozens of generated images.
function p(
  id: string,
  name: string,
  brand: string,
  category: string,
  sub: string | undefined,
  price: number,
  oldPrice: number | undefined,
  image: string,
  bg: string,
  rating: number,
  reviews: number,
  stock: number,
  badge?: Product["badge"],
  specs?: Record<string, string>,
): Product {
  return {
    id,
    name,
    brand,
    category,
    sub,
    price,
    oldPrice,
    image,
    bg,
    rating,
    reviews,
    stock,
    badge,
    specs,
    description:
      "Premium grade " +
      name +
      " — backed by Intech Computer Shop's 1-year warranty, free Nairobi delivery, and nationwide courier shipping.",
  };
}

const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

const withImage = (prod: Product, url: string): Product => ({ ...prod, imageUrl: url });

export const PRODUCTS: Product[] = [
  withImage(p("lp-01", "Lenovo ThinkPad E14 Core i5 11th Gen", "Lenovo", "laptops-desktops", "lenovo-laptops", 78500, 92000, "💻", "bg-orange-50", 4.7, 128, 12, "best", { RAM: "8GB", Storage: "512GB SSD", Screen: "14\"", CPU: "Intel i5" }), IMG("1496181133206-80ce9b88a853")),
  withImage(p("lp-02", "Lenovo IdeaPad 3 Ryzen 5", "Lenovo", "laptops-desktops", "lenovo-laptops", 62000, 71000, "💻", "bg-red-50", 4.5, 86, 18, "hot", { RAM: "8GB", Storage: "256GB SSD", Screen: "15.6\"", CPU: "Ryzen 5" }), IMG("1525547719571-a2d4ac8945e2")),
  withImage(p("lp-03", "Lenovo Legion 5 Gaming", "Lenovo", "laptops-desktops", "lenovo-laptops", 165000, 189000, "🎮", "bg-amber-50", 4.9, 54, 5, "new", { RAM: "16GB", Storage: "1TB SSD", Screen: "15.6\"", GPU: "RTX 4060" }), IMG("1603302576837-37561b2e2302")),
  withImage(p("dt-01", "HP All-in-One 24\" Touchscreen", "HP", "laptops-desktops", "all-in-one-desktops", 98000, 115000, "🖥️", "bg-orange-50", 4.6, 41, 9, "hot"), IMG("1593640408182-31c70c8268f5")),
  withImage(p("dt-02", "Dell PowerEdge T40 Server", "Dell", "laptops-desktops", "servers", 145000, undefined, "🗄️", "bg-stone-100", 4.8, 22, 4), IMG("1558494949-ef010cbdcc31")),

  withImage(p("tv-01", "Hisense 43\" Smart TV 4K UHD", "Hisense", "tvs", "smart-tvs", 38500, 45000, "📺", "bg-red-50", 4.6, 210, 24, "hot", { Screen: "43\"", Resolution: "4K UHD", OS: "Vidaa" }), IMG("1593359677879-a4bb92f829d1")),
  withImage(p("tv-02", "TCL 55\" QLED Google TV", "TCL", "tvs", "smart-tvs", 72000, 85000, "📺", "bg-orange-50", 4.7, 156, 11, "best", { Screen: "55\"", Resolution: "4K QLED", OS: "Google TV" }), IMG("1577979749830-f1d742b96791")),
  withImage(p("tv-03", "Vitron 32\" HD Smart TV", "Vitron", "tvs", "smart-tvs", 17500, 21000, "📺", "bg-amber-50", 4.4, 320, 40, "flash", { Screen: "32\"", Resolution: "HD" }), IMG("1461151304267-38535e780c79")),
  withImage(p("tv-04", "Amazon FireStick 4K Max", "Amazon", "tvs", "firestick", 8500, 10500, "🔥", "bg-red-50", 4.8, 94, 30, "new"), IMG("1593784991095-a205069470b6")),

  withImage(p("ph-01", "Samsung Galaxy A15 128GB", "Samsung", "phones-tablets", undefined, 22500, 26000, "📱", "bg-orange-50", 4.5, 180, 22, "hot"), IMG("1511707171634-5f897ff02aa9")),
  withImage(p("ph-02", "iPad 10th Gen 64GB WiFi", "Apple", "phones-tablets", undefined, 58000, 64000, "📱", "bg-stone-100", 4.9, 67, 7, "best"), IMG("1561154464-82e9adf32764")),
  withImage(p("ph-03", "Tecno Spark 20 256GB", "Tecno", "phones-tablets", undefined, 18900, 22000, "📱", "bg-amber-50", 4.4, 240, 35, "flash"), IMG("1592750475338-74b7b21085ab")),

  withImage(p("ac-01", "HP Laptop Backpack 15.6\"", "HP", "computer-accessories", "laptop-bags", 2200, 2800, "🎒", "bg-orange-50", 4.6, 410, 80), IMG("1553062407-98eeb64c6a62")),
  withImage(p("ac-02", "Logitech K380 Wireless Keyboard", "Logitech", "computer-accessories", "keyboards", 4500, 5400, "⌨️", "bg-red-50", 4.8, 220, 40, "best"), IMG("1587829741301-dc798b83add3")),
  withImage(p("ac-03", "Logitech M170 Wireless Mouse", "Logitech", "computer-accessories", "mouse", 950, 1300, "🖱️", "bg-amber-50", 4.7, 530, 120, "flash"), IMG("1527864550417-7fd91fc51a46")),
  withImage(p("ac-04", "Lenovo ThinkPad Battery 6-Cell", "Lenovo", "computer-accessories", "laptop-batteries", 5800, 7000, "🔋", "bg-stone-100", 4.5, 38, 14), IMG("1609592424823-2dca1f1f1a8f")),

  withImage(p("st-01", "Seagate 1TB External HDD", "Seagate", "data-storage", "external-hdd", 6800, 8200, "💾", "bg-orange-50", 4.7, 312, 60, "best"), IMG("1531492746076-161ca9bcad58")),
  withImage(p("st-02", "SanDisk 64GB USB 3.0", "SanDisk", "data-storage", "usb-flash", 950, 1300, "🔌", "bg-red-50", 4.8, 480, 200, "flash"), IMG("1618410320928-25228d811631")),
  withImage(p("st-03", "SanDisk 128GB Memory Card", "SanDisk", "data-storage", "memory-cards", 2200, 2800, "💳", "bg-amber-50", 4.7, 260, 90), IMG("1601132359864-c9b04157a1d9")),
  withImage(p("st-04", "Samsung 970 EVO 500GB SSD", "Samsung", "data-storage", "ssd", 9800, 11500, "⚡", "bg-stone-100", 4.9, 145, 25, "new"), IMG("1597872200969-2b65d56bd16b")),

  withImage(p("pr-01", "HP DeskJet 2710 All-in-One", "HP", "printers", "all-in-one-printers", 14500, 17000, "🖨️", "bg-orange-50", 4.5, 88, 12, "hot"), IMG("1612815154858-60aa4c59eaa6")),
  withImage(p("pr-02", "Epson L3250 EcoTank", "Epson", "printers", "epson-printers", 32000, 36500, "🖨️", "bg-red-50", 4.8, 120, 18, "best"), IMG("1563770660941-20978e870e26")),
  withImage(p("pr-03", "HP 680 Black Ink Cartridge", "HP", "printers", "ink-toners", 1800, 2200, "🎨", "bg-amber-50", 4.6, 410, 150), IMG("1625961332771-3f40b0e2bdcf")),

  withImage(p("cn-01", "Tenda N300 WiFi Router", "Tenda", "cctv-networking", "routers", 2400, 3000, "📶", "bg-orange-50", 4.5, 520, 150, "flash"), IMG("1606904825846-647eb07f5be2")),
  withImage(p("cn-02", "Hikvision 2MP IP Camera", "Hikvision", "cctv-networking", "ip-cameras", 6500, 7800, "📷", "bg-red-50", 4.7, 88, 20, "hot"), IMG("1557324232-b8917d3c3dcb")),

  withImage(p("sp-01", "Epson EB-X06 XGA Projector", "Epson", "scanners-projectors", "epson-projectors", 68000, 78000, "📽️", "bg-stone-100", 4.7, 31, 6, "new"), IMG("1626379953822-baec19c3accd")),

  withImage(p("gm-01", "PlayStation 5 Slim Disc", "Sony", "gaming", undefined, 78000, 89000, "🎮", "bg-red-50", 4.9, 64, 8, "hot"), IMG("1606813907291-d86efa9b94db")),
  withImage(p("av-01", "Kaspersky Total Security 1Yr", "Kaspersky", "antivirus-software", undefined, 3500, 4200, "🛡️", "bg-orange-50", 4.6, 98, 50), IMG("1550751827-4bd374c3f58b")),
  withImage(p("au-01", "Oraimo FreePods 4 Earbuds", "Oraimo", "audio", "earpods", 4500, 5800, "🎧", "bg-amber-50", 4.7, 380, 90, "best"), IMG("1606220588913-b3aacb4d2f46")),
  withImage(p("ups-01", "Mercury 650VA UPS", "Mercury", "ups", undefined, 5400, 6500, "🔌", "bg-stone-100", 4.5, 142, 28), IMG("1558389186-a3e6e95bba5d")),
  withImage(p("ac-air-01", "Mika 12000 BTU Inverter AC", "Mika", "ac", undefined, 78000, 89000, "❄️", "bg-orange-50", 4.6, 24, 5, "new"), IMG("1631545806609-c1bbe0a7d5e6")),
  withImage(p("fr-01", "Hisense 200L Double Door Fridge", "Hisense", "fridges", undefined, 38500, 44000, "🧊", "bg-red-50", 4.6, 56, 9, "hot"), IMG("1571175443880-49e1d25b2bc5")),

  // Imported from Kilimall — Laptops & Computers
  withImage(p("kli-01", "HP ProBook 450 G8 Core i5 11th Gen 8GB/256GB SSD 15.6\" Win 11 Pro", "HP", "laptops-desktops", "hp-laptops", 33699, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/7292/goods_image/260402100614_e6e1996ece50cd05901a438598aace35.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-02", "Refurbished HP ProBook 840 i5 8GB/500GB Windows 11", "HP", "laptops-desktops", "hp-laptops", 16999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100009597/goods_image/251222100037_b9d3cc5e05d5bc22ba3142bbd7f6069e.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-03", "HP EliteBook 830 G8 Core i5 11th Gen 16GB/512GB 13.3\" FHD Win 11 Pro", "HP", "laptops-desktops", "hp-laptops", 41999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://image.kilimall.com/gallery/store/7292/202604/fdba11f54ca542768dadd916960be8f1.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-04", "Lenovo Yoga 11E 2-in-1 Touchscreen Celeron 4GB/128GB SSD 11.6\"", "Lenovo", "laptops-desktops", "lenovo-laptops", 11499, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100009581/goods_image/250913221953_aba48d6123fde31025961a2f2fe51427.jpeg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-05", "Lenovo ThinkPad X240 Core i5 8GB/256GB SSD 12.5\" HD Win 11 Pro", "Lenovo", "laptops-desktops", "lenovo-laptops", 13999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100007018/goods_image/251101100523_931b0199995c8d2dc619febe43f9cc23.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-06", "Refurbished HP ProBook 840 G1 i5 6th Gen 8GB/256GB SSD Win 11", "HP", "laptops-desktops", "hp-laptops", 17499, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100007409/goods_image/250403194017_e19f54eb039abaf93d8c8f39e1c64e13.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-07", "HP EliteBook Folio 9470M Core i7 8GB/256GB SSD 14\" Win 10", "HP", "laptops-desktops", "hp-laptops", 20999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100007409/goods_image/250403212334_ee02facf002e237f0336b6621795552c.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-08", "Dell Latitude 7480 Core i5 8GB/512GB SSD 14\" Refurbished", "Dell", "laptops-desktops", "dell-laptops", 22999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/7292/goods_image/250401215352_ec6adb47fd50ca86eb0c415e678cbcac.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-09", "HP ProBook 640 G1 Core i5 8GB/500GB HDD 14\" Refurbished", "HP", "laptops-desktops", "hp-laptops", 17199, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100007409/goods_image/250822140704_bd2294f89b42e2aec7b78a8dd9aab965.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-10", "Lenovo ThinkPad Yoga 11E 2-in-1 Touch Celeron 4GB/128GB SSD", "Lenovo", "laptops-desktops", "lenovo-laptops", 10999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100011133/goods_image/251225045248_d5d80eaa5b6c5077df0e58a966338335.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-11", "Apple MacBook Pro 13\" Core i5 2.4GHz 8GB/256GB SSD (Mid 2012)", "Apple", "laptops-desktops", "refurbished-laptops", 22850, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100005283/goods_image/250122011142_6481634ab1bebdc9d572c4c7016f72ed.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-12", "Lenovo Yoga 11E Touchscreen X360 4GB/128GB SSD 2-in-1 Refurbished", "Lenovo", "laptops-desktops", "lenovo-laptops", 10999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://image.kilimall.com/kenya/shop/store/goods/11260/2023/12/1703323322131426f1b2a3992425d81e679ae86c42f0d.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-13", "HP ProBook x360 11 EE G3 Celeron 4GB/128GB SSD 2-in-1", "HP", "laptops-desktops", "hp-laptops", 13500, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100007018/goods_image/251201100431_1a55ba86ce7c586f7d39ef623da66e78.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-14", "Lenovo ThinkPad X250 Core i5 8GB/256GB SSD 12.5\" Refurbished", "Lenovo", "laptops-desktops", "lenovo-laptops", 14499, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100003631/goods_image/241009160544_6a92cfa21e9aeaea3e7c263f243dac4a.jpeg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-15", "Lenovo Yoga 11E Touchscreen X360 Celeron 4GB RAM Refurbished", "Lenovo", "laptops-desktops", "lenovo-laptops", 13999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://image.kilimall.com/gallery/store/100012282/202604/1d852f38a59c4751bbed09fe6b8f95cf.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-16", "HP ProBook 840 i5 8GB/500GB Win 11 Refurbished", "HP", "laptops-desktops", "hp-laptops", 22500, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://image.kilimall.com/gallery/store/100012523/202604/6d31b53e0e6842628a8efa55cebe77bd.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-17", "Lenovo ThinkPad T450s Touch Core i5 5th Gen 8GB/256GB SSD", "Lenovo", "laptops-desktops", "lenovo-laptops", 19999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100011893/goods_image/260307091454_6a01901ee0a0acd361fc7b74e02f43e6.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-18", "HP EliteBook 840 G5 Core i5 8th Gen 8GB/256GB SSD 14\"", "HP", "laptops-desktops", "hp-laptops", 28999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100012282/goods_image/260311115749_f6dc519cb44f0256d95813d364f253d3.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-19", "Lenovo ThinkPad X240 Core i5 8GB/256GB SSD Refurbished", "Lenovo", "laptops-desktops", "lenovo-laptops", 16999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100012282/goods_image/260310155111_47997bc0249f7334f0f96e2735ad00e0.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-20", "HP EliteBook 840 G3 Core i5 6th Gen 8GB/256GB SSD", "HP", "laptops-desktops", "hp-laptops", 24999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100003090/goods_image/251029163027_f8ff7a83ea89b7bd921958ffc5463baf.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-21", "HP EliteBook 840 G1 Core i5 8GB/500GB HDD Refurbished", "HP", "laptops-desktops", "hp-laptops", 16099, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/10202/goods_image/251127113220_216bd1cd8718ddb67acd6275a8c93c24.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-22", "Chuwi CoreBook i3 10th Gen 8GB/256GB SSD 14\" FHD Ultrabook", "Chuwi", "laptops-desktops", "refurbished-laptops", 33999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100010440/goods_image/260224092340_c075503f0fe527666d130de67b3c532d.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-23", "Lenovo ThinkPad X240 Core i7 8GB/256GB SSD Refurbished", "Lenovo", "laptops-desktops", "lenovo-laptops", 14999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100007018/goods_image/260202095016_cac3587056ff90179508d6a5c21e91f9.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli-24", "Lenovo ThinkPad T450s Touch Core i5 8GB/256GB SSD", "Lenovo", "laptops-desktops", "lenovo-laptops", 18999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100012695/goods_image/260407095406_3dbde9cd8bd963d2d6c75cf9bc8a4442.png?x-image-process=image/format,webp/resize,w_360"),

  // Imported from Kilimall — page 2
  withImage(p("kli2-01", "{PROMOTION!} Hp Elitebook 840 G2 Laptop Intel Core i5 5th Gen 8GB RAM + 256GB SSD Refurbis", "HP", "laptops-desktops", "hp-laptops", 18000, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100007018/goods_image/250313144836_13432a13ea9adef4a17b4f2d77566ae2.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-02", "Refurbished Dell Latitude E7450 Intel Core i5 5th Generation 8GB RAM 500 GB HDD Storage 14", "Dell", "laptops-desktops", "dell-laptops", 16499, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/9648/goods_image/250213005838_b592efb64464ab7520e77d40a467ee1a.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-03", "Refurbished Dell Latitude E7450 Intel Core i5 5th Generation 8GB RAM 256GB ssd Storage 14 ", "Dell", "laptops-desktops", "dell-laptops", 18499, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/9648/goods_image/250213170528_eddff55f4b4a092cb0cff7115e3554e9.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-04", "(SPECIAL OFFER) LENOVO ThinkPad X240 Intel Core i5 8GB RAM + 256GB SSD Storage Refurbished", "Lenovo", "laptops-desktops", "lenovo-laptops", 17999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100001867/goods_image/251211134716_c49e09b9a8c1a86e11a5cb82c1e8aca7.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-05", "(FREE MOUSE) LENOVO YOGA 11E 4GB RAM 128GB SSD 2 IN 1 TOUCHSCREEN X360 LAPTOP REFURBISHED ", "Lenovo", "laptops-desktops", "lenovo-laptops", 12999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100001867/goods_image/251211132706_24be5f2773df6a5763ba28f8715d4b84.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-06", "Refurbished Dell Latitude E7440 Intel Core i5 4th Generation 8GB RAM 128 GB ssd Storage 14", "Dell", "laptops-desktops", "dell-laptops", 21999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100002958/goods_image/241107193648_393dfaee54e7365a45b55c8182d7015f.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-07", "{Free Mouse} Touchscreen Refurbished HP ProBook 11 G5 x360 Intel Pentium 4GB RAM 128GB SSD", "HP", "laptops-desktops", "hp-laptops", 14999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100010867/goods_image/251114170534_0517f8cca63f34ded0b3c110dd0e3fdf.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-08", "(Limited Hot Offers) HP elitebook 755 AMD A8,8gb RAM,256GB SSD,15.6inches | Refurbished La", "HP", "laptops-desktops", "hp-laptops", 33999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://image.kilimall.com/kenya/shop/store/goods/6253/2023/07/169036213868154d0dc839cd94e578b4f18a43f2703f5.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-09", "(4GB + 320GB HDD) Refurbished Lenovo Thinkpad Yoga 11e Celeron 4GB RAM + 320GB HDD Storage", "Lenovo", "laptops-desktops", "lenovo-laptops", 11299, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/10982/goods_image/241105124745_5fa33c3d5980e29c52b68695990f212e.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-10", "Refurbished Laptop Lenovo ThinkPad T450 Core i5 4th Gen 8GB+500GB HDD+14 inch Windows 10 Refur", "Lenovo", "laptops-desktops", "lenovo-laptops", 16499, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100007409/goods_image/250409154618_07b1f2f2e65c808474ef730ba9970131.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-11", "{ i5+16gb+256gb } Refurbished Dell Laptop Latitude 7480 Core i5 16GB+256GB+14'' Refurbishe", "Dell", "laptops-desktops", "dell-laptops", 22999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/7292/goods_image/250401220941_2a56e70ede5c19eb0419319a5415ed9d.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-12", "Refurbished Dell Latitude E7440 Intel Core i5 5th Generation 4GB RAM 500 GB HDD Storage 14", "Dell", "laptops-desktops", "dell-laptops", 13699, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/9648/goods_image/241112205616_34e0a787efc3c3ea0af3aadd6839face.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-13", "Refurbished Laptop Lenovo ThinkPad T450 Core i7 4th Gen 8GB+256GB SSD+14 inch Windows 10 Refur", "Lenovo", "laptops-desktops", "lenovo-laptops", 19199, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100007409/goods_image/250409155721_6d5fd12faee74d2aacfa4637862327b8.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-14", "Refurbished Dell Latitude 7280 Laptop | Intel Core i5 7th Gen | 8G RAM | 256GB SSD | 12.5”", "Dell", "laptops-desktops", "dell-laptops", 22599, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://image.kilimall.com/kenya/shop/store/goods/6253/2023/09/169520192605973b995b0cdae435ca42de3c0343a5882.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-15", "Refurbished HP Probook 840 G1 6th Gen i5+8GB+500GB 1-2GHz processor Windows 11 Bluetooth R", "HP", "laptops-desktops", "hp-laptops", 18499, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100007409/goods_image/250403194017_e19f54eb039abaf93d8c8f39e1c64e13.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-16", "Fujitsu Lifebook A574/H is a reliable business laptop featuring an Intel Core i5 processor", "Refurbished", "laptops-desktops", "refurbished-laptops", 11999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100002579/goods_image/250310205736_dc47e613b00e363baedc099a40732557.jpeg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-17", "Refurbished Dell Latitude E7450 Intel Core i5 5th Generation 16GB RAM 128GB ssd Storage 14", "Dell", "laptops-desktops", "dell-laptops", 23999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100002958/goods_image/241204174447_300e3aafba7236d2d76015ca0bdebefd.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-18", "Touchscreen Refurbished Dell Latitude E7270 Intel Core i5 8th Generation 8GB RAM 256GB SSD", "Dell", "laptops-desktops", "dell-laptops", 19399, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/10873/goods_image/250704143207_b038be9b858218c73de493ae6326e7dd.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-19", "{Limited Hot Best Offers} Lenovo ThinkPad 11e Yoga Laptop Touchscreen x360 Laptop | Intel ", "Lenovo", "laptops-desktops", "lenovo-laptops", 15099, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://image.kilimall.com/kenya/shop/store/goods/9932/2023/05/1684507044010cab2f2b39f194caaa98b4637c2a941c8.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-20", "Refurbished HP Elitebook 640 G4 Intel Core i5+8GB+256GB 1-2GHz processor Windows 10 Blueto", "HP", "laptops-desktops", "hp-laptops", 29999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100007512/goods_image/251011101423_6116badd35de83cf0e39adf2ab0d5d78.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-21", "(8GB+500GB) Refurbished HP Probook 640 G1 Intel core i5 8GB Ram 500GB HDD 14 Inch Laptop W", "HP", "laptops-desktops", "hp-laptops", 17999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100007409/goods_image/250822140419_72f37199f4c06c4153a40d24fcba4a1c.png?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-22", "Refurbished Hp Elitebook 840 G3 Intel Core i5 8GB RAM 256GB SSD 14'' HD Screen Refurbished", "HP", "laptops-desktops", "hp-laptops", 23999, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://image.kilimall.com/kenya/shop/store/goods/7207/2022/11/1667820759052fde34e19a9314bdfbe934a78363e0ca3.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-23", "Refurbished Dell Latitude 7280 Laptop | Intel Core i5 6th Gen | 8G RAM | 256GB SSD | 12.5”", "Dell", "laptops-desktops", "dell-laptops", 19499, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://img.kilimall.com/c/obs/seller/100002153/goods_image/240820202846_a71ef0f2317d0a96aab5edfcd1d8c82b.jpg?x-image-process=image/format,webp/resize,w_360"),
  withImage(p("kli2-24", "Refurbished HP Elitebook 820 G2 Laptop - Intel Core i5 - 8GB Ram 500GB HDD Rom - 12.5″ HD ", "HP", "laptops-desktops", "hp-laptops", 17899, undefined, "💻", "bg-orange-50", 4.5, 50, 10), "https://image.kilimall.com/kenya/shop/store/goods/7207/2023/08/169271255729015acd13030144a4c94fe2583890ae29a.jpg?x-image-process=image/format,webp/resize,w_360"),
];

export const findCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const findProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const productsByCategory = (slug: string) => PRODUCTS.filter((p) => p.category === slug);
export const featuredProducts = () => PRODUCTS.filter((p) => p.badge === "best" || p.rating >= 4.7).slice(0, 10);
export const bestSellers = () => [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 10);
export const newArrivals = () => PRODUCTS.filter((p) => p.badge === "new").concat(PRODUCTS.slice(0, 6)).slice(0, 10);
export const flashDeals = () =>
  PRODUCTS.filter((p) => p.oldPrice && (1 - p.price / p.oldPrice) >= 0.15).slice(0, 12);

export const KES = (n: number) =>
  "KSh " + n.toLocaleString("en-KE", { maximumFractionDigits: 0 });
