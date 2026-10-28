#include "uploadmanager.h"

#include <QDir>
#include <QFile>
#include <QFileInfo>
#include <QMutexLocker>
#include <QUuid>

UploadManager& UploadManager::getInstance()
{
    static UploadManager instance;
    return instance;
}

UploadManager::UploadManager()
{
}

bool UploadManager::createSession(const QString& userName,
                                  const QString& tempDir,
                                  const QString& finalPath,
                                  qint64 totalSize,
                                  UploadSession& session,
                                  FileCode& error)
{
    // 用户名和文件大小必须合法。
    if (userName.isEmpty() || totalSize < 0) {
        error = FileCode::InvalidPath;
        return false;
    }

    // 创建临时目录，例如 ./filesys/alice/.upload。
    // mkpath 会递归创建，目录已存在时返回 true。
    QDir dir;
    if (!dir.mkpath(tempDir)) {
        error = FileCode::ServerError;
        return false;
    }

    // 生成会话 ID。
    // QUuid::WithoutBraces 去掉大括号，长度正好 36。
    const QString uploadId =
        QUuid::createUuid().toString(QUuid::WithoutBraces);

    // 临时文件路径：.upload/<uploadId>.part。
    const QString tempPath =
        QDir(tempDir).filePath(uploadId + ".part");

    // 创建空临时文件。
    QFile file(tempPath);
    if (!file.open(QIODevice::WriteOnly)) {
        error = FileCode::OpenFailed;
        return false;
    }
    file.close();

    session.uploadId = uploadId;
    session.userName = userName;
    session.tempPath = tempPath;
    session.finalPath = finalPath;
    session.totalSize = totalSize;
    session.receivedSize = 0;

    QMutexLocker locker(&m_mutex);
    m_sessions.insert(uploadId, session);

    error = FileCode::Ok;
    return true;
}

bool UploadManager::getSession(const QString& uploadId,
                               const QString& userName,
                               UploadSession& session) const
{
    QMutexLocker locker(&m_mutex);

    auto it = m_sessions.constFind(uploadId);
    if (it == m_sessions.constEnd()) {
        return false;
    }

    // 只能访问自己的会话，防止 uploadId 被其他用户使用。
    if (it->userName != userName) {
        return false;
    }

    session = it.value();
    return true;
}

bool UploadManager::findSessionByFinalPath(const QString& userName,
                                           const QString& finalPath,
                                           UploadSession& session) const
{
    QMutexLocker locker(&m_mutex);

    for (auto it = m_sessions.constBegin();
         it != m_sessions.constEnd(); ++it) {
        const UploadSession& s = it.value();

        if (s.userName == userName && s.finalPath == finalPath) {
            session = s;
            return true;
        }
    }

    return false;
}

bool UploadManager::writeChunk(const QString& uploadId,
                               const QString& userName,
                               qint64 offset,
                               const QByteArray& data,
                               qint64& nextOffset,
                               FileCode& error)
{
    QMutexLocker locker(&m_mutex);

    auto it = m_sessions.find(uploadId);
    if (it == m_sessions.end()) {
        error = FileCode::NotFound;
        return false;
    }

    UploadSession& session = it.value();

    // 会话必须属于当前用户。
    if (session.userName != userName) {
        error = FileCode::NotLogin;
        return false;
    }

    // 第一版只允许顺序写。
    // 重复分片、跳跃分片都拒绝，逻辑更容易验证。
    if (offset != session.receivedSize) {
        error = FileCode::InvalidPath;
        return false;
    }

    // 空分片、超出总大小都拒绝。
    if (data.isEmpty()
        || session.receivedSize + data.size() > session.totalSize) {
        error = FileCode::InvalidPath;
        return false;
    }

    QFile file(session.tempPath);
    if (!file.open(QIODevice::ReadWrite)) {
        error = FileCode::OpenFailed;
        return false;
    }

    if (!file.seek(offset)) {
        error = FileCode::ServerError;
        return false;
    }

    const qint64 written = file.write(data);
    if (written != data.size()) {
        error = FileCode::WriteFailed;
        return false;
    }

    file.flush();
    file.close();

    session.receivedSize += written;
    nextOffset = session.receivedSize;

    error = FileCode::Ok;
    return true;
}

bool UploadManager::finish(const QString& uploadId,
                           const QString& userName,
                           FileCode& error)
{
    QMutexLocker locker(&m_mutex);

    auto it = m_sessions.find(uploadId);
    if (it == m_sessions.end()) {
        error = FileCode::NotFound;
        return false;
    }

    UploadSession session = it.value();

    if (session.userName != userName) {
        error = FileCode::NotLogin;
        return false;
    }

    // 必须收满总大小才能完成。
    if (session.receivedSize != session.totalSize) {
        error = FileCode::InvalidPath;
        return false;
    }

    // 最终文件不能已经存在，避免覆盖。
    if (QFileInfo::exists(session.finalPath)) {
        error = FileCode::AlreadyExists;
        return false;
    }

    // 原子改名：同一磁盘内 rename 是原子操作。
    if (!QFile::rename(session.tempPath, session.finalPath)) {
        error = FileCode::ServerError;
        return false;
    }

    m_sessions.erase(it);

    error = FileCode::Ok;
    return true;
}
