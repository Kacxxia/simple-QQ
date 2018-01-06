import React, { Component } from 'react';
import { TextArea, Button, Card } from 'semantic-ui-react'
import ChatTool from './ChatTool'


class ChatArea extends Component {
    scrollToBottom(){
        console.log(this)
        this.messageEnd.scrollIntoView({behavior: "smooth"})
    }
    componentDidMount() {
        this.scrollToBottom()
    }
    componentDidUpdate() {
        this.scrollToBottom()
    }
    render(){
        return (
            <div style={{height: '100%', width: '100%'}}>
                <div style={{height: '75%', padding: 14, overflowY: 'auto'}}>
                    {this.props.history.map((his, index) => {
                        const color = his.isSelf ? 'lightblue' : 'grey'
                        const posClass = his.isSelf ? 'justify-content-end' : 'justify-content-start'
                        const triangleClass = his.isSelf ? 'triangle-after' : 'triangle-before'
                        const content = his.messageType === 'image' ? (
                            <div style={{maxWidth: 650, maxHeight: 340, overflow: 'auto'}}>
                                <img src={`data:text/plain;base64,${his.content}`} style={{width: '100%'}}/>
                            </div>) : his.content
                        let name 
                        if (!his.isSelf){
                            name = his.groupId === undefined ? this.props.targetInfo.name :this.props. targetInfo[his.userId].name
                        } else {
                            name = '我'
                        }
                        const ConfirmReceiveFileButton = his.messageType === 'file' ? (
                            <Button onClick={() => this.props.onConfirmReceiveFile(his.fileId)}>确定接收</Button>
                        ) : null
                        return (
                            <div key={`${index}`} className={`d-flex ${posClass} chat-record-self ${triangleClass}`} style={{marginBottom: 16, position: 'relative'}}>
                                <div style={{borderRadius: 4, backgroundColor: color, display:'inline-block', padding: 16}}>
                                    <div>{name}</div>
                                    <div>{his.time}</div>
                                    <div>{content}</div>
                                    <ConfirmReceiveFileButton />
                                </div>
                            </div>
                        )
                    })}
                    <div  ref={(el) => this.messageEnd = el}></div>
                </div>
                <div style={{height: '25%', padding: 12, borderTop: '1px solid #aaa'}}>
                    <div style={{height: '26%', marginBottom: 14}} >
                        <ChatTool onSendFile={this.props.onSendFile} onSendImage={this.props.onSendImage} />
                    </div>
                    <div style={{height: '74%', position: 'relative'}}>
                        <TextArea style={{height: '100%', width: '100%', border: 'none'}} value={this.props.chatInput} onChange={(e) =>this.props. onChangeChatInput(e.target.value)}/>
                        <div style={{position: 'absolute', bottom: 0, right: 0}}>
                            <Button primary onClick={this.props.onSendChatMessage}>发送</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ChatArea;