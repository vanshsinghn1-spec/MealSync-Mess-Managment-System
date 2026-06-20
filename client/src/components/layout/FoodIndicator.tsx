"use client";

export default function FoodIndicator({ isVeg }: { isVeg: boolean }) {
  if (isVeg) {
    return (
      <div 
        className="flex-shrink-0 w-[18px] h-[18px] border border-emerald-600/40 rounded flex items-center justify-center bg-emerald-950/20 select-none" 
        title="Vegetarian"
      >
        <div className="w-[8px] h-[8px] rounded-full bg-emerald-500" />
      </div>
    );
  }
  return (
    <div 
      className="flex-shrink-0 w-[18px] h-[18px] border border-red-600/40 rounded flex items-center justify-center bg-red-950/20 select-none" 
      title="Non-Vegetarian"
    >
      <div className="w-0 h-0 border-l-[4.5px] border-l-transparent border-r-[4.5px] border-r-transparent border-b-[8px] border-b-red-500" />
    </div>
  );
}
