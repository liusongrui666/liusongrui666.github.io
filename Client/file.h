#ifndef FILE_H
#define FILE_H

#include "protocol.h"

#include <QWidget>
#include <QFile>
#include <qlistwidget.h>

namespace Ui {
class File;
}

class File : public QWidget
{
    Q_OBJECT

public:
    QString m_strUserPath;
    QString m_strCurPath;
    QString m_strUploadFilePath;
    //下载相关成员
    bool m_bDownload;//标记是否有文件正在下载，防止重复下载
    QString m_strSaveFilePath;//本地保存路径
    QString m_strDownloadFileName;//要下载的文件名
    QFile m_DownloadFile;//本地文件对象
    qint64 m_iDownloadReceived;//已接收大小
    qint64 m_iDownloadTotal;//文件总大小
    QList<FileInfo *>m_pFileInfoList;

    // 分片上传状态。
    // 上传时一次只允许一个文件，所以这些成员够用。
    QFile m_uploadFile;          // 本地待上传文件
    QString m_strUploadFileName; // 文件名
    QString m_strUploadId;       // 服务端返回的上传会话 ID
    qint64 m_iUploadTotal;       // 文件总大小
    qint64 m_iUploadOffset;      // 已发送到哪个位置
    bool m_bUploading;           // 是否正在上传

    void flushFile();
    void uploadFile();
    void sendNextChunk();        // 发送下一片
    void finishUpload();         // 发送完成请求
    void resumeUpload();         // 查询已接收偏移，继续上传
    void cancelUpload(const QString& reason); // 失败时清理状态
    void downloadFile(qint64 iFileSize);
    void downloadFileData(char* buffer,int size);
    void updateFileList( QList<FileInfo *>pFileInfoList);
    explicit File(QWidget *parent = nullptr);
    ~File();
public slots:
    void uploadErrorBox(const QString& msg);

private slots:
    void on_mkdir_PB_clicked();

    void on_flush_PB_clicked();

    void on_del_PB_clicked();

    void on_rename_PB_clicked();

    void on_listWidget_itemDoubleClicked(QListWidgetItem *item);

    void on_return_PB_clicked();

    void on_upload_PB_clicked();

    void on_download_PB_clicked();

private:
    Ui::File *ui;
};

#endif // FILE_H
