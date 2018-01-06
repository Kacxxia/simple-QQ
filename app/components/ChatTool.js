import React from 'react';
import { connect } from 'react-redux'
import { Button, Popup } from 'semantic-ui-react'

import EmojiPanel from './EmojiPanel'
import { addEmoji } from '../actions/main'

function ChatTool({onAddEmoji, onSendFile, onSendImage}){
    return (
        <div style={{height: '100%'}}>
            <Button.Group basic size='small'>
                <Popup
                    trigger={<Button icon='smile' />}
                    content={<EmojiPanel onAddEmoji={onAddEmoji}/> }
                    hoverable={true}
                />
                <Button icon='image' onClick={onSendImage}/>
                <Button icon='file' onClick={onSendFile}/>
            </Button.Group>
        </div>
    );
};

export default connect(null, dispatch => {
    return {
        onAddEmoji: (value) => dispatch(addEmoji(value))
    }
})(ChatTool);