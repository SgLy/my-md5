'use strict';

/* global angular */
/* eslint-disable no-console */
/* exported recallMyLastMessage */

const msgTypeList = {
    1: 'text',
    3: 'image',
    34: 'sound',
    42: 'contact card',
    43: 'video',
    47: 'emoticon',
    49: 'file, link or article'
};
const msgSubTypeList = {
    0: 'pure text',
    48: 'geo-location'
};

function sendTextMessage(text) {
    angular.element('#editArea').scope().editAreaCtn = text;
    angular.element('#editArea').scope().sendTextMessage();
}

function parseContent(content) {
    let type = msgTypeList[content.data('cm').msgType];
    if (type === 'text')
        type = msgSubTypeList[content.data('cm').subType];
    let text = content.text().trim();
    return [type, text];
}

function onNewMessage(element) {
    let content = $('.content:not(.ng-scope)', element).children();
    if (content.data('cm') === undefined)
        return;
    let sender = $('.message', element).hasClass('me') ? 'me' : 'you';
    let type, text;
    [type, text] = parseContent(content);
    let logMessage = `[NewMessage] type: ${type}, sender: ${sender}`;
    let autoReplyMessage = `[AutoReply] I received your ${type} message`;
    if (type === 'pure text') {
        logMessage += `, content: ${text}`;
        autoReplyMessage += `: "${text}"`;
    }
    console.log(logMessage);
    if (autoReply === true && sender === 'you')
        sendTextMessage(autoReplyMessage);
}

function onRecallMessage(element) {
    let sender = $(element).hasClass('me') ? 'me' : 'you';
    let senderName = sender === 'me' ? 'You' : $('.title_name').text();
    let content = $('.content:not(.ng-scope)', element).children();
    let type, text;
    [type, text] = parseContent(content);
    let logMessage = `[RecallMessage] ${senderName} recalled a ${type} message`;
    if (type === 'pure text')
        logMessage += `: "${text}"`;
    console.log(logMessage);
}

function recallMyLastMessage() {
    $('.bubble:last').trigger({
        type: 'contextmenu',
        path: $('.bubble:last')
    });
    angular.element('[ng-repeat="item in contextMenuList"]').scope().item.callback();
}

let autoReply = false;
let chatWindow = $('div[mm-repeat="message in chatContent"]')[0];
new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            if (mutation.addedNodes.length > 0) {
                let element = mutation.addedNodes[0];
                if ($(element).attr('ng-repeat') === 'message in chatContent')
                    onNewMessage(element);
            } else if (mutation.removedNodes.length > 0) {
                let element = mutation.removedNodes[0];
                onRecallMessage(element);
            }
        }
    });
}).observe(chatWindow, {
    childList: true,
    subtree: true,
    characterDataOldValue: true
});
