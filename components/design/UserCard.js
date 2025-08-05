import React from 'react'

const UserCard = ({role}) => {
    return (
        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
            <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                <div className="ps-3">
                    <div className="text-base">John Doe</div>
                </div>
            </th>
            <td className="px-6 py-4">
                <div className="font-normal text-gray-500">john.doe@niagaracollegetoronto.ca</div>
            </td>
            <td className="px-6 py-4">
                {role}
            </td>
            <td className="px-6 py-4">
                <button className='text-red-500 hoverLtext-red-600 font-medium mr-3'>Delete</button>
                <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit user</a>
            </td>
        </tr>
    )
}

export default UserCard