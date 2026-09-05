import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] bg-[#f2f2f2] flex flex-col items-center justify-center gap-[16px] px-[24px] text-center">
          <p className="font-black text-[#182642] text-[18px]">問題が発生しました</p>
          <p className="font-medium text-[#8a93a6] text-[14px]">
            ページを再読み込みしてもう一度お試しください
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#13b5a3] to-[#0d9488] flex h-[48px] items-center justify-center rounded-[24px] px-[24px] font-black text-white text-[15px]"
          >
            再読み込み
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
