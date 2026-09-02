import BookmarkButton from "./BookmarkButton.jsx";
import starBadgeIcon from "../assets/star-badge-icon.png";
import personIcon from "../assets/person-icon.png";
import locationIcon from "../assets/location-icon.png";
import clockIcon from "../assets/clock-icon.png";

export default function ResultCard({ course, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white flex flex-col gap-[10px] items-start w-full text-left rounded-[15px] shadow-[0px_2px_6px_rgba(0,0,0,0.08)] px-[16px] py-[14px]"
    >
      <div className="flex gap-[10px] items-start justify-between w-full">
        <p className="font-medium leading-[130%] text-[#182642] text-[18px] break-words min-w-0 flex-1">{course.授業名}</p>
        <div className="flex gap-[8px] items-center shrink-0">
          <div className="bg-[#ffeed1] border-[#ffd68a] border-[0.5px] border-solid flex gap-[4px] items-center shrink-0 px-[8px] py-[5px] rounded-[60px]">
            <p className="font-medium leading-[100.07%] text-[#b45309] text-[11px] whitespace-nowrap">評価</p>
            <img alt="" className="size-[10px]" src={starBadgeIcon} />
            <p className="font-medium leading-[100.07%] text-[#83570d] text-[11px] whitespace-nowrap">{course.楽単度}</p>
          </div>
          <BookmarkButton courseId={course.id} size={20} />
        </div>
      </div>
      <div className="flex flex-col gap-[6px] items-start w-full">
        <div className="flex gap-[8px] items-center w-full min-w-0">
          <img alt="" className="size-[18px] shrink-0" src={personIcon} />
          <p className="font-medium leading-[130%] text-[#4b5768] text-[15px] truncate min-w-0 flex-1">{course.担当教員}</p>
        </div>
        <div className="flex gap-[8px] items-center w-full min-w-0">
          <img alt="" className="size-[18px] shrink-0" src={locationIcon} />
          <p className="font-medium leading-[130%] text-[#4b5768] text-[15px] truncate min-w-0 flex-1">{course.学部学科}</p>
        </div>
        <div className="flex gap-[8px] items-center w-full min-w-0">
          <img alt="" className="size-[18px] shrink-0" src={clockIcon} />
          <p className="font-medium leading-[130%] text-[#4b5768] text-[15px] truncate min-w-0 flex-1">
            {course.開講学期}・{course.曜日}曜{course.時限}限
          </p>
        </div>
      </div>
    </button>
  );
}
