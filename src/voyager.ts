/** Abstraction layer for Voyager's API. */
export namespace Voyager {
  export type ApiBaseUrls = Readonly<{
    mainnet: string
    goerli: string
    goerli2: string
  }>

  export const apiBaseUrls: ApiBaseUrls = {
    mainnet: 'https://api.voyager.online/beta',
    goerli: 'https://goerli-api.voyager.online/beta',
    goerli2: 'https://goerli-2-api.voyager.online/beta',
  }

  export enum TxnType {
    /** Indicates a contract deployment. */
    Deploy = 'DEPLOY',
    /** Indicates a contract call. */
    Invoke = 'INVOKE',
    /** Indicates a class declaration. */
    Declare = 'DECLARE',
    /** Indicates an interaction with the L1. */
    L1Handler = 'L1_HANDLER',
    /** Indicates an account creation. */
    DeployAccount = 'DEPLOY_ACCOUNT',
  }

  export enum Attribute {
    Holders = 'holders',
    Transfers = 'transfers',
  }

  export enum TokenType {
    Erc20 = 'erc20',
    Erc721 = 'erc721',
    Erc1155 = 'erc1155',
  }

  export type TokensInput = Readonly<{
    /** Order by a specific attribute. Uses {@link Attribute.Holders} if `undefined`. */
    attribute?: Attribute
    /** Uses {@link TokenType.Erc20} if `undefined`. */
    type?: TokenType
    pageSize?: PageSize
    page?: Page
  }>

  /** If the page query parameter has the same value, then you've reached the last page. */
  export type LastPage = number

  export type TokensOutput = Readonly<{
    lastPage: LastPage
    items: TokenItem[]
  }>

  export type TokenItem = Readonly<{
    address: string
    /** `5` for ERC20, `6` for ERC721, and `7` for ERC1155. */
    type: number
    name: string
    symbol: string
    decimals: number
    transfers: string
    holders: string
    proxyMethod: number
  }>

  export type TxnsInput = Readonly<{
    /**
     * Only transactions from this contract address will be retrieved. If `undefined`, then all contracts will be
     * considered.
     * @example `'0x025b74DBFB6AEc63a080b2477e03a4920FbD89C3ba6AdAB7cea1Afd25F8685F9'`
     */
    contract?: string
    blockNum?: number
    type?: TxnType
    /**
     * If `true`, then only rejected transactions will be retrieved. Otherwise, only transactions which haven't been
     * rejected will be retrieved.
     */
    isRejected?: boolean
    pageSize?: PageSize
    page?: Page
  }>

  /**
   * Which page of items to retrieve. Start with `1` unless you know which page you want. The JSON response body's
   * `lastPage` field will indicate the last page you can iterate using such as `3`.
   */
  export type Page = number | undefined

  /**
   * The number of items to return in a page.
   *
   * If it's less than 25, then the page size will be 10. If it's 25, then the page size will be 25. If it's greater
   * than 25, then the page size will be 50.
   */
  export type PageSize = number | undefined

  export type EventsInput = Readonly<{
    pageSize?: PageSize
    page?: Page
    /**
     * The contract address. You cannot mix this with the {@link blockHash} and {@link txnHash} query parameters.
     * @example `'0x059543b614ac617d42678b50e8762e2f6fcd26bfe7699637b7139ac85429c1df'`
     */
    contract?: string
    /**
     * The transaction hash.
     * @example `'0x3968a5cbcdb70f380cc94b4838d9638c06efbbfe9afc3cb1e7db1eacbf7ed8c'`
     */
    txnHash?: string
    /** @example `'0x5360b9636d0dc6f795a97f0f5d3d0c0cb07edc0144eac9779cb486cded2aca6'` */
    blockHash?: string
  }>

  export enum TxnStatus {
    Received = 'Received',
    AceptedOnL2 = 'Accepted on L2',
    AcceptedOnL1 = 'Accepted on L1',
    Rejected = 'Rejected',
    Reverted = 'Reverted',
  }

  export type TxnItem = Readonly<{
    status: TxnStatus
    type: TxnType
    /** The block's number. */
    blockNumber: number
    /**Transaction hash.*/
    hash: string
    /**
     * The zero-based index of the transaction in the block. For example, if there were three transactions in the block,
     * and this was the second transaction, then it'd be `1`.
     */
    index: number
    /** The hash of the transaction verification on the L1. */
    l1VerificationHash: string
    /** The class's hash. */
    classHash: string | null
    contractAddress: string
    /** The number of seconds since the Unix epoch. */
    timestamp: number
    /** The quantity of ETH used to pay the transaction fee. */
    actualFee: string | null
    /** A comma-separated list of transaction actions. */
    actions: string | null
    /** A human-readable name for the contract address. */
    contractAlias: string | null
    /** A human-readable name for the class hash. */
    classAlias: string | null
  }>

  export type TxnsOutput = Readonly<{
    items: TxnItem[]
    lastPage: LastPage
  }>

  export type EventsOutput = Readonly<{
    lastPage: LastPage
    items: EventItem[]
  }>

  export type EventItem = Readonly<{
    blockNumber?: number
    transactionNumber?: number
    number?: number
    fromAddress?: string
    classHash?: string
    transactionHash?: string
    blockHash?: string
    /** The number of seconds since the Unix epoch. */
    timestamp?: number
    contractAlias?: string | null
    classAlias?: string | null
    /** Voyager assigned event id. */
    eventId: string
    selector: string
    name: string
    nestedName: string
    keys: string[]
    data: string[]
    keyDecoded?: Record<string, unknown>[]
    dataDecoded?: Record<string, unknown>[]
  }>

  /** This class gets used when an HTTP request failed, and might wrap the underlying error. */
  export class NetworkErr extends Error {
  }

  export type ApiInput = Readonly<{
    /** @see {@link apiBaseUrls} */
    apiBaseUrl: string
    apiKey: string
  }>

  export class Api {
    private readonly apiKey: string
    private readonly apiBaseUrl: string

    constructor({apiKey, apiBaseUrl}: ApiInput) {
      this.apiKey = apiKey
      this.apiBaseUrl = apiBaseUrl
    }

    /**
     * Get all transactions.
     * @throws {@link NetworkErr}
     */
    async getTxns(input?: TxnsInput): Promise<TxnsOutput> {
      const params = new URLSearchParams()
      if (input?.contract !== undefined) params.set('to', input.contract)
      if (input?.page !== undefined) params.set('p', input.page.toString())
      if (input?.pageSize !== undefined) params.set('ps', input.pageSize.toString())
      if (input?.type !== undefined) params.set('type', input.type)
      if (input?.isRejected !== undefined) params.set('rejected', input.isRejected.toString())
      if (input?.blockNum !== undefined) params.set('block', input.blockNum.toString())
      let res: Response
      try {
        res = await fetch(`${this.apiBaseUrl}/txns?${params}`, {
          headers: {'X-Api-Key': this.apiKey, 'Content-Type': 'application/json'}
        })
      } catch (err: any) {
        throw new NetworkErr(err)
      }
      if (res.status !== 200) throw new NetworkErr()
      return await res.json()
    }

    /**
     * Get all events.
     * @throws {@link NetworkErr}
     */
    async getEvents(input?: EventsInput): Promise<EventsOutput> {
      const params = new URLSearchParams()
      if (input?.page !== undefined) params.set('p', input.page.toString())
      if (input?.pageSize !== undefined) params.set('ps', input.pageSize.toString())
      if (input?.blockHash !== undefined) params.set('blockHash', input.blockHash)
      if (input?.txnHash !== undefined) params.set('txnHash', input.txnHash.toString())
      if (input?.contract !== undefined) params.set('contract', input.contract.toString())
      let res: Response
      try {
        res = await fetch(`${this.apiBaseUrl}/events?${params}`, {
          headers: {'X-Api-Key': this.apiKey, 'Content-Type': 'application/json'}
        })
      } catch (err: any) {
        throw new NetworkErr(err)
      }
      if (res.status !== 200) throw new NetworkErr()
      return await res.json()
    }

    /**
     * List all deployed tokens on the network that conforms to the token standards. This includes token standards like
     * ERC20, ERC721, and ERC1155.
     * @throws {@link NetworkErr}
     */
    async getTokens(input?: TokensInput): Promise<TokensOutput> {
      const params = new URLSearchParams()
      if (input?.page !== undefined) params.set('p', input.page.toString())
      if (input?.pageSize !== undefined) params.set('ps', input.pageSize.toString())
      if (input?.type !== undefined) params.set('type', input.type.toString())
      if (input?.attribute !== undefined) params.set('attribute', input.attribute.toString())
      let res: Response
      try {
        res = await fetch(`${this.apiBaseUrl}/events?${params}`, {
          headers: {'X-Api-Key': this.apiKey, 'Content-Type': 'application/json'}
        })
      } catch (err: any) {
        throw new NetworkErr(err)
      }
      if (res.status !== 200) throw new NetworkErr()
      return await res.json()
    }
  }
}
