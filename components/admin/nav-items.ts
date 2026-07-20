import {
  Calendar,
  FileText,
  Folder,
  GalleryHorizontal,
  Images,
  LayoutDashboard,
  Mail,
  Megaphone,
  Newspaper,
  Settings,
  Tags,
  Users,
  UsersRound,
  Video,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** false = ยังไม่มีหน้านี้ → sidebar ขึ้นเมนูแต่กดไม่ได้ (ป้าย "เร็ว ๆ นี้") */
  ready: boolean;
  /** sub-phase ใน roadmap ที่จะสร้างหน้านี้ — พอทำเสร็จให้เปลี่ยน ready เป็น true */
  phase?: string;
  /** เมนูที่เห็นเฉพาะ SUPER_ADMIN */
  superAdminOnly?: boolean;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

/**
 * เมนูหลังบ้าน — แหล่งความจริงเดียวของ Sidebar
 * ขึ้นครบตาม spec §5 ตั้งแต่แรกเพื่อให้เห็นโครงทั้งระบบ แต่ ready:false จนกว่าจะสร้างหน้าจริงใน Phase 4.4
 */
export const navGroups: NavGroup[] = [
  {
    title: "ภาพรวม",
    items: [
      { href: "/admin", label: "แดชบอร์ด", icon: LayoutDashboard, ready: true },
    ],
  },
  {
    title: "เนื้อหา",
    items: [
      { href: "/admin/news", label: "ข่าวสาร", icon: Newspaper, ready: true },
      { href: "/admin/categories", label: "หมวดหมู่ & แท็ก", icon: Tags, ready: true },
      { href: "/admin/works", label: "ผลงาน / สื่อการสอน", icon: Video, ready: true },
      { href: "/admin/events", label: "กิจกรรม & ปฏิทิน", icon: Calendar, ready: true },
    ],
  },
  {
    title: "สื่อและไฟล์",
    items: [
      { href: "/admin/albums", label: "อัลบั้มภาพ", icon: Images, ready: true },
      { href: "/admin/documents", label: "เอกสารดาวน์โหลด", icon: Folder, ready: true },
      { href: "/admin/banners", label: "แบนเนอร์หน้าแรก", icon: GalleryHorizontal, ready: true },
      { href: "/admin/announcements", label: "ประกาศด่วน", icon: Megaphone, ready: true },
    ],
  },
  {
    title: "หน้าเว็บ",
    items: [
      { href: "/admin/staff", label: "ทำเนียบบุคลากร", icon: UsersRound, ready: true },
      { href: "/admin/pages", label: "หน้าเนื้อหา", icon: FileText, ready: true },
    ],
  },
  {
    title: "ระบบ",
    items: [
      { href: "/admin/messages", label: "ข้อความติดต่อ", icon: Mail, ready: false, phase: "4.4.12" },
      { href: "/admin/users", label: "ผู้ใช้งาน", icon: Users, ready: false, phase: "4.4.13", superAdminOnly: true },
      { href: "/admin/settings", label: "ตั้งค่าเว็บไซต์", icon: Settings, ready: true, superAdminOnly: true },
    ],
  },
];

/** กรองเมนูตาม role — non-SUPER_ADMIN ไม่เห็น users/settings เลย (spec §6) */
export function visibleNavGroups(role?: string | null): NavGroup[] {
  const isSuperAdmin = role === "SUPER_ADMIN";

  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.superAdminOnly || isSuperAdmin),
    }))
    .filter((group) => group.items.length > 0);
}
