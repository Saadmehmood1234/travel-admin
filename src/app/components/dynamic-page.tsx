import React from 'react'
import ContentTitleBar from './content-title-bar'
import DynamicTable from './dynamic-table'
import { type ContentTitleBarProps } from '@/types'
const DynamicPage = ({contentTitleBarContent,tableContent}:{
contentTitleBarContent:ContentTitleBarProps,
tableContent:any
}) => {
    // Content title bar 
    // table 
    // modal for crud operation
    return (
        <div className='flex flex-col gap-4'>
            <ContentTitleBar contentTitleBarContent={contentTitleBarContent} />
            <DynamicTable columns={tableContent?.columns} data={tableContent?.rows} />
        </div>
    )
}

export default DynamicPage
