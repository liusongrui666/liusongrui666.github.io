#include "mytcpserver.h"
#include "mytcpsocket.h"
#include "operatedb.h"
#include "protocol.h"
#include<QDebug>
#include <QFile>
#include <QTextStream>
MyTcpSocket::MyTcpSocket()
{
    m_pmh=new MsgHandler;
    //readyRead/disconnected 的 connect 在 ClientTask::run() 中建立（与课堂笔记一致），
    //此处不能重复连接，否则每条消息会被处理两遍
}

void MyTcpSocket::sendMsg(PDU *pdu)
{
    if(pdu==NULL){
        return;
    }
    this->write((char*)pdu,pdu->uiTotalLen);
    qDebug()<<"send Msg pdu->uiTotalLen"<<pdu->uiTotalLen//打印输出
            <<"pdu->uiMsgLen"<<pdu->uiMsgLen
            <<"pdu->uiType"<<pdu->uiType;
    free(pdu);//释放respdu
    pdu=NULL;//置空
}

PDU *MyTcpSocket::readMsg()
{
    qDebug()<<"readMsg 接收消息长度"<<this->bytesAvailable();
    uint uiPDULen=0;//定义缓冲区，用来读消息的长度
    this->read((char*)&uiPDULen,sizeof(uint));//将数据读入缓冲区
    uint uiMsgLen=uiPDULen-sizeof(PDU);//得到柔性数组的大小
    PDU *pdu=mkPDU(uiMsgLen);//根据长度申请空间
    this->read((char*)pdu+sizeof(uint),uiPDULen-sizeof(uint));//参数1：偏移到正确位置 参数2：后面还有的长度
    return pdu;
}

PDU *MyTcpSocket::handleMsg(PDU* pdu)
{
    qDebug()<<"handleMsg pdu->uiTotalLen"<<pdu->uiTotalLen//打印输出
            <<"pdu->uiMsgLen"<<pdu->uiMsgLen
            <<"pdu->uiType"<<pdu->uiType;
    PDU* respdu=NULL;
    m_pmh->pdu=pdu;
    switch(pdu->uiType){//对pdu进行类型判断
    case ENUM_TYPE_REQUEST:{
        respdu=m_pmh->regist();
        break;
        }
    case ENUM_TYPE_LOGIN_REQUEST:{
        respdu=m_pmh->login(m_strLoginName);
        break;
        }
    case ENUM_TYPE_FIND_USER_REQUEST:{
        respdu=m_pmh->findUser();
        break;
        }
    case ENUM_TYPE_ONLINE_USER_REQUEST:{
        respdu=m_pmh->onlineUser();
        break;
        }
    case ENUM_TYPE_ADD_FRIEND_REQUEST:{
        respdu=m_pmh->addFriend();
        break;
        }
    case ENUM_TYPE_ADD_FRIEND_AGREE_REQUEST:{
        respdu=m_pmh->addFriendAgree();
        break;
        }
    case ENUM_TYPE_FLUSH_FRIEND_REQUEST:{
        respdu=m_pmh->flushFriend();
        break;
        }
    case ENUM_TYPE_DEL_FRIEND_REQUEST:{
        respdu=m_pmh->DelFriend();
        break;
        }
    case ENUM_TYPE_CHAT_REQUEST:{
        respdu=m_pmh->chat();
        break;
        }
    case ENUM_TYPE_MKDIR_REQUEST:{
        respdu=m_pmh->mkdir();
        break;
        }
    case ENUM_TYPE_FLUSH_FILE_REQUEST:{
        respdu=m_pmh->flushFile();
        break;
        }
    case ENUM_TYPE_DEL_FILE_REQUEST:{
        respdu=m_pmh->delFile();
        break;
        }
    case ENUM_TYPE_RENAME_REQUEST:{
        respdu=m_pmh->rename();
        break;
        }
    case ENUM_TYPE_UPLOAD_INIT_REQUEST:{
        respdu=m_pmh->uploadfileinit();
        break;
        }
    case ENUM_TYPE_UPLOAD_FILE_DATA_REQUEST:{
        respdu=m_pmh->uploadfiledata();
        break;
        }
    case ENUM_TYPE_UPLOAD_CHUNK_REQUEST:{
        respdu=m_pmh->uploadChunk();
        break;
        }
    case ENUM_TYPE_UPLOAD_FINISH_REQUEST:{
        respdu=m_pmh->finishUpload();
        break;
        }
    case ENUM_TYPE_UPLOAD_RESUME_REQUEST:{
        respdu=m_pmh->resumeUpload();
        break;
        }
    case ENUM_TYPE_DOWNLOAD_FILE_REQUEST:{
        respdu=m_pmh->downloadFile();
        break;
        }
    case ENUM_TYPE_DOWNLOAD_FILE_DATA_REQUEST:{
        //文件数据由MsgHandler直接循环写入socket，不需要返回respdu
        m_pmh->downloadFileData(this);
        break;
        }

    default:
        break;
    }
    return respdu;
}

MyTcpSocket::~MyTcpSocket()
{
    delete m_pmh;
}


void MyTcpSocket::recvMsg()
{
    qDebug()<<"recvMsg 接收消息长度"<<this->bytesAvailable();
    QByteArray data=this->readAll();
    buffer.append(data);
    while(buffer.size()>=int(sizeof(PDU))){
        PDU* pdu=(PDU*)buffer.data();
        if(buffer.size()<int(pdu->uiTotalLen)){
            break;
        }
        PDU* respdu=handleMsg(pdu);
        sendMsg(respdu);
        buffer.remove(0,pdu->uiTotalLen);
    }
}

void MyTcpSocket::clientOffline()
{
    OperateDB::getInstance().handleOffline(m_strLoginName.toStdString().c_str());
    MyTcpServer::getInstance().removeSocket(this);
}
