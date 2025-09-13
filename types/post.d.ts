export interface Post {
  _id: string
  providerId: string
  description: string
  qtyEstimate: number
  pickupStart: Date
  pickupEnd: Date
  location: string
  status: "open" | "claimed"
  claimedBy?: string
  createdAt: Date
  provider?: {
    name: string
    email: string
  }
  claimer?: {
    name: string
  }
}
