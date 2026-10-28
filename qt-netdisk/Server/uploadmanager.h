#ifndef UPLOADMANAGER_H
#define UPLOADMANAGER_H

#include "protocol.h"

#include <QHash>
#include <QMutex>
#include <QString>

/**
 * 一次上传会话。
 *
 * 第一版放在内存里，服务端重启会丢失。
 * 后续可以把这些字段持久化到 upload_session 表。
 */
struct UploadSession
{
    QString uploadId;    // 会话 ID
    QString userName;    // 所属用户
    QString tempPath;    // .part 临时文件路径
    QString finalPath;   // 最终文件路径
    qint64 totalSize;    // 文件总大小
    qint64 receivedSize; // 已接收字节数
};

/**
 * 上传会话管理。
 *
 * 只负责会话、临时文件、offset 校验和完成改名，
 * 不处理 PDU，不访问 UI。
 */
class UploadManager
{
public:
    static UploadManager& getInstance();

    /**
     * 创建上传会话。
     *
     * @param userName  当前登录用户。
     * @param tempDir   临时文件目录，例如 ./filesys/alice/.upload。
     * @param finalPath 最终文件路径。
     * @param totalSize 文件总大小。
     * @param session   输出参数，成功时写入会话信息。
     * @param error     输出参数，失败时写入错误码。
     */
    bool createSession(const QString& userName,
                       const QString& tempDir,
                       const QString& finalPath,
                       qint64 totalSize,
                       UploadSession& session,
                       FileCode& error);

    /**
     * 按 uploadId 查询会话，并校验会话属于当前用户。
     */
    bool getSession(const QString& uploadId,
                    const QString& userName,
                    UploadSession& session) const;

    /**
     * 按最终文件路径查找未完成会话。
     *
     * 用于断点续传：用户重新选择同一个文件时，
     * 复用之前的上传会话，而不是从 0 开始。
     *
     * @return 找到返回 true，session 写入会话。
     */
    bool findSessionByFinalPath(const QString& userName,
                                const QString& finalPath,
                                UploadSession& session) const;

    /**
     * 写入一个分片。
     *
     * 第一版只允许顺序写：
     * offset 必须等于当前 receivedSize。
     *
     * @param nextOffset 输出参数，成功时写入写入后的偏移。
     */
    bool writeChunk(const QString& uploadId,
                    const QString& userName,
                    qint64 offset,
                    const QByteArray& data,
                    qint64& nextOffset,
                    FileCode& error);

    /**
     * 完成上传：校验大小，把 .part 原子改名为最终文件。
     */
    bool finish(const QString& uploadId,
                const QString& userName,
                FileCode& error);

private:
    UploadManager();

    QHash<QString, UploadSession> m_sessions; // key 是 uploadId
    mutable QMutex m_mutex;                    // 保护 m_sessions
};

#endif // UPLOADMANAGER_H
