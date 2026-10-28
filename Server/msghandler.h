#ifndef MSGHANDLER_H
#define MSGHANDLER_H
#include "protocol.h"
#include <qfile.h>
#include <qstring.h>
class MyTcpSocket;//前向声明：下载数据需要直接向socket写，避免头文件循环包含

class MsgHandler
{
public:
    MsgHandler();
    qint64 m_iUploadFileSize;
    qint64 m_iUploadFileReceived;
    QFile m_fUploadFile;
    //下载相关成员
    bool m_bDownload;//标记该连接是否有文件正在下载，防止重复下载
    QFile m_fDownloadFile;//服务器上的文件对象
    PDU* regist();
    PDU* findUser();
    PDU* onlineUser();
    PDU* addFriend();
    PDU* login(QString &strLoginName);
    PDU* addFriendAgree();
    PDU* flushFriend();
    PDU* DelFriend();
    PDU* chat();
    PDU* mkdir();
    PDU* flushFile();
    PDU* delFile();
    PDU* rename();
    PDU* uploadfileinit();
    PDU* uploadfiledata();

    // 分片上传：写入一个分片。
    PDU* uploadChunk();

    // 分片上传：完成上传，把 .part 改名为最终文件。
    PDU* finishUpload();

    // 断点续传：查询已接收偏移。
    PDU* resumeUpload();
    PDU* downloadFile();
    PDU* downloadFileData(MyTcpSocket* socket);
    PDU* pdu;

    /**
     * 当前连接是否已经登录。
     *
     * m_strLoginName 在登录成功后由 MsgHandler::login() 写入。
     * 为空表示当前连接还没有成功登录。
     *
     * 所有文件操作入口都应该先调用它：
     * 未登录时直接拒绝，避免匿名用户操作文件。
     */
    bool hasLogin() const;

    /**
     * 当前登录用户的物理根目录。
     *
     * 例如：
     *   m_strRootPath  = "./filesys"
     *   m_strLoginName = "alice"
     * 返回：
     *   "./filesys/alice"
     *
     * 调用前应先检查 hasLogin()。
     * 未登录时返回空字符串，调用方必须拒绝后续文件操作。
     */
    QString userRoot() const;

private:
    /**
     * 当前登录用户名。
     *
     * 由 MsgHandler::login() 在登录成功后写入。
     * 文件操作以它作为用户边界，防止跨用户访问。
     */
    QString m_strLoginName;
};

#endif // MSGHANDLER_H
