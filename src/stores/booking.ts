import { create } from "zustand";
import type {
  Location,
  Vehicle,
  Insurance,
  Equipment,
  PaymentMethod,
  CompanySettings,
} from "@/lib/types";

// Order-specific option from order/create response
export interface OrderOption {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  is_required: number;
  price_day: string;
  price: string;
  max_quantity: number;
  quantity: number;
  type: string;
}

// Order-specific insurance from order/create response
export interface OrderInsurance {
  id: number;
  title: string;
  description?: string;
  price_day: string;
  price: string;
}

interface BookingState {
  currentStep: number;
  // Settings
  settings: CompanySettings | null;
  locations: Location[];
  paymentMethods: PaymentMethod[];
  insurances: Insurance[];
  equipments: Equipment[];
  currency: string;
  currencySymbol: string;
  // Step 0 - Dates
  pickupLocation: Location | null;
  returnLocation: Location | null;
  differentReturnLocation: boolean;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  // Step 1 - Vehicles
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  // Step 2 - Extras
  orderId: number | null;
  orderTotal: number;
  orderInsurances: OrderInsurance[];
  orderOptions: OrderOption[];
  selectedInsurance: number | null;
  selectedEquipment: Record<number, number>;
  couponCode: string;
  couponDiscount: number;
  timerStart: number | null;
  timerDuration: number;
  // Step 3 - Order
  paymentMethodId: number | string | null;
  orderConfirmed: boolean;
  paymentUrl: string | null;

  // Actions
  setStep: (step: number) => void;
  setSettings: (s: CompanySettings) => void;
  setPickupLocation: (l: Location | null) => void;
  setReturnLocation: (l: Location | null) => void;
  setDifferentReturnLocation: (v: boolean) => void;
  setPickupDate: (d: string) => void;
  setPickupTime: (t: string) => void;
  setReturnDate: (d: string) => void;
  setReturnTime: (t: string) => void;
  setVehicles: (v: Vehicle[]) => void;
  selectVehicle: (v: Vehicle) => void;
  setOrderId: (id: number) => void;
  setOrderTotal: (t: number) => void;
  setOrderExtras: (insurances: OrderInsurance[], options: OrderOption[]) => void;
  setSelectedInsurance: (id: number | null) => void;
  setEquipmentCount: (id: number, count: number) => void;
  setCoupon: (code: string, discount: number) => void;
  startTimer: (duration?: number) => void;
  setPaymentMethodId: (id: number | string) => void;
  confirmOrder: (paymentUrl?: string) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 0,
  settings: null,
  locations: [],
  paymentMethods: [],
  insurances: [],
  equipments: [],
  currency: "USD",
  currencySymbol: "$",
  pickupLocation: null,
  returnLocation: null,
  differentReturnLocation: false,
  pickupDate: "",
  pickupTime: "10:00",
  returnDate: "",
  returnTime: "10:00",
  vehicles: [],
  selectedVehicle: null,
  orderId: null,
  orderTotal: 0,
  orderInsurances: [],
  orderOptions: [],
  selectedInsurance: null,
  selectedEquipment: {},
  couponCode: "",
  couponDiscount: 0,
  timerStart: null,
  timerDuration: 600000,
  paymentMethodId: null,
  orderConfirmed: false,
  paymentUrl: null,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  setSettings: (s) =>
    set({
      settings: s,
      locations: s.locations,
      paymentMethods: s.payment_methods,
      insurances: s.insurances,
      equipments: s.equipments,
      currency: s.currency || "USD",
      currencySymbol: s.currency_symbol || "$",
      timerDuration: (s.time_for_booking ?? 600) * 1000,
    }),

  setPickupLocation: (l) => set({ pickupLocation: l }),
  setReturnLocation: (l) => set({ returnLocation: l }),
  setDifferentReturnLocation: (v) => set({ differentReturnLocation: v }),
  setPickupDate: (d) => set({ pickupDate: d }),
  setPickupTime: (t) => set({ pickupTime: t }),
  setReturnDate: (d) => set({ returnDate: d }),
  setReturnTime: (t) => set({ returnTime: t }),
  setVehicles: (v) => set({ vehicles: v }),
  selectVehicle: (v) => set({ selectedVehicle: v }),
  setOrderId: (id) => set({ orderId: id }),
  setOrderTotal: (t) => set({ orderTotal: t }),
  setOrderExtras: (insurances, options) =>
    set({
      orderInsurances: insurances,
      orderOptions: options,
      selectedEquipment: Object.fromEntries(
        options.filter((opt) => opt.quantity > 0).map((opt) => [opt.id, opt.quantity])
      ),
    }),
  setSelectedInsurance: (id) => set({ selectedInsurance: id }),
  setEquipmentCount: (id, count) =>
    set((state) => ({
      selectedEquipment: { ...state.selectedEquipment, [id]: count },
    })),
  setCoupon: (code, discount) =>
    set({ couponCode: code, couponDiscount: discount }),
  startTimer: (duration) =>
    set((state) => ({
      timerStart: Date.now(),
      timerDuration: duration ?? state.timerDuration,
    })),
  setPaymentMethodId: (id) => set({ paymentMethodId: id }),
  confirmOrder: (paymentUrl) =>
    set({ orderConfirmed: true, paymentUrl: paymentUrl ?? null }),
  reset: () => set(initialState),
}));
