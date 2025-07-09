import React, { Suspense } from 'react'
import { GridLoader } from 'react-spinners'

const layout = ({children}) => {
  return (
    <div className='px-5'>
        <div className = "flex items-center justify-between mb-5 ">
            <h1 className='text-6xl font-bold gradient-title'>Industry Insights</h1>
        </div>
        <Suspense fallback={<GridLoader className='mt-4' width={"100%"} color='gray' />}>
            {children}
        </Suspense>
        {children}
    </div>
  )
}

export default layout
