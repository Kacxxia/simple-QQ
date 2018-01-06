import React from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { createSelector } from 'reselect'
import { Button, TextArea, Card } from 'semantic-ui-react'


import { judgeIdType } from '../actions/index'
import { 
    confirmAddFriend, 
    changeChatInput, 
    sendChatMessage, 
    sendImage, 
    sendFile,
    confirmReceiveFile
} from '../actions/mainAction'
import ChatArea from './ChatArea'

const Dashboard = ({
    type,
    history,
    targetInfo,
    selfId,
    chatInput,
    onConfirmAddFriend,
    onChangeChatInput,
    onSendChatMessage,
    onSendFile,
    onSendImage,
    onConfirmReceiveFile
}) => {
    const content = chooseWhatToRender(type, history, targetInfo, selfId, onConfirmAddFriend, chatInput, onChangeChatInput, onSendChatMessage, onSendFile, onSendImage, onConfirmReceiveFile)
    return (
        <div style={{ width: '100%', height: '98%' }}>
            {content}
        </div>
    );
};

Dashboard.propTypes = {
    type: PropTypes.string.isRequired,
    history: PropTypes.array.isRequired,
    targetInfo: PropTypes.object,
    selfId: PropTypes.string.isRequired,
    onConfirmAddFriend: PropTypes.func.isRequired
}

function chooseWhatToRender(type, history, targetInfo, selfId, onConfirmAddFriend, chatInput, onChangeChatInput, onSendChatMessage, onSendFile, onSendImage, onConfirmReceiveFile) {
    switch (type) {
        case 'none':
            return <Initial />
        case 'friend':
            return <FriendChat 
                        history={history}
                        targetInfo={targetInfo}
                        selfId={selfId}
                        chatInput={chatInput}
                        onChangeChatInput={onChangeChatInput}
                        onSendChatMessage={() => onSendChatMessage('friend', targetInfo, selfId)}
                        onSendFile={() => onSendFile('friend', targetInfo, selfId)}
                        onSendImage={() => onSendImage('friend', targetInfo, selfId)}
                        onConfirmReceiveFile={onConfirmReceiveFile}
                    />
        case 'group':
            return <GroupChat
                        history={history} 
                        targetInfo={targetInfo} 
                        selfId={selfId}
                        chatInput={chatInput}
                        onChangeChatInput={onChangeChatInput}
                        onSendChatMessage={onSendChatMessage}
                        onSendChatMessage={() => onSendChatMessage( 'group', targetInfo, selfId)}
                        onSendFile={() => onSendFile('group', targetInfo, selfId)}
                        onSendImage={() => onSendImage('group', targetInfo, selfId)}
                        onConfirmReceiveFile={onConfirmReceiveFile}
                    />
        case 'system':
            return <SystemMessage 
                        history={history} 
                        selfId={selfId} 
                        onConfirmAddFriend={onConfirmAddFriend}
                    />
        default:
            throw new Error('type is wrong!!')
    }
}

const Initial = () => {
    return (
        <div style={{height: '100%', width: '100%', color: '#aaa', fontSize: 54}} className='d-flex align-items-center justify-content-center'>
            empty
        </div>
    )
}

function FriendChat ({history, targetInfo, selfId, chatInput, onChangeChatInput, onSendChatMessage, onSendFile, onSendImage, onConfirmReceiveFile}) {
    return (
        <div style={{height: '100%', width: '100%'}}>
            <div style={{height: '6%', width: '100%', padding: 14, borderBottom: '1px solid #aaa', fontSize: 24}} className='d-flex align-items-center'>
                {targetInfo.name}
            </div>
            <div style={{height: '94%'}}>
                <ChatArea 
                    history={history} 
                    selfId={selfId} 
                    targetInfo={targetInfo} 
                    chatInput={chatInput}
                    onChangeChatInput={onChangeChatInput}
                    onSendChatMessage={onSendChatMessage}
                    onSendFile={onSendFile}
                    onSendImage={onSendImage}
                    onConfirmReceiveFile={onConfirmReceiveFile}
                />
            </div>
        </div>
    )
}

const GroupChat = ({history, targetInfo, selfId, chatInput, onChangeChatInput, onSendChatMessage, onSendFile, onSendImage, onConfirmReceiveFile}) => {
    return (
        <div style={{height: '100%', width: '100%'}}>
            <div 
                style={{height: '6%', width: '100%', padding: 14, borderBottom: '1px solid #aaa', fontSize: 24}} 
                className='d-flex align-items-center'
            >
                {targetInfo.groupName}
            </div>
            <div style={{height: '94%'}} className='d-flex'>
                <div style={{width: '80%', borderRight: '1px solid #aaa'}}> 
                    <ChatArea 
                        history={history} 
                        selfId={selfId} 
                        targetInfo={targetInfo} 
                        chatInput={chatInput}
                        onChangeChatInput={onChangeChatInput}
                        onSendChatMessage={onSendChatMessage}
                        onSendFile={onSendFile}
                        onSendImage={onSendImage}
                        onConfirmReceiveFile={onConfirmReceiveFile}
                    />
                </div>
                <div style={{width: '20%'}}>
                    成员
                    {Object.values(targetInfo.member).map((m, i) => {
                        const onlineStatus = m.isOnline ? '[在线]' : '[离线]'
                        return (<Card 
                                    fluid
                                    raised={false}
                                    key={`member${i}`}
                                >
                                    {`${onlineStatus} ${m.name}`}
                                </Card>) 
                    })}
                </div>
            </div>
        </div>
    )
}

const SystemMessage = ({selfId, history, onConfirmAddFriend}) => {
    return (
        <div style={{height: '100%', width: '100%'}}>
            <div 
                style={{height: '6%', width: '100%', padding: 14, borderBottom: '1px solid #aaa', fontSize: 24}} 
                className='d-flex align-items-center'
            >
                系统通知
            </div>
            <div style={{height: '94%', overflowY: 'auto'}}>
                {history.map((h, i) => {
                    let content 
                    if (h.type === 'requestAddFriend') {
                        content = (
                            <div className='d-flex align-items-between'>
                                {`${h.content}`}
                                <Button
                                    onClick={() => onConfirmAddFriend(selfId, h.info)}
                                >
                                    同意
                                </Button>
                            </div>
                        )
                    }  else {
                        content = h.content
                    }
                    return (
                        <Card 
                            fluid
                            raised={false}
                            header={h.time}
                            description={content}
                            key={i}
                        />    
                    )
                })}
            </div>
        </div>
    )
}

const typeSelector = state => state.chat.type
const targetSelector = state => state.chat.target
const recordSelector = state => state.chat.record
const database = state => state.main.database
const histroySelector = createSelector(
    [typeSelector, targetSelector, recordSelector],
    (type, tar, rec) => {
        switch(type) {
            case 'friend':
                return rec.friend[tar]
            case 'group':
                return rec.group[tar]
            case 'system':
                return rec.system
            case 'none':
                return []
            default: 
                throw new Error('error ocurred in choosing history')
        }
    }
)
const targetInfoSelector = createSelector(
    [typeSelector, targetSelector, database],
    (type, tar, db) => {
        switch (type) {
            case 'friend':
                return db.friend[tar]
            case 'group':
                return db.group[tar]
            case 'system':
                return { name:'系统通知' }
            case 'none':
                return null
        }
    }
)
export default connect(state => {
    return {
        type: state.chat.type,
        chatInput: state.chat.chatInput,
        selfId: state.main.database.self.userId,
        history: histroySelector(state),
        targetInfo: targetInfoSelector(state)
    }
}, dispatch => {
    return {
        onConfirmAddFriend: ((selfId, targetId) => dispatch(confirmAddFriend(selfId, targetId))),
        onChangeChatInput: ((value) => dispatch(changeChatInput(value))),
        onSendChatMessage: ((type, tarInfo, selfId) => dispatch(sendChatMessage(type, tarInfo, selfId))),
        onSendFile: ((type, tarInfo, selfId) => dispatch(sendFile(type, tarInfo, selfId))),
        onSendImage: ((type, tarInfo, selfId) => dispatch(sendImage(type, tarInfo, selfId))),
        onConfirmReceiveFile: (fileId) => dispatch(confirmReceiveFile(fileId))
    }
})(Dashboard);