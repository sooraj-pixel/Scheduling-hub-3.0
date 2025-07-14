// import React from 'react'

// const StaffCard = () => {
//     return (
//         <div className="bg-gray-100 p-5 mb-5 rounded-md">
//             <h4 className="h4 text-xl flex gap-1 mb-2">
//                 <img src="./navbar/schedule.svg" alt="" width={25} />
//                 February 15
//             <span className='!font-sm font-normal'>- Wednesday</span>
//             </h4>
//             <ul className="">
//                 <ul className='text-base'>Academics: John, John</ul>
//                 <ul className='text-base'>Adivor: John, John</ul>
//                 <ul className='text-base'>Academics: John, John</ul>
//             </ul>
//         </div>
//     )
// }

// export default StaffCard

import React from 'react';

const StaffCard = ({ groupedData }) => {
    return (
        <div className="space-y-8 p-4">
            {Object.entries(groupedData).map(([week, schedules]) => (
                <div key={week} className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Week {week}</h2>
                    <table className="min-w-full border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">Team</th>
                                <th className="border p-2">Day</th>
                                <th className="border p-2">Date</th>
                                <th className="border p-2">Names</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map(schedule => (
                                <tr key={schedule.id} className="text-center">
                                    <td className="border p-2">{schedule.team}</td>
                                    <td className="border p-2">{schedule.day}</td>
                                    <td className="border p-2">
                                        {new Date(schedule.date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "2-digit"
                                        })}
                                    </td>
                                    <td className="border p-2">{schedule.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default StaffCard;
