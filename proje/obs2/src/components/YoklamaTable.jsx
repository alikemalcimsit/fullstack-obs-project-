import React from 'react';

export default function YoklamaTable({ dersler, yoklama }) {
  console.log('dersler:', dersler);
  console.log('yoklama:', yoklama);

  return (
    <table className="w-11/12 m-auto bg-white border border-gray-300">
      <thead>
        <tr className='bg-[#1C2534] text-white'>
          <th className="py-2 px-2 text-center border-b">Ders Adı</th>
          <th className="py-2 px-2 text-center border-b">Ders Kredisi</th>
          <th className="py-2 px-2 text-center border-b">Dönem</th>
          <th className="py-2 px-2 text-center border-b">Durum</th>
        </tr>
      </thead>
      <tbody>
        {dersler &&
          dersler.map((ders) => {
            // Ensure that yoklama is defined and is an array
            if (yoklama && Array.isArray(yoklama)) {
              const attendanceCount = yoklama.filter((y) => y.DersID === ders.DersID && y.Durum === 'Var').length;
              const totalSessions = yoklama.filter((y) => y.DersID === ders.DersID).length;
              const attendancePercentage = ((attendanceCount / totalSessions) * 100).toFixed(2);

              return (
                <tr key={ders.DersID} className="hover:bg-gray-100">
                  <td className="py-2 px-2 text-center border-b">{ders.DersAdi}</td>
                  <td className="py-2 px-2 text-center border-b">{ders.kredi}</td>
                  <td className="py-2 px-2 text-center border-b">{ders.DonemID}</td>
                  <td className="py-2 px-2 text-center border-b">
                    {`${attendanceCount}/${totalSessions} (%${attendancePercentage} Katılım)`}
                  </td>
                </tr>
              );
            }

            // Handle the case where yoklama is not defined or not an array
            return (
              <tr key={ders.DersID} className="hover:bg-gray-100">
                <td className="py-2 px-2 text-center border-b">{ders.DersAdi}</td>
                <td className="py-2 px-2 text-center border-b">{ders.kredi}</td>
                <td className="py-2 px-2 text-center border-b">{ders.DonemID}</td>
                <td className="py-2 px-2 text-center border-b">Yoklama Bilgisi Yok</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}
