import React from 'react'

export default function LessonTable({dersler,index}) {
  return (
    <table className="w-11/12 m-auto bg-white border border-gray-300">
    <thead>
      <tr className='bg-[#1C2534] text-white'>
        <th className="py-2 px-2 text-center border-b">Ders Adı</th>
        <th className="py-2 px-2 text-center border-b">Ders Kredisi</th>
        <th className="py-2 px-2 text-center border-b">Dönem</th>
      </tr>
    </thead>
    <tbody>
      {dersler.map((ders) => (
        <tr key={ders.id} className="hover:bg-gray-100">
          
          <td className="py-2 px-2 text-center border-b">{ders.DersAdi}</td>
          <td className="py-2 px-2 text-center border-b">{ders.kredi}</td>
          <td className="py-2 px-2 text-center border-b">
         {index}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  )
}
