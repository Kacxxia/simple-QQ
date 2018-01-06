import React from 'react';

const RedPoint = ({show}) => {
    if (show) {
        return (
            <div className='d-flex align-items-center justify-content-center' style={{padding: 2}} >
                <div style={{border: '4px solid red', borderRadius: '50%', height: 0, width: 0}}>
                    &nbsp;
                </div>
            </div>
        );
    };
        return null
}

export default RedPoint;