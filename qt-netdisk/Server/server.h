#ifndef SERVER_H
#define SERVER_H

#include <QWidget>

#include <QtNetwork/qtcpsocket.h>

class Server : public QWidget
{
    Q_OBJECT

public:
    static Server& getInstance();
     void loadconfig();
     QString m_strIP;//定义IP
     quint16 m_usPort;//定义端口号
     QString m_strRootPath;//定义用户文件根目录
    ~Server();
private:
     Server(QWidget *parent = nullptr);
};
#endif // SERVER_H
