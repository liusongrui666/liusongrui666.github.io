#include "clienttask.h"
#include "mytcpserver.h"
#include "mytcpsocket.h"
MyTcpServer &MyTcpServer::getInstance()
{
    static MyTcpServer instance;//通过静态函数定义单例
    return instance;//返回单例
}

void MyTcpServer::incomingConnection(qintptr handle)//重写连接调用函数
{
    qDebug()<<"新客户端连接";
    MyTcpSocket* pTcpSocket=new MyTcpSocket;//建立连接的时候建立socket
    pTcpSocket->setSocketDescriptor(handle);//socket和handle联系起来
    m_tcpSocktList.append(pTcpSocket);//存入列表
    ClientTask* task=new ClientTask(pTcpSocket);
    threadPool.start(task);
}

void MyTcpServer::removeSocket(MyTcpSocket *mySocket)
{
    m_tcpSocktList.removeOne(mySocket);
    mySocket->deleteLater();
    mySocket=NULL;
}

void MyTcpServer::resend(char *caTarName, PDU *pdu)
{
    if(caTarName==NULL || pdu==NULL){
        return;
    }
    for(int i=0;i<m_tcpSocktList.size();i++){
        if(caTarName==m_tcpSocktList[i]->m_strLoginName){
            m_tcpSocktList[i]->write((char*)pdu,pdu->uiTotalLen);
            qDebug()<<"resend Msg pdu->uiTotalLen"<<pdu->uiTotalLen//打印输出
                    <<"pdu->uiMsgLen"<<pdu->uiMsgLen
                    <<"pdu->uiType"<<pdu->uiType;
            break;
        }
    }

}

MyTcpServer::MyTcpServer()
{
    threadPool.setMaxThreadCount(8);
}
