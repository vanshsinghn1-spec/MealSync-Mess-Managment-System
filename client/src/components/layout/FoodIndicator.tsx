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
      className="flex-shrink-0 w-[18px] h-[18px] border border-rose-600/60 rounded flex items-center justify-center bg-rose-950/20 select-none" 
      title="Non-Vegetarian"
    >
      <div className="w-[8px] h-[8px] rounded-full bg-rose-500" />
    </div>
  );
}
