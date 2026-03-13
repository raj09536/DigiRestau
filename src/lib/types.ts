export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  theme_color: string;
  is_active: boolean;
  ui_theme?: 'light' | 'dark';
  is_premium?: boolean;
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: number;
  table_name: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  position: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  restaurant_id: string;
  table_id: string;
  customer_name: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  table?: Table;
  tables?: { table_number: number; table_name?: string };
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  quantity: number;
  price: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}
