import heroPhoto from "../assets/hero-photo.webp";
import headerLogo from "../assets/header-logo.png";
import footerLogo from "../assets/footer-logo.png";
import illustrationAtlas from "../assets/illustration-atlas.webp";
import illustration2 from "../assets/illustration-2.webp";
import usageBadge1 from "../assets/usage-badge-1.png";
import usageBadge2 from "../assets/usage-badge-2.png";
import usageBadge3 from "../assets/usage-badge-3.png";
import usageIconSearch from "../assets/usage-icon-search.png";
import usageIconBookmark from "../assets/usage-icon-bookmark.png";
import usageIconThumbsup from "../assets/usage-icon-thumbsup.png";

export default function TopPage({ onSearch, onPostReview }) {
  return (
    <div className="bg-white relative w-full max-w-[402px] min-h-[max(938px,var(--rf-fill-height))] overflow-hidden shadow-xl">
      <div className="absolute h-[874px] left-[-8px] overflow-hidden top-0 w-[419px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={heroPhoto} />

        {/* フッターロゴ */}
        <div className="absolute flex flex-col items-start left-[22px] top-[811px] w-[220px]">
          <div className="h-[45px] relative shrink-0 w-[204px]">
            <img alt="愛工大の裏キャンパス" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={footerLogo} />
          </div>
        </div>

        {/* フッターバナー: 口コミ投稿CTA */}
        <div className="absolute bg-[#1a2b3a] h-[91px] left-[4px] overflow-hidden top-[700px] w-[419px]">
          <div className="absolute flex flex-col items-center left-[78px] top-[12px] w-[263px]">
            <div className="flex flex-col gap-[10px] items-center shrink-0 w-full">
              <div className="aspect-[263/17] relative shrink-0 w-full">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="あなたの大学生活を、最高の思い出に。" className="absolute h-[5248.53%] left-[-44.49%] max-w-none top-[-4318.38%] w-[189.35%]" src={illustrationAtlas} />
                </div>
              </div>
              <button
                type="button"
                onClick={onPostReview}
                className="flex h-[48px] items-center justify-center gap-[10px] pl-5 pr-[21px] py-[7px] rounded-[29px] shrink-0 w-[148px]"
                style={{ backgroundImage: "linear-gradient(270deg, rgb(255, 148, 148) 0%, rgb(227, 179, 132) 27.885%, rgb(210, 210, 122) 45.192%, rgb(158, 189, 110) 66.346%, rgb(109, 153, 89) 80.288%)" }}
              >
                <span className="font-bold leading-[106.4%] text-[13px] text-white whitespace-nowrap">口コミを投稿する</span>
              </button>
            </div>
          </div>
        </div>

        {/* 使い方の紹介: 1.授業の検索 / 2.お気に入り / 3.評価を見る */}
        <div className="absolute flex flex-col items-start left-[48px] top-[579px] w-[337px]">
          <div className="flex flex-col items-center shrink-0 w-full">
            <div className="flex flex-col items-start p-[10px] shrink-0 w-[225px]">
              <div className="aspect-[205/23] relative shrink-0 w-full">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="初めての方へ、使い方の紹介" className="absolute h-[3879.35%] left-[-71.71%] max-w-none top-[-2657.07%] w-[242.93%]" src={illustrationAtlas} />
                </div>
              </div>
            </div>
            <div className="flex gap-[40px] items-center shrink-0 w-full">
              <div className="flex gap-[6px] items-center shrink-0">
                <img alt="" className="h-[28px] w-auto shrink-0" src={usageBadge1} />
                <img alt="授業の検索アイコン" className="h-[46px] w-auto shrink-0" src={usageIconSearch} />
              </div>
              <div className="flex gap-[6px] items-center shrink-0">
                <img alt="" className="h-[28px] w-auto shrink-0" src={usageBadge2} />
                <img alt="お気に入りアイコン" className="h-[46px] w-auto shrink-0" src={usageIconBookmark} />
              </div>
              <div className="flex gap-[6px] items-center shrink-0">
                <img alt="" className="h-[28px] w-auto shrink-0" src={usageBadge3} />
                <img alt="評価を見るアイコン" className="h-[46px] w-auto shrink-0" src={usageIconThumbsup} />
              </div>
            </div>
          </div>
          <div className="flex font-medium gap-[40px] items-center leading-[100.07%] shrink-0 text-[14px] text-black w-full">
            <p className="shrink-0 whitespace-nowrap">1.授業の検索</p>
            <p className="shrink-0 whitespace-nowrap">2.お気に入り</p>
            <p className="shrink-0 whitespace-nowrap">3.評価を見る</p>
          </div>
        </div>

        {/* 3つのカテゴリ: リアルな評価 / 試験のスケジュール / 授業の相談 */}
        <div className="absolute flex flex-col items-center left-[18px] top-[398px] w-[389px]">
          <div className="flex gap-px items-center shrink-0 w-full">
            <div className="flex items-center p-[10px] shrink-0">
              <div className="relative rounded-[25px] shrink-0 size-[106px]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[25px]">
                  <img alt="リアルな評価のイラスト" className="absolute h-[841.75%] left-[-45.28%] max-w-none top-[-379.36%] w-[469.81%]" src={illustrationAtlas} />
                </div>
              </div>
            </div>
            <div className="flex items-center p-[10px] shrink-0">
              <img alt="試験のスケジュールのイラスト" className="rounded-[25px] shrink-0 size-[106px] object-cover" src={illustration2} />
            </div>
            <div className="flex flex-col items-start p-[10px] shrink-0 w-[135px]">
              <div className="aspect-[115/106] relative rounded-[25px] shrink-0 w-full">
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[25px]">
                  <img alt="授業の相談のイラスト" className="absolute h-[841.75%] left-[-296.52%] max-w-none top-[-379.36%] w-[433.04%]" src={illustrationAtlas} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex font-medium gap-[41px] items-center leading-[100.07%] text-[12px] text-black">
            <p className="h-[19px] shrink-0 w-[73px] whitespace-nowrap">リアルな評価</p>
            <p className="h-[19px] shrink-0 w-[109px] whitespace-nowrap">試験のスケジュール</p>
            <p className="h-[19px] shrink-0 w-[61px] whitespace-nowrap">授業の相談</p>
          </div>
        </div>

        {/* キャッチコピー + 検索ボタン */}
        <div className="absolute flex flex-col gap-[7px] items-center left-[67px] top-[257px] w-[291px]">
          <div className="flex flex-col gap-[7px] items-center shrink-0 w-full">
            <div className="aspect-[385/33] relative shrink-0 w-full">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="愛工大の全講義情報、ここに集結！" className="absolute h-[2703.79%] left-[-14.55%] max-w-none top-[-764.02%] w-[129.35%]" src={illustrationAtlas} />
              </div>
            </div>
            <div className="h-[37px] relative shrink-0 w-[277px]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="全学科、全科目も履修、試験、先生の情報まで" className="absolute h-[2411.49%] left-[-39.71%] max-w-none top-[-781.42%] w-[179.78%]" src={illustrationAtlas} />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onSearch}
            aria-label="履修情報を検索する"
            className="h-[41px] relative rounded-[50px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-[200px] before:content-[''] before:absolute before:-inset-y-[4px] before:inset-x-0"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[50px]">
              <img alt="履修情報を検索する" className="absolute h-[2176.22%] left-[-74.5%] max-w-none top-[-827.13%] w-[249%]" src={illustrationAtlas} />
            </div>
          </button>
        </div>

        {/* ヘッダーロゴ */}
        <div className="absolute h-[69px] left-[49px] top-[46px] w-[322px]">
          <img alt="愛工大の裏キャンパス" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={headerLogo} />
        </div>
      </div>

    </div>
  );
}
