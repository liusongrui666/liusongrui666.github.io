#include "mytcpserver.h"
#include "server.h"
#include <QDebug>
#include <QFile>
Server::Server(QWidget *parent)
    : QWidget(parent)
{
    loadconfig();
    MyTcpServer::getInstance().listen(QHostAddress(m_strIP),m_usPort);
}

Server &Server::getInstance()
{
    static Server instance;
    return instance;
}

void Server::loadconfig()
{
    QFile file("://connect.config");//打开文件
    if(!file.open(QIODevice::ReadOnly)){//判断是否已只读格式打开
        qDebug()<<"打开失败，请重试";//输出错误信息
        return;
    }
    QByteArray baData=file.readAll();//以函数返回的QByteArray格式读取文件中的值
    QString strData=QString(baData);//转为字符串
    qDebug()<<"strData"<<strData;//打印输出
    QStringList strList=strData.split("\r\n");//去除乱码
    m_strIP=strList[0];//进行赋值
    m_usPort=strList[1].toUShort();//进行赋值，并且将字符串转为quint16
    m_strRootPath=strList[2];
    qDebug()<<"IP"<<m_strIP<<"Port"<<m_usPort<<"RootPath"<<m_strRootPath;
    file.close();//关闭文件
}

Server::~Server()
{
}
