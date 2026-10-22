import React from 'react';
import {
  UtensilsCrossed,
  Coffee,
  Car,
  Store,
  ShoppingBag,
  Home,
  HeartPulse,
  Film,
  Sparkles,
  GraduationCap,
  Gift,
  CreditCard,
  Dog,
  MoreHorizontal,
  BadgeDollarSign,
  Coins,
  TrendingUp,
  HandCoins,
  PiggyBank,
  Repeat,
  PlusCircle,
  ArrowLeftRight,
  Landmark,
  Smartphone,
  Banknote,
  HelpCircle,
  LucideProps
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  UtensilsCrossed,
  Coffee,
  Car,
  Store,
  ShoppingBag,
  Home,
  HeartPulse,
  Film,
  Sparkles,
  GraduationCap,
  Gift,
  CreditCard,
  Dog,
  MoreHorizontal,
  BadgeDollarSign,
  Coins,
  TrendingUp,
  HandCoins,
  PiggyBank,
  Repeat,
  PlusCircle,
  ArrowLeftRight,
  Landmark,
  Smartphone,
  Banknote
};

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent {...props} />;
};
