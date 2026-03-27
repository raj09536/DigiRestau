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
  cancel_time_limit: number | null;
  thank_you_message: string | null;
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

export interface OrderFeedback {
  id: string;
  order_id: string;
  restaurant_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  orders?: Order;
}

export interface InventoryItem {
  id: string;
  restaurant_id: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock_percent: number;
  min_stock_level: number;
  is_low_stock: boolean;
  created_at: string;
}

export interface StockTransaction {
  id: string;
  restaurant_id: string;
  inventory_item_id: string;
  order_id?: string;
  type: 'add' | 'deduct' | 'waste' | 'manual' | 'cancel_refund';
  quantity: number;
  note?: string;
  created_at: string;
  inventory_items?: InventoryItem;
}

export interface InventoryMenuLink {
  id: string;
  restaurant_id: string;
  menu_item_id: string;
  inventory_item_id: string;
  quantity_used: number;
  is_auto_deduct: boolean;
  created_at: string;
  inventory_items?: InventoryItem;
}

export interface Supplier {
  id: string;
  restaurant_id: string;
  name: string;
  phone: string;
  items: string;
  notes?: string;
  created_at: string;
}

export interface StaffMember {
    id: string;
    restaurant_id: string;
    name: string;
    phone: string;
    role: 'chef' | 'waiter' | 'manager';
    password?: string;
    salary_type: 'fixed' | 'daily' | 'hourly';
    salary_amount: number;
    shift_type: string;
    aadhar_url?: string;
    is_active: boolean;
    created_at: string;
}

export interface StaffAttendance {
    id: string;
    restaurant_id: string;
    staff_id: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'leave';
    overtime_hours: number;
    shift: string;
    created_at: string;
}

export interface StaffSalary {
    id: string;
    restaurant_id: string;
    staff_id: string;
    month: number;
    year: number;
    basic_salary: number;
    overtime_pay: number;
    bonus: number;
    advance_deduction: number;
    total_paid: number;
    payment_method: 'cash' | 'upi';
    screenshot_url?: string;
    is_paid: boolean;
    paid_at?: string;
    created_at: string;
}

export interface StaffAdvance {
    id: string;
    restaurant_id: string;
    staff_id: string;
    amount: number;
    reason?: string;
    date: string;
    is_deducted: boolean;
    created_at: string;
}

export interface WaiterTableAssignment {
    id: string;
    restaurant_id: string;
    staff_id: string;
    table_id: string;
    created_at: string;
    tables?: Table;
}
