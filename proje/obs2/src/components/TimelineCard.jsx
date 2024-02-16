import React from "react";

export default function TimelineCard() {
  return (
    <div className="bg-white rounded-3xl shadow-lg h-[350px] p-4 overflow-y-scroll ">
      <h1 className=" font-semibold text-xl mb-2 text-center ">Salı</h1>
      <div>
        <div className="flex items-center justify-around">
          <span>09:00</span>
          <span>10:00</span>

          <span>11:00</span>

          <span>12:00</span>

          <span>13:00</span>

          <span>14:00</span>

          <span>15:00</span>

          <span>16:00</span>
        </div>
        <div className=" border-black border-b-2 "></div>
       <div className="mt-4 space-y-4">
       <div className="w-36 h-9 flex items-center justify-center   rounded-3xl bg-[#717EEE]">
<span className="text-sm text-white">Anayasa E-4</span>

</div>

<div className="w-64 ml-48 h-9 flex items-center justify-center   rounded-3xl bg-[#84D296]">
<span className="text-sm text-white">Anayasa E-4</span>
</div>
<div className="w-48 h-9 ml-96 flex items-center justify-center   rounded-3xl bg-[#FF7783]">
<span className="text-sm text-white">Anayasa E-4</span>
</div>
<div className="w-52 h-9 ml-[450px] flex items-center justify-center   rounded-3xl bg-[#37B8FC]">
<span className="text-sm text-white">Anayasa E-4</span>
</div>
<div className="w-96 h-9 ml-48 flex items-center justify-center   rounded-3xl bg-[#717EEE]">
<span className="text-sm text-white">Anayasa E-4</span>
</div>
       </div>
      </div>
    </div>
  );
}
