/**
 * Live updates client.
 *
 * The REST surface is covered by the generated SDK, but WebSockets are not part
 * of OpenAPI, so this small client is hand-wired. REST loads the initial
 * snapshot; these frames patch the same store keyed by `outcomeId` / `marketId`.
 *
 * See the Frontend Integration Guide ("WebSocket, live updates") for the
 * protocol this implements.
 */

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5079"

export type SocketMessageType =
  | "subscribed"
  | "price-update"
  | "orderbook-update"
  | "trade-executed"
  | "feed-update"
  | "market-resolved"
  | "error"

export interface PriceUpdate {
  type: "price-update"
  outcomeId: string
  price: number
  volume: number
  timestamp: string
}

export interface OrderbookLevel {
  price: number
  quantity: number
}

export interface OrderbookUpdate {
  type: "orderbook-update"
  outcomeId: string
  bids: OrderbookLevel[]
  asks: OrderbookLevel[]
  timestamp: string
}

export interface TradeExecuted {
  type: "trade-executed"
  marketId: string
  outcomeId: string
  price: number
  shares: number
  timestamp: string
}

export interface FeedUpdate {
  type: "feed-update"
  marketId: string
  value: number
  timestamp: string
}

export interface MarketResolved {
  type: "market-resolved"
  marketId: string
  winningOutcomeId: string
  timestamp: string
}

export type SocketMessage =
  | PriceUpdate
  | OrderbookUpdate
  | TradeExecuted
  | FeedUpdate
  | MarketResolved
  | { type: "subscribed"; topic: string }
  | { type: "error"; message: string }
  // Forward-compatible: unknown future message types still flow through.
  | { type: string; [key: string]: unknown }

export type SocketChannel =
  | "price"
  | "orderbook"
  | "trades"
  | "feed"
  | "market"

type Handler = (msg: SocketMessage) => void

interface Subscription {
  action: "subscribe"
  channel: SocketChannel
  marketId?: string
  outcomeId?: string
}

/**
 * Thin WebSocket wrapper with auto-reconnect and subscription replay.
 *
 * Auth: pass the same Better Auth session token the SDK uses. Handshakes can't
 * send headers, so it travels as the `token` query parameter.
 */
export class AnchorMarketSocket {
  private ws?: WebSocket
  private handlers = new Map<string, Set<Handler>>()
  private subscriptions: Subscription[] = []
  private closed = false
  private reconnectTimer?: ReturnType<typeof setTimeout>

  constructor(
    private token: string,
    private baseUrl: string = DEFAULT_BASE_URL
  ) {}

  connect() {
    if (typeof window === "undefined") return // browser-only
    this.closed = false
    const url = `${this.baseUrl.replace(/^http/, "ws")}/ws?token=${encodeURIComponent(
      this.token
    )}`
    this.ws = new WebSocket(url)

    this.ws.onopen = () => this.subscriptions.forEach((s) => this.send(s))
    this.ws.onmessage = (e) => {
      let msg: SocketMessage
      try {
        msg = JSON.parse(e.data)
      } catch {
        return
      }
      this.handlers.get(msg.type)?.forEach((h) => h(msg))
    }
    // Auto-reconnect; subscriptions are replayed on reopen.
    this.ws.onclose = () => {
      if (this.closed) return
      this.reconnectTimer = setTimeout(() => this.connect(), 1000)
    }
  }

  /** Listen for a server message type, e.g. on("price-update", fn). */
  on(type: SocketMessageType, handler: Handler): () => void {
    let set = this.handlers.get(type)
    if (!set) {
      set = new Set()
      this.handlers.set(type, set)
    }
    set.add(handler)
    return () => set!.delete(handler)
  }

  subscribe(
    channel: SocketChannel,
    ids: { marketId?: string; outcomeId?: string }
  ) {
    const sub: Subscription = { action: "subscribe", channel, ...ids }
    this.subscriptions.push(sub)
    this.send(sub)
  }

  private send(payload: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload))
    }
  }

  close() {
    this.closed = true
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
  }
}
