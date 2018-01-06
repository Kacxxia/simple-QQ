import React from 'react';
import { Button, Icon } from 'semantic-ui-react'

import { closeWindow, addSth } from '../actions/index'

const Header = ({add, userSelf}) => {
    const addBar = add ? <Button circular icon="plus" onClick={() => addSth(userSelf.userId)} className="no-drag" /> : <div>&nbsp;</div>
    return (
        <div style={{ width: '100%', height: '100%', backgroundImage: "url('./resource/bg-header.png')", backgroundSize: 'cover' }} className="d-flex justify-content-between align-items-center draggable">
            <div
                style={{ color: 'white', fontWeight: 'bold', fontSize: 36}}
            >
                {add ? userSelf.name : ''}
            </div>
            {addBar}
            <div style={{ cursor: 'pointer'}} onClick={closeWindow} className="no-drag" >
                <Icon name="close" color="teal" size="large" />
            </div>
        </div>
    );
};

export default Header;
