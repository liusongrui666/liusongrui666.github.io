#include "clienttask.h"
#include "mytcpsocket.h"

#include <qtcpsocket.h>

ClientTask::ClientTask(MyTcpSocket *socket):QObject(socket)
{
    m_socket=socket;
}

void ClientTask::run()
{
    connect(m_socket,&QTcpSocket::readyRead,m_socket,&MyTcpSocket::recvMsg);//收到消息会有信号，将信号和槽函数连接
    connect(m_socket,&QTcpSocket::disconnected,m_socket,&MyTcpSocket::clientOffline);//断开连接信号和槽函数连接
}
