#include "msghandler.h"
#include "mytcpsocket.h"
#include "operatedb.h"
#include "mytcpserver.h"
#include "server.h"
#include <QDebug>
#include <QDir>
#include <QFileInfo>
#include "passwordutil.h"
#include <QByteArray>
#include <QTextStream>
#include <QFile>
#include "storagepath.h"
#include "uploadmanager.h"
namespace{

QByteArray readFixedField(const char* data,int maxLen){
    int len=0;
    while(len<maxLen&&data[len]!='\0'){
        ++len;
    }
    return QByteArray(data,len);
}

bool isValidUserName(const QByteArray& name){
    if(name.size()<3||name.size()>32){
        return false;
        }
    for(int i=0;i<name.size();++i){
        const char c=name.at(i);
        const bool ok=(c>='a'&&c<='z')||(c>='A'&&c<='Z')||(c>='0'&&c<='9')||c=='_';
        if(!ok){
            return false;
            }
        }
        return true;
    }

bool isValidPassword(const QByteArray& password){
        return password.size()>=8&&password.size()<=32;
    }

PDU* makeAuthResponse(uint type,AuthCode code){
        PDU* respdu=mkPDU();
        respdu->uiType=type;
        const quint32 value=static_cast<quint32>(code);
        memcpy(respdu->caData,&value,sizeof(value));
        return respdu;
    }

/**
 * FileCode 转成可读字符串，方便看日志。
 */
const char* fileCodeName(FileCode code)
{
    switch (code) {
    case FileCode::Ok:            return "Ok";
    case FileCode::NotLogin:      return "NotLogin";
    case FileCode::InvalidPath:   return "InvalidPath";
    case FileCode::InvalidName:   return "InvalidName";
    case FileCode::NotFound:      return "NotFound";
    case FileCode::AlreadyExists: return "AlreadyExists";
    case FileCode::OpenFailed:    return "OpenFailed";
    case FileCode::WriteFailed:   return "WriteFailed";
    case FileCode::ServerError:   return "ServerError";
    }
    return "Unknown";
}

/**
 * 生成文件操作响应。
 *
 * 所有文件操作都通过这里返回，
 * 统一打印响应类型和结果码，方便排查问题。
 *
 * @param type 响应 PDU 的消息类型，例如 ENUM_TYPE_FLUSH_FILE_RESPOND。
 * @param code 文件操作结果码。
 * @return 新建的响应 PDU，调用方负责发送和释放。
 */
PDU* makeFileResponse(uint type, FileCode code)
{
    // 打印本次文件操作的结果码。
    // 成功用 qDebug，失败用 qWarning，方便在控制台快速定位。
    if (code == FileCode::Ok) {
        qDebug() << "[file] type=" << type
                 << "result=" << fileCodeName(code);
    } else {
        qWarning() << "[file] type=" << type
                   << "result=" << fileCodeName(code)
                   << "code=" << static_cast<quint32>(code);
    }

    // mkPDU() 分配一个消息体长度为 0 的 PDU。
    PDU* respdu = mkPDU();

    // 设置响应类型。
    respdu->uiType = type;

    // static_cast<quint32> 把 FileCode 转成 4 字节无符号整数。
    const quint32 value = static_cast<quint32>(code);

    // 写入 caData 前 4 字节。
    memcpy(respdu->caData, &value, sizeof(value));

    return respdu;
}
}
MsgHandler::MsgHandler()
{
    m_bDownload=false;//初始状态该连接没有文件正在下载
}

PDU* MsgHandler::regist()
{
    // 按显式长度读取，不能假设字段以 '\0' 结尾。
    const QByteArray rawName = readFixedField(pdu->caData, 32);
    const QByteArray rawPwd = readFixedField(pdu->caData + 32, 32);

    // 服务端必须自己校验，不能相信客户端。
    if (!isValidUserName(rawName) || !isValidPassword(rawPwd)) {
        return makeAuthResponse(ENUM_TYPE_RESPOND,
                                AuthCode::InvalidInput);
    }

    // 统一小写，保证数据库、目录、登录名一致。
    const QByteArray normalizedName = rawName.toLower();
    const QString userName = QString::fromLatin1(
        normalizedName.constData(), normalizedName.size());

    // 先算 Argon2id，再把哈希写入数据库。
    QByteArray passwordHash;
    if (!PasswordUtil::hashPassword(rawPwd, passwordHash)) {
        qWarning() << "注册失败：Argon2id 计算失败" << userName;
        return makeAuthResponse(ENUM_TYPE_RESPOND,
                                AuthCode::ServerError);
    }

    qint64 newId = -1;
    bool duplicate = false;
    if (!OperateDB::getInstance().insertUser(
            userName, passwordHash, newId, duplicate)) {
        // 唯一索引冲突 = 用户名已存在。
        if (duplicate) {
            return makeAuthResponse(ENUM_TYPE_RESPOND,
                                    AuthCode::UserExists);
        }

        qWarning() << "注册失败：写入数据库失败" << userName;
        return makeAuthResponse(ENUM_TYPE_RESPOND,
                                AuthCode::ServerError);
    }

    // 数据库成功后再创建用户目录。
    // 如果目录创建失败，必须删除刚插入的用户记录，
    // 否则会出现“有用户、没目录”的脏数据。
    const QString userDir = QString("%1/%2")
        .arg(Server::getInstance().m_strRootPath)
        .arg(userName);

    QDir dir;
    if (!dir.mkdir(userDir)) {
        qWarning() << "注册失败：创建用户目录失败" << userDir;

        if (!OperateDB::getInstance().deleteUser(newId)) {
            qCritical() << "注册补偿失败：用户已插入但目录创建失败"
                        << userName << newId;
        }

        return makeAuthResponse(ENUM_TYPE_RESPOND,
                                AuthCode::ServerError);
    }

    qInfo() << "注册成功" << userName;
    return makeAuthResponse(ENUM_TYPE_RESPOND, AuthCode::Ok);
}

PDU *MsgHandler::findUser()
{
    char caName[32]={'\0'};//定义缓冲都读数据
    memcpy(caName,pdu->caData,32);
    int res=OperateDB::getInstance().handleFindUser(caName);//定义res接收数据库操作后的返回值
    PDU* respdu=mkPDU();//定义respdu
    memcpy(respdu->caData,&res,sizeof(int));//写入respdu
    respdu->uiType=ENUM_TYPE_FIND_USER_RESPOND;//定义类型
    return respdu;
}

PDU *MsgHandler::onlineUser()
{
    QStringList res=OperateDB::getInstance().handleOnlineUser();//定义res接收数据库操作后的返回值
    PDU* respdu=mkPDU(res.size()*32);//定义respd
    respdu->uiType=ENUM_TYPE_ONLINE_USER_RESPOND;//定义类型
    for(int i=0;i<res.size();i++){
        memcpy(respdu->caMsg+i*32,res[i].toStdString().c_str(),32);
    }
    return respdu;
}

PDU *MsgHandler::addFriend()
{
    char caCurName[32]={'\0'};
    char caTarName[32]={'\0'};
    memcpy(caCurName,pdu->caData,32);
    memcpy(caTarName,pdu->caData+32,32);//目标名在caData后32字节，写到caTarName本身，不能越界
    int ret=OperateDB::getInstance().handleAddFriend(caCurName,caTarName);
    if(ret==1){
        pdu->uiType=ENUM_TYPE_ADD_FRIEND_RESEND;
        MyTcpServer::getInstance().resend(caTarName,pdu);
        return NULL;
    }
    PDU* respdu=mkPDU();
    respdu->uiType=ENUM_TYPE_ADD_FRIEND_RESPOND;//类型要设在respdu上，客户端才能进对应分支
    memcpy(respdu->caData,&ret,sizeof(int));
    return respdu;
}

PDU* MsgHandler::login(QString& strLoginName)
{
    // 按显式长度读取。
    // 不能假设 caData 一定以 '\0' 结尾。
    const QByteArray rawName = readFixedField(pdu->caData, 32);
    const QByteArray rawPwd = readFixedField(pdu->caData + 32, 32);

    // 服务端必须自己校验，不能相信客户端。
    if (!isValidUserName(rawName) || !isValidPassword(rawPwd)) {
        return makeAuthResponse(ENUM_TYPE_LOGIN_RESPOND,
                                AuthCode::InvalidInput);
    }

    // 用户名统一小写，和注册时保持一致。
    // 这样 ABC 和 abc 会落到同一个用户。
    const QByteArray normalizedName = rawName.toLower();
    const QString userName = QString::fromLatin1(
        normalizedName.constData(), normalizedName.size());

    // 只按用户名查认证记录。
    // 密码不在 SQL 里比较。
    AuthRecord record;
    if (!OperateDB::getInstance().findAuthRecord(userName, record)) {
        // 查询失败 = 数据库错误。
        // 这和“用户不存在”不是一回事。
        qWarning() << "登录失败：查询用户失败" << userName;
        return makeAuthResponse(ENUM_TYPE_LOGIN_RESPOND,
                                AuthCode::ServerError);
    }

    if (!record.found) {
        // 用户不存在。
        // 对客户端统一返回 AuthFailed，
        // 不暴露“用户是否存在”。
        return makeAuthResponse(ENUM_TYPE_LOGIN_RESPOND,
                                AuthCode::AuthFailed);
    }

    // 用 Argon2id 验证密码。
    // verifyPassword 会使用数据库哈希字符串里的盐和参数，
    // 重新计算后再做常量时间比较。
    if (!PasswordUtil::verifyPassword(rawPwd,
                                      record.passwordHash)) {
        // 密码错误也返回 AuthFailed。
        // 客户端只看到“用户名或密码错误”。
        return makeAuthResponse(ENUM_TYPE_LOGIN_RESPOND,
                                AuthCode::AuthFailed);
    }

    // 密码正确后，按 id 更新在线状态。
    // 更新失败就不要设置登录名，避免“看起来登录成功但状态不对”。
    if (!OperateDB::getInstance().setOnline(record.id, true)) {
        qWarning() << "登录失败：更新在线状态失败" << userName;
        return makeAuthResponse(ENUM_TYPE_LOGIN_RESPOND,
                                AuthCode::ServerError);
    }

    // 使用数据库里的规范用户名，
    // 不使用客户端原始输入。
    //
    // strLoginName 是引用参数，指向 MyTcpSocket::m_strLoginName，
    // 用于在线列表、消息转发、下线处理。
    strLoginName = record.name;

    // m_strLoginName 是 MsgHandler 自己的成员。
    // 用于文件路径隔离：
    // userRoot() 会把它拼到服务端根目录后面。
    m_strLoginName=record.name;
    qInfo() << "登录成功" << userName;
    return makeAuthResponse(ENUM_TYPE_LOGIN_RESPOND, AuthCode::Ok);
}

PDU *MsgHandler::addFriendAgree()
{
    char caCurName[32]={'\0'};
    char caTarName[32]={'\0'};
    memcpy(caCurName,pdu->caData,32);
    memcpy(caTarName,pdu->caData+32,32);//目标名在caData后32字节，写到caTarName本身，不能越界
    bool ret=OperateDB::getInstance().handleAddFriendAgree(caCurName,caTarName);
    PDU* respdu=mkPDU();//定义respdu
    memcpy(respdu->caData,&ret,sizeof(bool));//写入respdu
    respdu->uiType=ENUM_TYPE_ADD_FRIEND_AGREE_RESPOND;//定义类型
    MyTcpServer::getInstance().resend(caCurName,respdu);
    return respdu;
}

PDU *MsgHandler::flushFriend()
{
    // 从当前请求的 caData 中取用户名。
    //
    // 注意：这里的用户名仍然来自客户端，
    // 属于好友模块后续要改成“以服务端登录名为准”的地方。
    // 本次只恢复函数，不改变原有逻辑。
    QStringList res =
        OperateDB::getInstance().handleFlushFriend(pdu->caData);

    // 每个好友名占 32 字节。
    // mkPDU 分配 res.size() * 32 字节的消息体。
    PDU* respdu = mkPDU(res.size() * 32);

    // 响应类型：刷新好友列表。
    respdu->uiType = ENUM_TYPE_FLUSH_FRIEND_RESPOND;

    // 把每个好友名写入 caMsg，每条固定 32 字节。
    for (int i = 0; i < res.size(); ++i) {
        memcpy(respdu->caMsg + i * 32,
               res[i].toStdString().c_str(),
               32);
    }

    return respdu;
}

PDU *MsgHandler::flushFile()
{
    // 第一步：检查当前连接是否已经登录。
    // 未登录时不能操作任何用户目录。
    if (!hasLogin()) {
        return makeFileResponse(ENUM_TYPE_FLUSH_FILE_RESPOND,
                                FileCode::NotLogin);
    }

    // 第二步：把客户端传来的虚拟路径解析成物理路径。
    //
    // pdu->caMsg 是客户端当前目录，例如 "/docs"。
    // userRoot() 返回 "./filesys/alice"。
    // resolve 成功后 physicalPath 是 "./filesys/alice/docs"。
    //
    // resolve 内部会拒绝 "../"、绝对路径和越界路径。
    QString physicalPath;
    const QString virtualPath = QString::fromUtf8(pdu->caMsg);
    qDebug() << "[flushFile] user=" << m_strLoginName << "virtual=" << virtualPath;
    if (!StoragePath::resolve(userRoot(), virtualPath, physicalPath)) {
        return makeFileResponse(ENUM_TYPE_FLUSH_FILE_RESPOND,
                                FileCode::InvalidPath);
        }

    // 第三步：检查目录是否存在。
    // QDir 是 Qt 的目录操作类。
    QDir dir(physicalPath);
    if (!dir.exists()) {
        return makeFileResponse(ENUM_TYPE_FLUSH_FILE_RESPOND,
                                FileCode::NotFound);
    }

    // 第四步：列出目录内容。
    //
    // QDir::NoDotAndDotDot 直接排除 "." 和 ".."，
    // 这样后面就不需要 size()-2，
    // 也不会出现目录为空时下溢的问题。
    //
    // QDir::AllEntries 表示文件和目录都要。
    const QFileInfoList fileInfoList =
        dir.entryInfoList(QDir::NoDotAndDotDot | QDir::AllEntries);

    // 第五步：按实际数量分配响应 PDU。
    PDU* respdu = mkPDU(fileInfoList.size() * sizeof(FileInfo));
    respdu->uiType = ENUM_TYPE_FLUSH_FILE_RESPOND;

    // 第六步：把 FileCode::Ok 写入 caData 前 4 字节。
    // 客户端先读错误码，再读 caMsg 里的 FileInfo 数组。
    const quint32 code = static_cast<quint32>(FileCode::Ok);
    memcpy(respdu->caData, &code, sizeof(code));

    // 第七步：逐个填充 FileInfo。
    for (int i = 0; i < fileInfoList.size(); ++i) {
        const QFileInfo& info = fileInfoList.at(i);

        // FileInfo 是 protocol.h 里的结构：
        // char caName[32] + int iFileType。
        FileInfo* pFileInfo =
            reinterpret_cast<FileInfo*>(respdu->caMsg) + i;

        // iFileType：0 表示目录，1 表示文件。
        pFileInfo->iFileType = info.isDir() ? 0 : 1;

        // QFileInfo::fileName() 返回不带路径的文件名。
        // toUtf8() 转成 UTF-8 字节。
        const QByteArray nameBytes = info.fileName().toUtf8();

        // 文件名最多占 31 字节，留 1 字节给 '\0'。
        // 先清零，避免短文件名后面带垃圾字节。
        memset(pFileInfo->caName, 0, sizeof(pFileInfo->caName));
        const int copyLen = qMin(nameBytes.size(),
                                 static_cast<int>(sizeof(pFileInfo->caName)) - 1);
        memcpy(pFileInfo->caName, nameBytes.constData(), copyLen);
    }

    return respdu;
}

PDU *MsgHandler::DelFriend()
{
    char curName[32]={'\0'};
    char tarName[32]={'\0'};
    memcpy(curName,pdu->caData,32);
    memcpy(tarName,pdu->caData+32,32);
    bool ret=OperateDB::getInstance().handleDelFriend(curName,tarName);
    qDebug()<<"delFriend ret"<<ret;
    PDU* respdu=mkPDU();
    respdu->uiType=ENUM_TYPE_DEL_FRIEND_RESPOND;
    memcpy(respdu->caData,&ret,sizeof(bool));
    return respdu;
}

PDU *MsgHandler::chat()
{
    char tarName[32]={'\0'};
    memcpy(tarName,pdu->caData+32,32);
    pdu->uiType=ENUM_TYPE_CHAT_RESEND;
    MyTcpServer::getInstance().resend(tarName,pdu);
    return NULL;
}

PDU *MsgHandler::mkdir()
{
    // 第一步：必须已登录。
    if (!hasLogin()) {
        return makeFileResponse(ENUM_TYPE_MKDIR_RESPOND,
                                FileCode::NotLogin);
    }

    // 第二步：读取目录名。
    const QByteArray nameBytes = readFixedField(pdu->caData, 32);
    const QString dirName = QString::fromUtf8(nameBytes);
    qDebug() << "[mkdir] user=" << m_strLoginName << "dirName=" << dirName;

    // 第三步：校验目录名。
    if (!StoragePath::validFileName(dirName)) {
        return makeFileResponse(ENUM_TYPE_MKDIR_RESPOND,
                                FileCode::InvalidName);
    }

    // 第四步：把虚拟父目录解析成物理路径。
    const QString virtualParent = QString::fromUtf8(readFixedField(pdu->caMsg, pdu->uiMsgLen));

    QString parentPath;
    if (!StoragePath::resolve(userRoot(), virtualParent, parentPath)) {
        return makeFileResponse(ENUM_TYPE_MKDIR_RESPOND,
                                FileCode::InvalidPath);
    }

    // 第五步：父目录必须存在。
    QDir parentDir(parentPath);
    if (!parentDir.exists()) {
        return makeFileResponse(ENUM_TYPE_MKDIR_RESPOND,
                                FileCode::NotFound);
    }

    // 第六步：拼接目标目录。
    const QString targetPath = parentDir.filePath(dirName);

    // 第七步：目标已存在时直接返回 AlreadyExists。
    if (QFileInfo::exists(targetPath)) {
        return makeFileResponse(ENUM_TYPE_MKDIR_RESPOND,
                                FileCode::AlreadyExists);
    }

    // 第八步：创建目录。
    QDir dir;
    if (!dir.mkdir(targetPath)) {
        return makeFileResponse(ENUM_TYPE_MKDIR_RESPOND,
                                FileCode::ServerError);
    }

    return makeFileResponse(ENUM_TYPE_MKDIR_RESPOND,
                            FileCode::Ok);
}

PDU *MsgHandler::delFile()
{
    // 第一步：必须已登录。
    if (!hasLogin()) {
        return makeFileResponse(ENUM_TYPE_DEL_FILE_RESPOND,
                                FileCode::NotLogin);
    }

    // 第二步：读取客户端传来的虚拟路径。
    //
    // 删除请求的 caMsg 是“当前目录 + 文件名”的完整虚拟路径，
    // 例如 "/docs/report.pdf"。
    // 用 uiMsgLen 显式指定长度，不依赖 '\0'。
    const QString virtualPath = QString::fromUtf8(readFixedField(pdu->caMsg, pdu->uiMsgLen));
    qDebug() << "[delFile] user=" << m_strLoginName << "virtual=" << virtualPath;

    // 第三步：把虚拟路径解析成受控物理路径。
    // resolve 会拒绝绝对路径、../ 越界、alice2 前缀绕过。
    QString physicalPath;
    if (!StoragePath::resolve(userRoot(), virtualPath, physicalPath)) {
        return makeFileResponse(ENUM_TYPE_DEL_FILE_RESPOND,
                                FileCode::InvalidPath);
    }

    // 第四步：目标必须存在。
    // QFileInfo 是 Qt 的文件信息类，既能描述文件也能描述目录。
    QFileInfo fileInfo(physicalPath);
    if (!fileInfo.exists()) {
        return makeFileResponse(ENUM_TYPE_DEL_FILE_RESPOND,
                                FileCode::NotFound);
    }

    // 第五步：区分文件和目录。
    bool removed = false;
    if (fileInfo.isDir()) {
        // QDir::removeRecursively 会递归删除整个目录。
        //
        // 注意：路径已经过 StoragePath 校验，
        // 但目录内如果存在指向外部的符号链接，
        // 递归删除仍可能影响链接目标。
        // Windows 下普通用户创建符号链接需要权限，风险较低，
        // 面试时要能说明这一点。
        QDir dir(physicalPath);
        removed = dir.removeRecursively();
    } else {
        // QFile::remove 删除单个文件。
        QFile file(physicalPath);
        removed = file.remove();
    }

    if (!removed) {
        // 文件存在但删除失败，通常是权限或文件被占用。
        return makeFileResponse(ENUM_TYPE_DEL_FILE_RESPOND,
                                FileCode::ServerError);
    }

    return makeFileResponse(ENUM_TYPE_DEL_FILE_RESPOND,
                            FileCode::Ok);
}

PDU *MsgHandler::rename()
{
    // 第一步：必须已登录。
    if (!hasLogin()) {
        return makeFileResponse(ENUM_TYPE_RENAME_RESPOND,
                                FileCode::NotLogin);
    }

    // 第二步：读取旧文件名和新文件名。
    //
    // caData[0..31]  旧文件名
    // caData[32..63] 新文件名
    // 用 readFixedField 按显式长度读取，不依赖 '\0'。
    const QByteArray oldNameBytes = readFixedField(pdu->caData, 32);
    const QByteArray newNameBytes =
        readFixedField(pdu->caData + 32, 32);

    const QString oldName = QString::fromUtf8(oldNameBytes);
    qDebug() << "[rename] user=" << m_strLoginName << "old=" << oldName;
    const QString newName = QString::fromUtf8(newNameBytes);

    // 第三步：两个名字都必须合法。
    // validFileName 拒绝空名、"."、".."、路径分隔符和非法字符。
    if (!StoragePath::validFileName(oldName)
        || !StoragePath::validFileName(newName)) {
        return makeFileResponse(ENUM_TYPE_RENAME_RESPOND,
                                FileCode::InvalidName);
    }

    // 第四步：把虚拟当前目录解析成物理路径。
    // pdu->caMsg 例如 "/docs"。
    const QString virtualParent = QString::fromUtf8(readFixedField(pdu->caMsg, pdu->uiMsgLen));

    QString parentPath;
    if (!StoragePath::resolve(userRoot(), virtualParent, parentPath)) {
        return makeFileResponse(ENUM_TYPE_RENAME_RESPOND,
                                FileCode::InvalidPath);
    }

    // 第五步：拼接旧路径和新路径。
    // QDir::filePath 把文件名拼到父目录后面。
    QDir parentDir(parentPath);
    const QString oldPath = parentDir.filePath(oldName);
    const QString newPath = parentDir.filePath(newName);

    // 第六步：旧文件必须存在。
    if (!QFileInfo::exists(oldPath)) {
        return makeFileResponse(ENUM_TYPE_RENAME_RESPOND,
                                FileCode::NotFound);
    }

    // 第七步：新名字不能已经存在。
    // 否则 QDir::rename 在部分平台上会覆盖目标文件，
    // 造成数据丢失。
    if (QFileInfo::exists(newPath)) {
        return makeFileResponse(ENUM_TYPE_RENAME_RESPOND,
                                FileCode::AlreadyExists);
    }

    // 第八步：执行重命名。
    QDir dir;
    if (!dir.rename(oldPath, newPath)) {
        return makeFileResponse(ENUM_TYPE_RENAME_RESPOND,
                                FileCode::ServerError);
    }

    return makeFileResponse(ENUM_TYPE_RENAME_RESPOND,
                            FileCode::Ok);
}

PDU *MsgHandler::uploadfileinit()
{
    // 第一步：必须已登录。
    if (!hasLogin()) {
        return makeFileResponse(ENUM_TYPE_UPLOAD_INIT_RESPOND,
                                FileCode::NotLogin);
    }

    // 第二步：读取文件名。
    const QByteArray nameBytes = readFixedField(pdu->caData, 32);
    const QString fileName = QString::fromUtf8(nameBytes);

    if (!StoragePath::validFileName(fileName)) {
        return makeFileResponse(ENUM_TYPE_UPLOAD_INIT_RESPOND,
                                FileCode::InvalidName);
    }

    // 第三步：读取文件总大小。
    qint64 fileSize = 0;
    memcpy(&fileSize, pdu->caData + 32, sizeof(fileSize));
    if (fileSize < 0) {
        return makeFileResponse(ENUM_TYPE_UPLOAD_INIT_RESPOND,
                                FileCode::InvalidPath);
    }

    // 第四步：解析虚拟目标目录。
    const QString virtualDir =
        QString::fromUtf8(readFixedField(pdu->caMsg, pdu->uiMsgLen));

    QString physicalDir;
    if (!StoragePath::resolve(userRoot(), virtualDir, physicalDir)) {
        return makeFileResponse(ENUM_TYPE_UPLOAD_INIT_RESPOND,
                                FileCode::InvalidPath);
    }

    QDir dir(physicalDir);
    if (!dir.exists()) {
        return makeFileResponse(ENUM_TYPE_UPLOAD_INIT_RESPOND,
                                FileCode::NotFound);
    }

    // 第五步：最终文件不能已经存在。
    const QString finalPath = dir.filePath(fileName);
    if (QFileInfo::exists(finalPath)) {
        return makeFileResponse(ENUM_TYPE_UPLOAD_INIT_RESPOND,
                                FileCode::AlreadyExists);
    }

    // 第六步：先看看这个用户是否已经有这个文件的上传会话。
    // 如果有，复用旧会话，返回已接收偏移，实现断点续传。
    UploadSession session;
    if (UploadManager::getInstance().findSessionByFinalPath(
            m_strLoginName, finalPath, session)) {
        qDebug() << "[uploadInit] resume existing session user="
                 << m_strLoginName
                 << "uploadId=" << session.uploadId
                 << "received=" << session.receivedSize;

        const QByteArray idBytes = session.uploadId.toUtf8();
        PDU* respdu = mkPDU(idBytes.size() + 1);
        respdu->uiType = ENUM_TYPE_UPLOAD_INIT_RESPOND;

        const quint32 code = static_cast<quint32>(FileCode::Ok);
        memcpy(respdu->caData, &code, sizeof(code));

        const qint64 nextOffset = session.receivedSize;
        memcpy(respdu->caData + sizeof(quint32),
               &nextOffset,
               sizeof(nextOffset));

        memcpy(respdu->caMsg, idBytes.constData(), idBytes.size());
        return respdu;
    }

    // 第七步：临时文件统一放在用户根目录下的 .upload。
    // 这样不会跨用户，也不会污染用户看到的目录。
    const QString tempDir = QDir(userRoot()).filePath(".upload");

    FileCode error = FileCode::ServerError;
    if (!UploadManager::getInstance().createSession(
            m_strLoginName, tempDir, finalPath, fileSize, session, error)) {
        return makeFileResponse(ENUM_TYPE_UPLOAD_INIT_RESPOND, error);
    }

    qDebug() << "[uploadInit] user=" << m_strLoginName
             << "file=" << fileName
             << "size=" << fileSize
             << "uploadId=" << session.uploadId;

    // 第八步：响应 FileCode + nextOffset + uploadId。
    const QByteArray idBytes = session.uploadId.toUtf8();
    PDU* respdu = mkPDU(idBytes.size() + 1);
    respdu->uiType = ENUM_TYPE_UPLOAD_INIT_RESPOND;

    const quint32 code = static_cast<quint32>(FileCode::Ok);
    memcpy(respdu->caData, &code, sizeof(code));

    const qint64 nextOffset = 0;
    memcpy(respdu->caData + sizeof(quint32),
           &nextOffset,
           sizeof(nextOffset));

    memcpy(respdu->caMsg, idBytes.constData(), idBytes.size());

    return respdu;
}

PDU* MsgHandler::uploadChunk()
{
    if (!hasLogin()) {
        return makeFileResponse(ENUM_TYPE_UPLOAD_CHUNK_RESPOND,
                                FileCode::NotLogin);
    }

    // 分片元数据在 caData 里。
    // 为了不受编译器对齐影响，这里手动按固定偏移解析：
    //   caData[0..35]  uploadId
    //   caData[36..43] offset（quint64）
    //   caData[44..47] dataLen（quint32）
    char uploadIdBuf[UPLOAD_ID_LEN] = {0};
    memcpy(uploadIdBuf, pdu->caData, UPLOAD_ID_LEN);

    quint64 offset = 0;
    memcpy(&offset, pdu->caData + 36, sizeof(offset));

    quint32 dataLen = 0;
    memcpy(&dataLen, pdu->caData + 44, sizeof(dataLen));

    // 声明的数据长度必须和实际消息长度一致。
    if (dataLen != static_cast<quint32>(pdu->uiMsgLen)) {
        return makeFileResponse(ENUM_TYPE_UPLOAD_CHUNK_RESPOND,
                                FileCode::InvalidPath);
    }

    const QByteArray data(pdu->caMsg, static_cast<int>(dataLen));

    qint64 nextOffset = 0;
    FileCode error = FileCode::ServerError;

    const bool ok = UploadManager::getInstance().writeChunk(
        QString::fromLatin1(uploadIdBuf),
        m_strLoginName,
        static_cast<qint64>(offset),
        data,
        nextOffset,
        error);

    if (!ok) {
        qWarning() << "[uploadChunk] failed user=" << m_strLoginName
                   << "uploadId=" << QString::fromLatin1(uploadIdBuf)
                   << "offset=" << offset
                   << "len=" << dataLen
                   << "error=" << static_cast<quint32>(error);
        return makeFileResponse(ENUM_TYPE_UPLOAD_CHUNK_RESPOND, error);
    }

    qDebug() << "[uploadChunk] user=" << m_strLoginName
             << "uploadId=" << QString::fromLatin1(uploadIdBuf)
             << "offset=" << offset
             << "len=" << dataLen
             << "nextOffset=" << nextOffset;

    PDU* respdu = mkPDU();
    respdu->uiType = ENUM_TYPE_UPLOAD_CHUNK_RESPOND;

    const quint32 code = static_cast<quint32>(FileCode::Ok);
    memcpy(respdu->caData, &code, sizeof(code));
    memcpy(respdu->caData + sizeof(quint32),
           &nextOffset,
           sizeof(nextOffset));

    return respdu;
}

PDU* MsgHandler::finishUpload()
{
    if (!hasLogin()) {
        return makeFileResponse(ENUM_TYPE_UPLOAD_FINISH_RESPOND,
                                FileCode::NotLogin);
    }

    const QByteArray idBytes = readFixedField(pdu->caData, UPLOAD_ID_LEN);
    const QString uploadId = QString::fromLatin1(idBytes);

    FileCode error = FileCode::ServerError;
    if (!UploadManager::getInstance().finish(
            uploadId, m_strLoginName, error)) {
        qWarning() << "[finishUpload] failed user=" << m_strLoginName
                   << "uploadId=" << uploadId
                   << "error=" << static_cast<quint32>(error);
        return makeFileResponse(ENUM_TYPE_UPLOAD_FINISH_RESPOND, error);
    }

    qInfo() << "[finishUpload] ok user=" << m_strLoginName
            << "uploadId=" << uploadId;

    return makeFileResponse(ENUM_TYPE_UPLOAD_FINISH_RESPOND,
                            FileCode::Ok);
}

PDU* MsgHandler::resumeUpload()
{
    if (!hasLogin()) {
        return makeFileResponse(ENUM_TYPE_UPLOAD_RESUME_RESPOND,
                                FileCode::NotLogin);
    }

    const QByteArray idBytes = readFixedField(pdu->caData, UPLOAD_ID_LEN);
    const QString uploadId = QString::fromLatin1(idBytes);

    UploadSession session;
    if (!UploadManager::getInstance().getSession(
            uploadId, m_strLoginName, session)) {
        return makeFileResponse(ENUM_TYPE_UPLOAD_RESUME_RESPOND,
                                FileCode::NotFound);
    }

    PDU* respdu = mkPDU();
    respdu->uiType = ENUM_TYPE_UPLOAD_RESUME_RESPOND;

    const quint32 code = static_cast<quint32>(FileCode::Ok);
    memcpy(respdu->caData, &code, sizeof(code));

    const qint64 nextOffset = session.receivedSize;
    memcpy(respdu->caData + sizeof(quint32),
           &nextOffset,
           sizeof(nextOffset));

    return respdu;
}


PDU *MsgHandler::uploadfiledata()
{
    m_fUploadFile.write(pdu->caMsg,pdu->uiMsgLen);
    m_iUploadFileReceived+=pdu->uiMsgLen;
    if(m_iUploadFileReceived<m_iUploadFileSize){
        return NULL;
    }
    m_fUploadFile.close();
    PDU* respdu=mkPDU();
    respdu->uiType=ENUM_TYPE_UPLOAD_FILE_DATA_RESPOND;
    return respdu;
}

PDU *MsgHandler::downloadFile()
{
    // 第一步：必须已登录。
    if (!hasLogin()) {
        return makeFileResponse(ENUM_TYPE_DOWNLOAD_FILE_RESPOND,
                                FileCode::NotLogin);
    }

    // 第二步：读取虚拟完整路径。
    // pdu->caMsg 例如 "/docs/report.pdf"。
    // 用 uiMsgLen 显式指定长度，不依赖 '\0'。
    const QString virtualPath = QString::fromUtf8(readFixedField(pdu->caMsg, pdu->uiMsgLen));
    qDebug() << "[download] user=" << m_strLoginName << "virtual=" << virtualPath;

    // 第三步：把虚拟路径解析成受控物理路径。
    QString physicalPath;
    if (!StoragePath::resolve(userRoot(), virtualPath, physicalPath)) {
        return makeFileResponse(ENUM_TYPE_DOWNLOAD_FILE_RESPOND,
                                FileCode::InvalidPath);
    }

    // 第四步：目标必须存在。
    QFileInfo fileInfo(physicalPath);
    if (!fileInfo.exists()) {
        return makeFileResponse(ENUM_TYPE_DOWNLOAD_FILE_RESPOND,
                                FileCode::NotFound);
    }

    // 第五步：目录不能下载。
    // QFile 对目录 open 会失败，这里提前返回明确错误。
    if (fileInfo.isDir()) {
        return makeFileResponse(ENUM_TYPE_DOWNLOAD_FILE_RESPOND,
                                FileCode::InvalidPath);
    }

    // 第六步：当前连接已经有文件正在下载。
    // 一个连接同时只能下载一个文件，
    // 否则 m_fDownloadFile 会被覆盖。
    if (m_bDownload) {
        return makeFileResponse(ENUM_TYPE_DOWNLOAD_FILE_RESPOND,
                                FileCode::ServerError);
    }

    // 第七步：打开文件。
    m_fDownloadFile.setFileName(physicalPath);
    if (!m_fDownloadFile.open(QIODevice::ReadOnly)) {
        return makeFileResponse(ENUM_TYPE_DOWNLOAD_FILE_RESPOND,
                                FileCode::OpenFailed);
    }

    // 第八步：标记正在下载。
    m_bDownload = true;

    // 第九步：构造成功响应。
    //
    // caData[0..3]   FileCode::Ok
    // caData[4..11]  文件大小 qint64
    // 客户端先读状态码，再读文件大小。
    PDU* respdu = mkPDU();
    respdu->uiType = ENUM_TYPE_DOWNLOAD_FILE_RESPOND;

    const quint32 code = static_cast<quint32>(FileCode::Ok);
    memcpy(respdu->caData, &code, sizeof(code));

    const qint64 fileSize = fileInfo.size();
    memcpy(respdu->caData + sizeof(quint32),
           &fileSize,
           sizeof(fileSize));

    return respdu;
}

PDU *MsgHandler::downloadFileData(MyTcpSocket *socket)
{
    PDU* respdu=mkPDU(4096);
    respdu->uiType=ENUM_TYPE_DOWNLOAD_FILE_DATA_RESPOND;
    qint64 ret=0;
    //循环读取文件并直接通过socket发送，每块4096字节
    while(true){
        ret=m_fDownloadFile.read(respdu->caMsg,4096);
        if(ret<=0){
            break;
        }
        respdu->uiMsgLen=ret;
        respdu->uiTotalLen=ret+sizeof(PDU);
        socket->write((char*)respdu,respdu->uiTotalLen);
    }
    m_bDownload=false;
    m_fDownloadFile.close();
    free(respdu);
    respdu=NULL;
    return NULL;
}

bool MsgHandler::hasLogin() const
{
    // m_strLoginName 在登录成功后写入。
    // 为空表示当前连接还没有成功登录。
    //
    // 所有文件操作入口都应该先调用它，
    // 未登录时直接返回 NotLogin，避免匿名访问文件。
    return !m_strLoginName.isEmpty();
}

QString MsgHandler::userRoot() const
{
        // 未登录时没有“当前用户”，
    // 不能把路径落到公共根目录，否则会跨用户访问。
    if(m_strLoginName.isEmpty()){
        return QString();
    }

    // Server::getInstance().m_strRootPath 是配置里的用户根目录，
    // 例如 "./filesys"。
    //
    // QDir 是 Qt 的目录操作类。
    // QDir::filePath 会把用户名拼到根目录后面，
    // 得到 "./filesys/alice" 这样的物理路径。
    //
    // 注意：这里只负责拼“用户根目录”，
    // 还不负责处理虚拟路径和 ../ 越权，
    // 那部分由下一步的 StoragePath 完成。
    return QDir(Server::getInstance().m_strRootPath).filePath(m_strLoginName);
}
