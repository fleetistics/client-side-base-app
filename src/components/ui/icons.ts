import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ImagePlus,
  QrCode,
  Trash2,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { cssInterop } from 'nativewind';

function iconWithClassName(icon: LucideIcon) {
  cssInterop(icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
        opacity: true,
      },
    },
  });
}

[Camera, Check, ChevronLeft, ChevronRight, Eye, EyeOff, ImagePlus, QrCode, Trash2, Video, X].forEach(
  iconWithClassName
);

export { Camera, Check, ChevronLeft, ChevronRight, Eye, EyeOff, ImagePlus, QrCode, Trash2, Video, X };
