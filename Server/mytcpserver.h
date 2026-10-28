#ifndef MYTCPSERVER_H
#define MYTCPSERVER_H

#include "mytcpsocket.h"

#include <QObject>
#include <QTcpServer>
#include <QThreadPool>

class MyTcpServer : public QTcpServer
{
    Q_OBJECT
public:
    static MyTcpServer& getInstance();//静态函数，用来返回单例
    void incomingConnection(qintptr handle) override;//重写父类函数
    void removeSocket(MyTcpSocket *mySocket);
    void resend(char* caTarName,PDU* pdu);
    QThreadPool threadPool;
private:
    MyTcpServer();//将构造函数改为类内访问，不可以类外创建对象
    MyTcpServer(const MyTcpServer& instance)=delete;//禁用拷贝构造
    MyTcpServer& operator=(const MyTcpServer&)=delete;//禁用赋值重载
    QList<MyTcpSocket*>m_tcpSocktList;//socket存储的列表
};

#endif // MYTCPSERVER_H
