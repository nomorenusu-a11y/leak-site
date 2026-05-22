/**
 * 사이트 전반에서 쓰는 아이콘 통합 진입점.
 *
 * OS 컬러 이모지(🎯💰🛡️👨‍🔧⚡✓📝💧) 대신 단색 lucide-react SVG를 사용한다.
 * stroke-width 1.5, currentColor — 톤 일관성·다크모드 호환·서치/SNS 미리보기까지 깔끔.
 *
 * 이 파일을 통해서만 import 권장 (lucide-react 직접 import도 동작).
 */

export {
  // 브랜드
  Droplet,
  // CTA
  Phone,
  MessageCircle,
  FileText,
  // Hero 강조·체크
  Zap,
  Check,
  // TrustPoints 4대 카드
  Crosshair,
  Tag,
  ShieldCheck,
  UserCheck,
  // StatusBadge
  Inbox,
  Mail,
  Loader2,
  // 일반
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Menu,
  X,
  Share2,
  Link as LinkIcon,
  Camera,
  Upload,
  AlertCircle,
  Info,
  // StatsBar (LiveBoard 위 한 줄 배지)
  Clock,
  MapPin,
  Wallet,
  // 장인케어 톤 리뉴얼 (v2)
  Droplets,
  Bath,
  Wrench,
  Thermometer,
  Snowflake,
  Star,
  ChevronUp,
  ArrowUp,
  MessageSquare,
  Sparkles,
} from "lucide-react";
