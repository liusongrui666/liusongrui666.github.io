#include "client.h"
#include "file.h"
#include "ui_file.h"
#include "uploader.h"
#include <QFileDialog>
#include<QString>
#include <qinputdialog.h>
#include <qmessagebox.h>
void File::flushFile()
{
    PDU* pdu=mkPDU(m_strCurPath.toStdString().size()+1);
    pdu->uiType=ENUM_TYPE_FLUSH_FILE_REQUEST;
    memcpy(pdu->caMsg,m_strCurPath.toStdString().c_str(),m_strCurPath.toStdString().size());
    qDebug() << "[flushFile] virtual=" << m_strCurPath;
    Client::getInstance().sendMsg(pdu);
}

void File::uploadFile()
{
    // 服务端已经创建上传会话，开始发第一片。
    //
    // 注意：不要在这里把 m_iUploadOffset 置 0。
    // 断点续传时，Reshandle::uploadfileinit 已经把 offset
    // 设置为服务端返回的 nextOffset。
    m_bUploading = true;
    sendNextChunk();
}

void File::sendNextChunk()
{
    // 不在上传状态就不发。
    if (!m_bUploading) {
        return;
    }

    // 本地文件必须已经打开。
    if (!m_uploadFile.isOpen()) {
        cancelUpload("本地文件未打开");
        return;
    }

    // 已经发完，进入完成阶段。
    if (m_iUploadOffset >= m_iUploadTotal) {
        finishUpload();
        return;
    }

    // 每次读一片，大小 1 MiB。
    const qint64 chunkSize = 1024 * 1024;
    const QByteArray data = m_uploadFile.read(chunkSize);

    if (data.isEmpty() && !m_uploadFile.atEnd()) {
        cancelUpload("读取本地文件失败");
        return;
    }

    if (data.isEmpty() && m_uploadFile.atEnd()) {
        finishUpload();
        return;
    }

    // 构造分片元数据。
    // 必须和 protocol.h 里的布局一致：
    //   caData[0..35]  uploadId
    //   caData[36..43] offset
    //   caData[44..47] dataLen
    UploadChunkMeta meta;
    memset(&meta, 0, sizeof(meta));

    const QByteArray idBytes = m_strUploadId.toUtf8();
    memcpy(meta.uploadId, idBytes.constData(),
           qMin(idBytes.size(), UPLOAD_ID_LEN));
    meta.offset = static_cast<quint64>(m_iUploadOffset);
    meta.dataLen = static_cast<quint32>(data.size());

    PDU* pdu = mkPDU(data.size());
    pdu->uiType = ENUM_TYPE_UPLOAD_CHUNK_REQUEST;
    memcpy(pdu->caData, &meta, sizeof(meta));
    memcpy(pdu->caMsg, data.constData(), data.size());

    qDebug() << "[sendChunk] uploadId=" << m_strUploadId
             << "offset=" << m_iUploadOffset
             << "len=" << data.size();

    Client::getInstance().sendMsg(pdu);
}

void File::finishUpload()
{
    PDU* pdu = mkPDU();
    pdu->uiType = ENUM_TYPE_UPLOAD_FINISH_REQUEST;

    const QByteArray idBytes = m_strUploadId.toUtf8();
    memcpy(pdu->caData, idBytes.constData(),
           qMin(idBytes.size(), UPLOAD_ID_LEN));

    qDebug() << "[finishUpload] uploadId=" << m_strUploadId;

    Client::getInstance().sendMsg(pdu);
}

void File::resumeUpload()
{
    // 没有保存过 uploadId，无法断点续传。
    if (m_strUploadId.isEmpty()) {
        qDebug() << "[resumeUpload] no uploadId, skip";
        uploadFile();
        return;
    }

    // 本地文件必须先打开。
    if (!m_uploadFile.isOpen()) {
        cancelUpload("本地文件未打开");
        return;
    }

    PDU* pdu = mkPDU();
    pdu->uiType = ENUM_TYPE_UPLOAD_RESUME_REQUEST;

    const QByteArray idBytes = m_strUploadId.toUtf8();
    memcpy(pdu->caData, idBytes.constData(),
           qMin(idBytes.size(), UPLOAD_ID_LEN));

    qDebug() << "[resumeUpload] uploadId=" << m_strUploadId;

    Client::getInstance().sendMsg(pdu);
}

void File::cancelUpload(const QString& reason)
{
    m_bUploading = false;

    if (m_uploadFile.isOpen()) {
        m_uploadFile.close();
    }

    QMessageBox::information(this, "上传失败", reason);
}

void File::updateFileList( QList<FileInfo *>pFileInfoList)
{
    foreach(FileInfo* pFileInfo,m_pFileInfoList){
        delete pFileInfo;
    }
    m_pFileInfoList.clear();
    m_pFileInfoList=pFileInfoList;
    ui->listWidget->clear();
    foreach(FileInfo* pFileInfo,pFileInfoList){
        QListWidgetItem* pItem=new QListWidgetItem;
        if(pFileInfo->iFileType==0){
            pItem->setIcon(QIcon(QPixmap(":/dir.png")));
        }
        else{
            pItem->setIcon(QIcon(QPixmap(":/file.png")));
        }
        pItem->setText(pFileInfo->caName);
        ui->listWidget->addItem(pItem);
    }
}

File::File(QWidget *parent) :
    QWidget(parent),
    ui(new Ui::File)
{
    ui->setupUi(this);
    m_bDownload=false;
    m_iDownloadReceived=0;
    m_iDownloadTotal=0;

    // 分片上传初始状态。
    m_bUploading = false;
    m_iUploadTotal = 0;
    m_iUploadOffset = 0;

    // 客户端只使用虚拟路径。
    // "/" 表示当前用户的根目录，
    // 服务端会把它映射成 "./filesys/<登录名>"。
    m_strUserPath = "/";
    m_strCurPath = "/";

    flushFile();
}
File::~File()
{
    delete ui;
}

void File::uploadErrorBox(const QString &msg)
{
    QMessageBox::information(this,"提示",msg);
}

void File::on_mkdir_PB_clicked()
{
    // QInputDialog::getText 弹出输入框，返回用户输入的字符串。
    // 参数 1：this，父窗口。
    // 参数 2："新建文件夹"，窗口标题。
    // 参数 3："新建文件夹名："，提示文字。
    const QString strDirName =
        QInputDialog::getText(this, "新建文件夹", "新建文件夹名：");

    // 用户点取消时返回空字符串。
    if (strDirName.isEmpty()) {
        return;
    }

    // 客户端先做一次简单校验，服务端仍会再校验。
    // 目录名不能包含 / 或 \，否则会被当成多级路径。
    if (strDirName.contains('/')
        || strDirName.contains('\\')
        || strDirName == "."
        || strDirName == "..") {
        QMessageBox::information(
            this, "提示", "文件夹名不能包含路径分隔符");
        return;
    }

    // 目录名要放进 caData，最多 32 字节。
    const QByteArray nameBytes = strDirName.toUtf8();
    if (nameBytes.size() > 31) {
        QMessageBox::information(
            this, "提示", "文件夹名过长");
        return;
    }

    // m_strCurPath 是客户端当前虚拟目录，例如 "/docs"。
    const QByteArray pathBytes = m_strCurPath.toUtf8();

    // mkPDU 的参数是消息体长度。
    // +1 是给字符串结尾的 '\0' 留位置。
    PDU* pdu = mkPDU(pathBytes.size() + 1);

    // 消息类型：新建目录请求。
    pdu->uiType = ENUM_TYPE_MKDIR_REQUEST;

    // 把虚拟路径写入 caMsg。
    // mkPDU 已经清零，所以最后一个字节是 '\0'。
    memcpy(pdu->caMsg, pathBytes.constData(), pathBytes.size());

    // 目录名写入 caData 前 32 字节。
    // 先清零，再按实际长度复制，避免短名字后面带垃圾字节。
    memset(pdu->caData, 0, sizeof(pdu->caData));
    memcpy(pdu->caData, nameBytes.constData(), nameBytes.size());

    qDebug() << "[mkdir] virtual=" << m_strCurPath << "name=" << strDirName;
    Client::getInstance().sendMsg(pdu);
}

void File::on_flush_PB_clicked()
{
    flushFile();
}

void File::on_del_PB_clicked()
{
    // ui->listWidget 是文件列表控件。
    // currentItem() 返回当前选中的项，没有选中时返回 nullptr。
    QListWidgetItem* pItem = ui->listWidget->currentItem();
    if (!pItem) {
        return;
    }

    // QMessageBox::question 弹出确认框，返回用户点击的按钮。
    // 参数 1：this，父窗口。
    // 参数 2："删除文件"，窗口标题。
    // 参数 3：提示内容，%1 被替换成文件名。
    // 参数 4：默认按钮，这里默认是 No。
    const int ret = QMessageBox::question(
        this,
        "删除文件",
        QString("是否删除%1?").arg(pItem->text()),
        QMessageBox::Yes | QMessageBox::No,
        QMessageBox::No);

    if (ret != QMessageBox::Yes) {
        return;
    }

    // m_strCurPath 是当前虚拟目录，例如 "/docs"。
    // pItem->text() 是选中的文件名。
    // 拼接成完整虚拟路径 "/docs/report.pdf"。
    const QString virtualPath =
        QString("%1/%2").arg(m_strCurPath).arg(pItem->text());

    const QByteArray pathBytes = virtualPath.toUtf8();

    // mkPDU 的参数是消息体长度，+1 给 '\0' 留位置。
    PDU* pdu = mkPDU(pathBytes.size() + 1);

    // 消息类型：删除请求。
    pdu->uiType = ENUM_TYPE_DEL_FILE_REQUEST;

    // 把虚拟路径写入 caMsg。
    memcpy(pdu->caMsg, pathBytes.constData(), pathBytes.size());

    qDebug() << "[delFile] virtual=" << virtualPath;
    Client::getInstance().sendMsg(pdu);
}

void File::on_rename_PB_clicked()
{
    // 取当前选中的文件或目录。
    QListWidgetItem* pItem = ui->listWidget->currentItem();
    if (!pItem) {
        return;
    }

    // QInputDialog::getText 弹出输入框，让用户输入新名字。
    const QString strNewName =
        QInputDialog::getText(this, "重命名", "新文件名：");

    // 用户点取消时返回空字符串。
    if (strNewName.isEmpty()) {
        return;
    }

    // 客户端先做简单校验，服务端仍会再校验。
    if (strNewName.contains('/')
        || strNewName.contains('\\')
        || strNewName == "."
        || strNewName == "..") {
        QMessageBox::information(
            this, "提示", "文件名不能包含路径分隔符");
        return;
    }

    // 旧名字和新名字都要放进 caData，各占 32 字节。
    const QByteArray oldNameBytes = pItem->text().toUtf8();
    const QByteArray newNameBytes = strNewName.toUtf8();

    if (oldNameBytes.size() > 31 || newNameBytes.size() > 31) {
        QMessageBox::information(
            this, "提示", "文件名过长");
        return;
    }

    // m_strCurPath 是当前虚拟目录，例如 "/docs"。
    const QByteArray pathBytes = m_strCurPath.toUtf8();

    // 消息体长度 = 虚拟路径字节数 + 1 个 '\0'。
    PDU* pdu = mkPDU(pathBytes.size() + 1);

    // 消息类型：重命名请求。
    pdu->uiType = ENUM_TYPE_RENAME_REQUEST;

    // 旧名字写入 caData[0..31]。
    // 新名字写入 caData[32..63]。
    // 先清零，避免短名字后面带垃圾字节。
    memset(pdu->caData, 0, sizeof(pdu->caData));
    memcpy(pdu->caData,
           oldNameBytes.constData(),
           oldNameBytes.size());
    memcpy(pdu->caData + 32,
           newNameBytes.constData(),
           newNameBytes.size());

    // 虚拟目录写入 caMsg。
    memcpy(pdu->caMsg, pathBytes.constData(), pathBytes.size());

    qDebug() << "[rename] virtual=" << m_strCurPath << "old=" << pItem->text() << "new=" << strNewName;
    Client::getInstance().sendMsg(pdu);
}

void File::on_listWidget_itemDoubleClicked(QListWidgetItem *item)
{
    // 双击文件不进入目录。
    foreach(FileInfo* pFileInfo, m_pFileInfoList){
        if(pFileInfo->caName == item->text()
            && pFileInfo->iFileType != 0){
            return;
        }
    }

    // 拼接虚拟路径。
    // QDir::filePath 会在需要时补 "/"，
    // 避免出现 "//docs"。
    m_strCurPath = QDir(m_strCurPath).filePath(item->text());

    flushFile();
}

void File::on_return_PB_clicked()
{
    // 已经在根目录，不能再返回。
    if(m_strCurPath == m_strUserPath){
        return;
    }

    // QDir::cdUp 把路径上移一级。
    // 例如 "/docs/sub" 变成 "/docs"。
    QDir dir(m_strCurPath);
    dir.cdUp();

    m_strCurPath = dir.path();

    // 防御：cdUp 后如果变成空字符串，恢复成根目录。
    if(m_strCurPath.isEmpty()){
        m_strCurPath = "/";
    }

    flushFile();
}

void File::on_upload_PB_clicked()
{
    // 同一时间只允许一个上传任务。
    if (m_bUploading) {
        QMessageBox::information(this, "提示", "已有文件正在上传");
        return;
    }

    // QFileDialog::getOpenFileName 弹出文件选择框。
    // 用户取消时返回空字符串。
    m_strUploadFilePath.clear();
    m_strUploadFilePath = QFileDialog::getOpenFileName();

    if (m_strUploadFilePath.isEmpty()) {
        return;
    }

    // 打开本地文件，后面分片读取要用。
    m_uploadFile.setFileName(m_strUploadFilePath);
    if (!m_uploadFile.open(QIODevice::ReadOnly)) {
        QMessageBox::information(this, "提示", "打开本地文件失败");
        return;
    }

    // QFileInfo 用于取文件名和文件大小。
    const QFileInfo fileInfo(m_strUploadFilePath);
    const QString fileName = fileInfo.fileName();

    // 文件名要放进 caData，最多 31 字节。
    const QByteArray nameBytes = fileName.toUtf8();
    if (nameBytes.size() > 31) {
        m_uploadFile.close();
        QMessageBox::information(
            this, "提示", "文件名过长");
        return;
    }

    // 记录本次上传的信息。
    m_strUploadFileName = fileName;
    m_iUploadTotal = fileInfo.size();
    m_iUploadOffset = 0;
    m_strUploadId.clear();

    // m_strCurPath 是当前虚拟目录，例如 "/docs"。
    const QByteArray pathBytes = m_strCurPath.toUtf8();

    // 消息体长度 = 虚拟路径字节数 + 1 个 '\0'。
    PDU* pdu = mkPDU(pathBytes.size() + 1);

    // 消息类型：上传初始化请求。
    pdu->uiType = ENUM_TYPE_UPLOAD_INIT_REQUEST;

    // caData 先清零。
    memset(pdu->caData, 0, sizeof(pdu->caData));

    // 文件名写入 caData[0..31]。
    memcpy(pdu->caData, nameBytes.constData(), nameBytes.size());

    // 文件大小写入 caData[32..39]。
    // 只复制 sizeof(qint64) 字节。
    memcpy(pdu->caData + 32, &m_iUploadTotal, sizeof(m_iUploadTotal));

    // 虚拟目录写入 caMsg。
    memcpy(pdu->caMsg, pathBytes.constData(), pathBytes.size());

    qDebug() << "[uploadInit] virtual=" << m_strCurPath
             << "file=" << fileName
             << "size=" << m_iUploadTotal;

    Client::getInstance().sendMsg(pdu);
}

void File::on_download_PB_clicked()
{
    // 已经有文件在下载时不允许重复下载。
    if (m_bDownload) {
        QMessageBox::warning(this, "下载文件", "已有文件正在下载");
        return;
    }

    // 取当前选中的文件。
    QListWidgetItem* pItem = ui->listWidget->currentItem();
    if (!pItem) {
        QMessageBox::warning(this, "下载文件", "请选择要下载的文件");
        return;
    }

    // QFileDialog::getSaveFileName 弹出保存路径选择框。
    // 用户取消时返回空字符串。
    m_strSaveFilePath.clear();
    m_strSaveFilePath = QFileDialog::getSaveFileName();
    if (m_strSaveFilePath.isEmpty()) {
        QMessageBox::warning(this, "下载文件", "请指定下载路径");
        return;
    }

    m_strDownloadFileName = pItem->text();

    // m_strCurPath 是当前虚拟目录，例如 "/docs"。
    // 拼接成完整虚拟路径 "/docs/report.pdf"。
    const QString virtualPath =
        QString("%1/%2").arg(m_strCurPath).arg(m_strDownloadFileName);

    const QByteArray pathBytes = virtualPath.toUtf8();

    // mkPDU 的参数是消息体长度，+1 给 '\0' 留位置。
    PDU* pdu = mkPDU(pathBytes.size() + 1);

    // 消息类型：下载请求。
    pdu->uiType = ENUM_TYPE_DOWNLOAD_FILE_REQUEST;

    // 虚拟路径写入 caMsg。
    memcpy(pdu->caMsg, pathBytes.constData(), pathBytes.size());

    qDebug() << "[download] virtual=" << virtualPath;
    Client::getInstance().sendMsg(pdu);
}

void File::downloadFile(qint64 iFileSize)
{
    m_iDownloadReceived=0;
    m_iDownloadTotal=iFileSize;
    m_bDownload=true;
    m_DownloadFile.setFileName(m_strSaveFilePath);
    if(!m_DownloadFile.open(QIODevice::WriteOnly)){
        QMessageBox::warning(this,"下载文件","打开文件失败");
        return;
    }
    //服务器已经准备好文件了，通知服务器开始发送文件数据
    PDU* pdu=mkPDU(0);
    pdu->uiType=ENUM_TYPE_DOWNLOAD_FILE_DATA_REQUEST;
    Client::getInstance().sendMsg(pdu);
}

void File::downloadFileData(char *buffer, int size)
{
    m_DownloadFile.write(buffer,size);
    m_iDownloadReceived+=size;
    if(m_iDownloadReceived<m_iDownloadTotal){
        return;//还没接收完，继续等下一块数据
    }
    m_DownloadFile.close();
    m_bDownload=false;
    QMessageBox::information(this,"下载文件","下载文件完成");
}
