// 声明UniApp全局类型
declare const uni: any;

declare module '@dcloudio/uni-app' {
  export function onLoad(callback: () => void): void;
  export function onShow(callback: () => void): void;
  export function onHide(callback: () => void): void;
  export function onUnload(callback: () => void): void;
}

// 扩展setTimeout返回类型
declare global {
  interface Window {
    setTimeout(callback: (...args: any[]) => void, ms: number): number;
    clearTimeout(id: number): void;
  }
}

// 导出空对象，使文件成为模块
export {};