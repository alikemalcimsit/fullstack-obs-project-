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
        {Array.isArray(dersler) && dersler.map((ders) => {
          if (Array.isArray(yoklama) && yoklama.length > 0) {
            const dersYoklamalari = yoklama.filter((y) => y.DersID === ders.DersID);
            const attendanceCount = dersYoklamalari.filter((y) => (y.Durum || '').toLowerCase() === 'var').length;
            const totalSessions = dersYoklamalari.length;
            const attendancePercentage = totalSessions > 0 ? ((attendanceCount / totalSessions) * 100).toFixed(2) : '0.00';

            return (
              <tr key={ders.DersID} className="hover:bg-gray-100">
                <td className="py-2 px-2 text-center border-b">{ders.DersAdi}</td>
                <td className="py-2 px-2 text-center border-b">{ders.kredi}</td>
                <td className="py-2 px-2 text-center border-b">{ders.DonemID}</td>
                <td className="py-2 px-2 text-center border-b">
                  {totalSessions > 0
                    ? `${attendanceCount}/${totalSessions} (%${attendancePercentage} Katılım)`
                    : 'Yoklama Bilgisi Yok'}
                </td>
              </tr>
            );
          }

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
