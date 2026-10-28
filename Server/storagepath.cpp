#include "storagepath.h"

#include <QDir>
#include <QFileInfo>
#include <QFile>
#include <QTextStream>

bool StoragePath::validFileName(const QString& fileName)
{
    // 空名称、"."、".." 都不能作为文件名或目录名。
    // "." 和 ".." 在文件系统里有特殊含义，必须拒绝。
    if (fileName.isEmpty() || fileName == "." || fileName == "..") {
        return false;
    }

    // 单个文件名里不能包含目录分隔符。
    // 否则 "a/b" 会被当成多级路径，
    // 绕过“只能改当前目录下的名字”这个约束。
    if (fileName.contains('/') || fileName.contains('\\')) {
        return false;
    }

    // Windows 下这些字符非法，或者容易被解释成特殊含义。
    // 即使在 Linux 上，也建议统一拒绝，保证跨平台行为一致。
    if (fileName.contains(':')
        || fileName.contains('*')
        || fileName.contains('?')
        || fileName.contains('"')
        || fileName.contains('<')
        || fileName.contains('>')
        || fileName.contains('|')) {
        return false;
    }

    // 文件名长度限制，避免超出文件系统限制。
    // toUtf8().size() 返回字节数，不是字符数。
    if (fileName.toUtf8().size() > 255) {
        return false;
    }

    return true;
}

bool StoragePath::resolve(const QString& userRoot,
                          const QString& virtualPath,
                          QString& physicalPath)
{
    // 先清空输出，失败时调用方不会误用上一次的旧路径。
    physicalPath.clear();

    // 用户根目录必须由服务端提供。
    // 如果为空，说明未登录或配置错误，直接失败。
    if (userRoot.isEmpty()) {
        return false;
    }

    // QDir::fromNativeSeparators 把 Windows 的反斜杠统一成正斜杠。
    // trimmed 去掉首尾空白，避免 " /docs " 这种输入。
    QString relative =
        QDir::fromNativeSeparators(virtualPath.trimmed());

    // 空路径当作根目录 "/"。
    if (relative.isEmpty()) {
        relative = "/";
    }

    // 拒绝 Windows 盘符路径和 UNC 路径，例如：
    //   C:/Windows
    //   \\server\share
    //
    // 注意：不能直接用 QDir::isAbsolutePath 判断。
    // 在 Windows 上 "/docs" 也会返回 true，
    // 但 "/docs" 是合法的虚拟路径。
    if (relative.size() >= 2 && relative.at(1) == ':') {
        return false;
    }
    if (relative.startsWith("//")) {
        return false;
    }

    // QDir::cleanPath 做字符串层面的规范化：
    // 例如 "a/../b" 变成 "b"，"a//b" 变成 "a/b"。
    //
    // 注意：cleanPath 只负责格式规范，
    // 不代表安全，后面还必须做根目录边界校验。
    relative = QDir::cleanPath(relative);

    // 规范化后如果以 ".." 开头，
    // 说明试图向上越出根目录，直接拒绝。
    if (relative == ".." || relative.startsWith("../")) {
        return false;
    }

    // 去掉开头的 "/"，
    // 因为后面要用 QDir::filePath 拼接到根目录后面。
    if (relative.startsWith('/')) {
        relative.remove(0, 1);
    }

    // QDir::absolutePath 把相对根目录转成绝对路径，
    // 避免程序工作目录变化导致解析结果不一致。
    const QString root = QDir(userRoot).absolutePath();

    // QDir::absoluteFilePath 把相对路径拼到根目录下，
    // 得到候选物理路径。
    //
    // 注意：relative 为空表示用户根目录本身。
    // 不能直接调用 absoluteFilePath("")：
    // 它会返回带尾部斜杠的路径，
    // Windows 上 QDir(".../vfsuser01/").exists() 会判为不存在。
    const QString candidate = relative.isEmpty()
        ? root
        : QDir(root).absoluteFilePath(relative);

    // 对根目录和候选路径都做一次 cleanPath，
    // 保证后面比较时格式一致。
    const QString normalizedRoot = QDir::cleanPath(root);
    const QString normalizedCandidate = QDir::cleanPath(candidate);

    // 关键边界判断：
    // relativeFilePath 计算候选路径相对于根目录的位置。
    //
    // 不能只用 candidate.startsWith(root)：
    // root      = D:/filesys/alice
    // candidate = D:/filesys/alice2/secret
    // 字符串上前者确实是后者的前缀，但实际已经是另一个目录。
    const QString relativeToRoot =
        QDir(normalizedRoot).relativeFilePath(normalizedCandidate);

    // 如果相对路径是 ".."，或者以 "../" 开头，
    // 或者中间包含 "/../"，说明越出了用户根目录。
    if (relativeToRoot == ".."
        || relativeToRoot.startsWith("../")
        || relativeToRoot.contains("/../")) {
        return false;
    }

    // 通过全部检查，写入输出参数。
    physicalPath = normalizedCandidate;
    return true;
}
