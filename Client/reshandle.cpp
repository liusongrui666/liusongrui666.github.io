#include "reshandle.h"
#include "client.h"
#include "index.h"
#include <QMessageBox>
#include <qmessagebox.h>
Reshandle::Reshandle()
{

}

void Reshandle::regist()
{
    // 服务端返回 4 字节 AuthCode。
    // 不能再用 bool 读取，否则 Ok=0 会被当成 false。
    quint32 code = 0;
    memcpy(&code, pdu->caData, sizeof(code));

    switch (static_cast<AuthCode>(code)) {
    case AuthCode::Ok:
        QMessageBox::information(
            &Client::getInstance(), "提示", "注册成功");
        break;

    case AuthCode::UserExists:
        QMessageBox::information(
            &Client::getInstance(), "提示", "用户名已存在");
        break;

    case AuthCode::InvalidInput:
        QMessageBox::information(
            &Client::getInstance(), "提示",
            "用户名或密码格式不正确");
        break;

    case AuthCode::ServerError:
        QMessageBox::information(
            &Client::getInstance(), "提示",
            "服务器繁忙，请稍后重试");
        break;

    default:
        QMessageBox::information(
            &Client::getInstance(), "提示", "注册失败");
        break;
    }
}

void Reshandle::login()
{
    // 服务端返回 4 字节 AuthCode。
    quint32 code = 0;
    memcpy(&code, pdu->caData, sizeof(code));

    switch (static_cast<AuthCode>(code)) {
    case AuthCode::Ok:
        // 只有成功才进入主界面。
        Index::getInstance().show();
        Client::getInstance().hide();
        break;

    case AuthCode::AuthFailed:
        // 不区分“用户不存在”和“密码错误”。
        QMessageBox::information(
            &Client::getInstance(), "提示",
            "用户名或密码错误");
        break;

    case AuthCode::InvalidInput:
        QMessageBox::information(
            &Client::getInstance(), "提示",
            "用户名或密码格式不正确");
        break;

    case AuthCode::ServerError:
        QMessageBox::information(
            &Client::getInstance(), "提示",
            "服务器繁忙，请稍后重试");
        break;

    default:
        QMessageBox::information(
            &Client::getInstance(), "提示", "登录失败");
        break;
    }
}

void Reshandle::findUser()
{
    int ret;
    memcpy(&ret,pdu->caData,sizeof(int));

    if(ret==-1){

        QMessageBox::information(&Index::getInstance(),"提示","登录失败");
    }if(ret==0){

        QMessageBox::information(&Index::getInstance(),"提示","用户不在线");
    }if(ret==1){
         QMessageBox::information(&Index::getInstance(),"提示","用户在线");
    }
    else if(ret==2){
        QMessageBox::information(&Index::getInstance(),"提示","用户不存在");
    }
}

void Reshandle::onlineUser()
{
    uint uiSize=pdu->uiMsgLen/32;
    char caTmp[32]={'\0'};
    QStringList userList;
    for(uint i=0;i<uiSize;i++){
        memcpy(caTmp,pdu->caMsg+i*32,32);
        userList.append(caTmp);
    }
    Index::getInstance().getFriend()->m_pOnlineUser->updateLW(userList);
}

void Reshandle::addFriend()
{   int ret;
    memcpy(&ret,pdu->caData,sizeof(int));
    if(ret==-1){
        QMessageBox::information(&Index::getInstance(),"提示","服务器错误，联系开发人员");
    }if(ret==0){
        QMessageBox::information(&Index::getInstance(),"提示","用户不在线");
    }
    else if(ret==-2){
        QMessageBox::information(&Index::getInstance(),"提示","已经和该用户是好友");
    }
    else if(ret==-3){
        QMessageBox::information(&Index::getInstance(),"提示","不能添加自己为好友");
    }
}

void Reshandle::addFriendResend()
{
    char caName[32]={'\0'};
    memcpy(caName,pdu->caData,32);
    int ret=QMessageBox::question(&Index::getInstance(),"添加好友",QString("是否同意 %1 的添加好友请求?").arg(caName));
    if (ret!=QMessageBox::Yes){
        return;
    }
    PDU* respdu=mkPDU();
    memcpy(respdu->caData,pdu->caData,64);
    respdu->uiType=ENUM_TYPE_ADD_FRIEND_AGREE_REQUEST;
    Client::getInstance().sendMsg(respdu);
}

void Reshandle::addFriendAgree()
{
    bool ret;
    memcpy(&ret,pdu->caData,sizeof(bool));
    if(ret){
        QMessageBox::information(&Index::getInstance(),"提示","添加好友成功");
    }else{
        QMessageBox::information(&Index::getInstance(),"提示","添加好友失败");
    }
}

void Reshandle::flushFriend()
{
    QStringList friendList;
    char caTmp[32]={'\0'};
    int iSize=pdu->uiMsgLen/32;
    for(int i=0;i<iSize;i++){
        memcpy(&caTmp,pdu->caMsg+i*32,32);
        friendList.append(caTmp);
    }
    Index::getInstance().getFriend()->update_LW(friendList);
}

void Reshandle::delFriend()
{
    bool ret;
    memcpy(&ret,pdu->caData,sizeof(bool));
    qDebug()<<"delFriend ret"<<ret;
    if(ret){
        Index::getInstance().getFriend()->flushFriend();
    }
    else{
        QMessageBox::information(&Index::getInstance(),"提示","删除好友失败");
    }
}

void Reshandle::chat()
{
    Chat* c=Index::getInstance().getFriend()->m_pChat;
    if(c->isHidden()){
        c->show();
    }
    char caChatName[32]={'\0'};
    memcpy(caChatName,pdu->caData,32);
    c->updateShow_TE(QString("%1 : %2").arg(caChatName).arg(pdu->caMsg));
    c->m_strChatName=caChatName;
}

void Reshandle::mkdir()
{
    // 服务端在 caData 前 4 字节返回 FileCode。
    quint32 code = 0;
    memcpy(&code, pdu->caData, sizeof(code));
    qDebug() << "[mkdir] FileCode=" << code;

    // 转成枚举后分支处理。
    switch (static_cast<FileCode>(code)) {
    case FileCode::Ok:
        // 创建成功，刷新当前目录。
        Index::getInstance().getFile()->flushFile();
        break;

    case FileCode::NotLogin:
        QMessageBox::information(
            &Index::getInstance(), "提示", "请先登录");
        break;

    case FileCode::InvalidName:
        QMessageBox::information(
            &Index::getInstance(), "提示", "文件夹名非法");
        break;

    case FileCode::InvalidPath:
        QMessageBox::information(
            &Index::getInstance(), "提示", "路径非法");
        break;

    case FileCode::NotFound:
        QMessageBox::information(
            &Index::getInstance(), "提示", "当前目录不存在");
        break;

    case FileCode::AlreadyExists:
        QMessageBox::information(
            &Index::getInstance(), "提示", "文件夹已存在");
        break;

    default:
        QMessageBox::information(
            &Index::getInstance(), "提示", "新建文件夹失败");
        break;
    }
}

void Reshandle::flushFile()
{
    // 服务端在 caData 前 4 字节返回 FileCode。
    quint32 code = 0;
    memcpy(&code, pdu->caData, sizeof(code));
    qDebug() << "[flushFile] FileCode=" << code;

    // 先判断错误码，失败时 caMsg 里没有文件列表。
    if (static_cast<FileCode>(code) != FileCode::Ok) {
        QMessageBox::information(
            &Index::getInstance(), "提示",
            "刷新目录失败");
        return;
    }

    // 成功时再解析 caMsg 里的 FileInfo 数组。
    const int count = pdu->uiMsgLen / sizeof(FileInfo);
    QList<FileInfo*> fileInfoList;

    for (int i = 0; i < count; ++i) {
        FileInfo* pFileInfo = new FileInfo;

        // memcpy 从 caMsg 第 i 个 FileInfo 位置复制结构体。
        memcpy(pFileInfo,
               pdu->caMsg + i * sizeof(FileInfo),
               sizeof(FileInfo));

        fileInfoList.append(pFileInfo);
    }

    Index::getInstance().getFile()->updateFileList(fileInfoList);
}

void Reshandle::delFile()
{
    // 服务端在 caData 前 4 字节返回 FileCode。
    quint32 code = 0;
    memcpy(&code, pdu->caData, sizeof(code));
    qDebug() << "[delFile] FileCode=" << code;

    switch (static_cast<FileCode>(code)) {
    case FileCode::Ok:
        // 删除成功，刷新当前目录。
        Index::getInstance().getFile()->flushFile();
        break;

    case FileCode::NotLogin:
        QMessageBox::information(
            &Index::getInstance(), "提示", "请先登录");
        break;

    case FileCode::InvalidPath:
        QMessageBox::information(
            &Index::getInstance(), "提示", "路径非法");
        break;

    case FileCode::NotFound:
        QMessageBox::information(
            &Index::getInstance(), "提示", "文件或文件夹不存在");
        break;

    default:
        QMessageBox::information(
            &Index::getInstance(), "提示", "删除失败");
        break;
    }
}

void Reshandle::rename()
{
    // 服务端在 caData 前 4 字节返回 FileCode。
    quint32 code = 0;
    memcpy(&code, pdu->caData, sizeof(code));
    qDebug() << "[rename] FileCode=" << code;

    switch (static_cast<FileCode>(code)) {
    case FileCode::Ok:
        // 重命名成功，刷新目录。
        Index::getInstance().getFile()->flushFile();
        break;

    case FileCode::NotLogin:
        QMessageBox::information(
            &Index::getInstance(), "提示", "请先登录");
        break;

    case FileCode::InvalidName:
        QMessageBox::information(
            &Index::getInstance(), "提示", "文件名非法");
        break;

    case FileCode::InvalidPath:
        QMessageBox::information(
            &Index::getInstance(), "提示", "路径非法");
        break;

    case FileCode::NotFound:
        QMessageBox::information(
            &Index::getInstance(), "提示", "原文件不存在");
        break;

    case FileCode::AlreadyExists:
        QMessageBox::information(
            &Index::getInstance(), "提示", "目标名称已存在");
        break;

    default:
        QMessageBox::information(
            &Index::getInstance(), "提示", "重命名失败");
        break;
    }
}
void Reshandle::uploadfileinit()
{
    // 服务端在 caData 前 4 字节返回 FileCode。
    quint32 code = 0;
    memcpy(&code, pdu->caData, sizeof(code));

    qDebug() << "[uploadfileinit] FileCode=" << code;

    if (static_cast<FileCode>(code) != FileCode::Ok) {
        switch (static_cast<FileCode>(code)) {
        case FileCode::NotLogin:
            QMessageBox::information(
                &Index::getInstance(), "提示", "请先登录");
            break;
        case FileCode::InvalidName:
            QMessageBox::information(
                &Index::getInstance(), "提示", "文件名非法");
            break;
        case FileCode::InvalidPath:
            QMessageBox::information(
                &Index::getInstance(), "提示", "目标路径非法");
            break;
        case FileCode::NotFound:
            QMessageBox::information(
                &Index::getInstance(), "提示", "目标目录不存在");
            break;
        case FileCode::AlreadyExists:
            QMessageBox::information(
                &Index::getInstance(), "提示", "同名文件已存在");
            break;
        case FileCode::OpenFailed:
            QMessageBox::information(
                &Index::getInstance(), "提示", "服务端打开文件失败");
            break;
        default:
            QMessageBox::information(
                &Index::getInstance(), "提示", "上传初始化失败");
            break;
        }
        return;
    }

    // 成功时：caData[4..11] 是 nextOffset，caMsg 是 uploadId。
    qint64 nextOffset = 0;
    memcpy(&nextOffset,
           pdu->caData + sizeof(quint32),
           sizeof(nextOffset));

    const QByteArray idBytes =
        QByteArray(pdu->caMsg, pdu->uiMsgLen);
    const QString uploadId = QString::fromUtf8(idBytes).trimmed();

    qDebug() << "[uploadfileinit] uploadId=" << uploadId
             << "nextOffset=" << nextOffset;

    File* file = Index::getInstance().getFile();
    file->m_strUploadId = uploadId;
    file->m_iUploadOffset = nextOffset;

    // 让本地文件跳到服务端已经收到的位置。
    if (nextOffset > 0 && !file->m_uploadFile.seek(nextOffset)) {
        QMessageBox::information(
            &Index::getInstance(), "提示", "定位本地文件失败");
        return;
    }

    file->uploadFile();
}

void Reshandle::uploadChunk()
{
    quint32 code = 0;
    memcpy(&code, pdu->caData, sizeof(code));

    qDebug() << "[uploadChunk] FileCode=" << code;

    File* file = Index::getInstance().getFile();

    if (static_cast<FileCode>(code) != FileCode::Ok) {
        file->cancelUpload("服务端写入分片失败");
        return;
    }

    qint64 nextOffset = 0;
    memcpy(&nextOffset,
           pdu->caData + sizeof(quint32),
           sizeof(nextOffset));

    qDebug() << "[uploadChunk] nextOffset=" << nextOffset;

    file->m_iUploadOffset = nextOffset;

    // 收到确认后继续发下一片。
    file->sendNextChunk();
}

void Reshandle::finishUpload()
{
    quint32 code = 0;
    memcpy(&code, pdu->caData, sizeof(code));

    qDebug() << "[finishUpload] FileCode=" << code;

    File* file = Index::getInstance().getFile();
    file->m_bUploading = false;

    if (file->m_uploadFile.isOpen()) {
        file->m_uploadFile.close();
    }

    if (static_cast<FileCode>(code) != FileCode::Ok) {
        QMessageBox::information(
            &Index::getInstance(), "提示", "上传完成失败");
        return;
    }

    QMessageBox::information(
        &Index::getInstance(), "提示", "上传文件完成");
    file->flushFile();
}

void Reshandle::resumeUpload()
{
    quint32 code = 0;
    memcpy(&code, pdu->caData, sizeof(code));

    qDebug() << "[resumeUpload] FileCode=" << code;

    if (static_cast<FileCode>(code) != FileCode::Ok) {
        QMessageBox::information(
            &Index::getInstance(), "提示", "断点续传失败");
        return;
    }

    qint64 nextOffset = 0;
    memcpy(&nextOffset,
           pdu->caData + sizeof(quint32),
           sizeof(nextOffset));

    File* file = Index::getInstance().getFile();
    file->m_iUploadOffset = nextOffset;

    if (!file->m_uploadFile.seek(nextOffset)) {
        QMessageBox::information(
            &Index::getInstance(), "提示", "定位本地文件失败");
        return;
    }

    file->uploadFile();
}

void Reshandle::uploadfiledata()
{
    // 旧的整文件上传响应，保留兼容，不再使用。
    QMessageBox::information(
        &Index::getInstance(), "提示", "上传文件完成");
    Index::getInstance().getFile()->flushFile();
}

void Reshandle::downloadFile()
{
    // 服务端在 caData 前 4 字节返回 FileCode。
    quint32 code = 0;
    memcpy(&code, pdu->caData, sizeof(code));
    qDebug() << "[downloadFile] FileCode=" << code;

    if (static_cast<FileCode>(code) != FileCode::Ok) {
        switch (static_cast<FileCode>(code)) {
        case FileCode::NotLogin:
            QMessageBox::information(
                &Index::getInstance(), "提示", "请先登录");
            break;
        case FileCode::InvalidPath:
            QMessageBox::information(
                &Index::getInstance(), "提示", "文件路径非法");
            break;
        case FileCode::NotFound:
            QMessageBox::information(
                &Index::getInstance(), "提示", "文件不存在");
            break;
        case FileCode::OpenFailed:
            QMessageBox::information(
                &Index::getInstance(), "提示", "服务端打开文件失败");
            break;
        default:
            QMessageBox::information(
                &Index::getInstance(), "提示", "下载失败");
            break;
        }
        return;
    }

    // 成功时读取文件大小。
    // caData[4..11] 是 qint64。
    qint64 fileSize = 0;
    memcpy(&fileSize,
           pdu->caData + sizeof(quint32),
           sizeof(fileSize));

    Index::getInstance().getFile()->downloadFile(fileSize);
}

void Reshandle::downloadFileData()
{
    Index::getInstance().getFile()->downloadFileData(pdu->caMsg,pdu->uiMsgLen);
}
