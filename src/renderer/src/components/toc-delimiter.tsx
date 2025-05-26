import React from 'react';
import DragHandle from './icons/DragHandle';

interface TocContentDelimiterProps {
    text?: string;
    className?: string;
}

const TocContentDelimiter: React.FC<TocContentDelimiterProps> = ({
    text = "",
    className = "",
}) => {
    return (
        <div className='flex flex-col items-center'>
            <div className={`flex items-center w-[95%] border-b border-grey-60 py-0 bg-gray-50 my-2 ${className}`}>
                <DragHandle className="mr-1" size={18} />
                <span className="text-[11px] font-semibold text-grey-40">{text}</span>
            </div>
        </div>
    );
};

export default TocContentDelimiter;