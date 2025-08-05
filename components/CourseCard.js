import React from 'react'

const CourseCard = ({ name, url_link, image_url }) => {

    return (
        <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 group relative overflow-hidden">

            <a href={url_link}>
                <img className="rounded-t-lg w-full h-2/3 transition-transform duration-300 group-hover:scale-110"
                    src={image_url} width={300} alt=""
                />
                <div className="p-5 pb-1">
                    <h5 className="h3">
                        {name}
                    </h5>
                    <button className='btn-link flex-center mt-2 text-sm'>
                        Learn more
                        <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                        </svg>
                    </button>
                </div>
            </a>
        </div>
    )
}

export default CourseCard