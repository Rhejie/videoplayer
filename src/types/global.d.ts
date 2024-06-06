declare module '@vimeo/player' {
  export interface Options {
    id: number | string
    width?: number
    loop?: boolean
    autoplay?: boolean
    [key: string]: any
  }

  export interface Event {
    type: string
    duration: number
    percent: number
    seconds: number
    [key: string]: any
  }

  export interface TimeUpdateEvent extends Event {
    seconds: number
    percent: number
    duration: number
  }

  type CallbackFunction = (data: any) => void

  export default class Player {
    constructor(element: HTMLElement | HTMLIFrameElement, options?: Options)

    on(event: string, callback: CallbackFunction): void
    off(event: string, callback: CallbackFunction): void
    play(): Promise<void>
    pause(): Promise<void>
    setColor(color: string): Promise<string>
    setCurrentTime(time: number): void
    // Add other methods you might use from the Vimeo Player API
  }
}
