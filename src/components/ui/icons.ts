import {
  Bike,
  Camera,
  CarFront,
  Check,
  ChevronLeft,
  ChevronRight,
  Dog,
  Eye,
  EyeOff,
  Footprints,
  Gauge,
  ImagePlus,
  Navigation,
  Plane,
  QrCode,
  Sailboat,
  Shield,
  Tractor,
  Trash2,
  Truck,
  Video,
  X,
  Zap,
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

[Bike, Camera, CarFront, Check, ChevronLeft, ChevronRight, Dog, Eye, EyeOff, Footprints, Gauge, ImagePlus, Navigation, Plane, QrCode, Sailboat, Shield, Tractor, Trash2, Truck, Video, X, Zap].forEach(
  iconWithClassName
);

export { Bike, Camera, CarFront, Check, ChevronLeft, ChevronRight, Dog, Eye, EyeOff, Footprints, Gauge, ImagePlus, Navigation, Plane, QrCode, Sailboat, Shield, Tractor, Trash2, Truck, Video, X, Zap };
export type { LucideIcon };
