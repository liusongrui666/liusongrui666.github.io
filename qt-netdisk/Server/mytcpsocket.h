#ifndef MYTCPSOCKET_H
#define MYTCPSOCKET_H

#include "msghandler.h"
#include "protocol.h"

#include <QObject>
#include <qtcpsocket.h>

class MyTcpSocket : public QTcpSocket
{
    Q_OBJECT
public:
     QString m_strLoginName;
     MsgHandler* m_pmh;
     MyTcpSocket();
     void sendMsg(PDU* pdu);
     PDU* readMsg();
     QByteArray buffer;
     PDU* handleMsg(PDU* pdu);
     ~MyTcpSocket();

public slots:
    void recvMsg();
    void clientOffline();
};

#endif // MYTCPSOCKET_H
