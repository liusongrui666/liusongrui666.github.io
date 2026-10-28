#ifndef CLIENT_H
#define CLIENT_H

#include "protocol.h"
#include "reshandle.h"

#include <QTcpSocket>
#include <QWidget>

QT_BEGIN_NAMESPACE
namespace Ui { class Client; }
QT_END_NAMESPACE

class Client : public QWidget
{
    Q_OBJECT

public:
    ~Client();
    void loadconfig();//定义加载配置函数
    static Client& getInstance();//静态函数，用来返回单例
    PDU* readMsg();
    void handleMsg(PDU* pdu);
    QString m_strIP;//定义IP
    quint16 m_usPort;//定义端口号
    QTcpSocket m_socket;//定义TCP对象用来网络通信
    QString m_strRootPath;//定义用户文件根目录
    QString m_strLOginName;
    Reshandle* m_prh;
    QByteArray buffer;
public slots://信号槽类
    void sendMsg(PDU* pdu);
    void showConnect();//定义信号槽函数，可以通过信号调用该函数
    void recvMsg();
//  void on_pushButton_clicked();
    void on_regist_PB_clicked();
    void on_lgin_PB_clicked();

private:
    Ui::Client *ui;
    Client(QWidget *parent = nullptr);//将构造函数改为类内访问，不可以类外创建对象
    Client(const Client& instance)=delete;//禁用拷贝构造
    Client& operator=(const Client&)=delete;//禁用赋值重载
};
#endif // CLIENT_H
