#ifndef OPERATEDB_H
#define OPERATEDB_H

#include <QObject>
#include <QSqlDatabase>
#include <QByteArray>
#include <QString>
struct AuthRecord{
    qint64 id=-1;
    QString name;
    QByteArray passwordHash;
    bool found=false;
};
class OperateDB : public QObject
{
    Q_OBJECT
public:
    static OperateDB& getInstance();//定义单例构造函数
    void connectSQL();//定义连接数据库函数
    ~OperateDB();//定义析构函数
    bool findAuthRecord(const QString& name, AuthRecord& out);
    bool insertUser(const QString& name,
                    const QByteArray& passwordHash,
                    qint64& newId,
                    bool& duplicate);
    bool deleteUser(qint64 id);
    bool setOnline(qint64 id, bool online);
    bool handleDelFriend(const char* caCurName,const char* caTarName);//定义删除好友函数
    void handleOffline(const char* caName);//定义处理下线函数
    int handleFindUser(const char* caName);
    QStringList handleOnlineUser();
    int handleAddFriend(const char* caCurName,const char* caTarName);
    bool handleAddFriendAgree(const char* caCurName,const char* caTarName);
    QStringList handleFlushFriend(const char* caCurName);
private:
    explicit OperateDB(QObject *parent = nullptr);
    OperateDB(const OperateDB& instance)=delete;//禁用拷贝构造
    OperateDB& operator=(const OperateDB&)=delete;//禁用赋值重载
    QSqlDatabase m_db;//定义数据库连接
signals:

};

#endif // OPERATEDB_H
