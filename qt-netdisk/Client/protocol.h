#ifndef PROTOCOL_H
#define PROTOCOL_H
#include <QtGlobal>
typedef unsigned int uint;

enum class AuthCode:quint32{
    Ok=0,
    InvalidInput=1,
    UserExists=2,
    AuthFailed=3,
    ServerError=4
};

enum class FileCode : quint32 {
    Ok = 0,             // 成功
    NotLogin = 1,       // 当前连接未登录
    InvalidPath = 2,    // 虚拟路径非法或越出用户根目录
    InvalidName = 3,    // 文件名/目录名非法
    NotFound = 4,       // 文件或目录不存在
    AlreadyExists = 5,  // 目标已存在
    OpenFailed = 6,     // 打开文件失败
    WriteFailed = 7,    // 写入失败
    ServerError = 8     // 其他服务器内部错误
};

//协议类型的枚举值
enum ENUM_TYPE{
    ENUM_TYPE_MIN=0,
    ENUM_TYPE_REQUEST,
    ENUM_TYPE_RESPOND,
    ENUM_TYPE_FIND_USER_REQUEST,
    ENUM_TYPE_FIND_USER_RESPOND,
    ENUM_TYPE_LOGIN_REQUEST,
    ENUM_TYPE_LOGIN_RESPOND,
    ENUM_TYPE_ONLINE_USER_REQUEST,
    ENUM_TYPE_ONLINE_USER_RESPOND,
    ENUM_TYPE_ADD_FRIEND_REQUEST,
    ENUM_TYPE_ADD_FRIEND_RESPOND,
    ENUM_TYPE_ADD_FRIEND_RESEND,
    ENUM_TYPE_ADD_FRIEND_AGREE_REQUEST,
    ENUM_TYPE_ADD_FRIEND_AGREE_RESPOND,
    ENUM_TYPE_FLUSH_FRIEND_REQUEST,
    ENUM_TYPE_FLUSH_FRIEND_RESPOND,
    ENUM_TYPE_DEL_FRIEND_REQUEST,
    ENUM_TYPE_DEL_FRIEND_RESPOND,
    ENUM_TYPE_CHAT_REQUEST,
    ENUM_TYPE_CHAT_RESEND,
    ENUM_TYPE_MKDIR_REQUEST,
    ENUM_TYPE_MKDIR_RESPOND,
    ENUM_TYPE_FLUSH_FILE_REQUEST,
    ENUM_TYPE_FLUSH_FILE_RESPOND,
    ENUM_TYPE_DEL_FILE_REQUEST,
    ENUM_TYPE_DEL_FILE_RESPOND,
    ENUM_TYPE_RENAME_REQUEST,
    ENUM_TYPE_RENAME_RESPOND,
    ENUM_TYPE_UPLOAD_INIT_REQUEST,
    ENUM_TYPE_UPLOAD_INIT_RESPOND,
    ENUM_TYPE_UPLOAD_FILE_DATA_REQUEST,
    ENUM_TYPE_UPLOAD_FILE_DATA_RESPOND,
    // 分片上传：发送一个分片
    ENUM_TYPE_UPLOAD_CHUNK_REQUEST,
    // 分片上传：服务端确认一个分片
    ENUM_TYPE_UPLOAD_CHUNK_RESPOND,
    // 分片上传：请求完成上传
    ENUM_TYPE_UPLOAD_FINISH_REQUEST,
    // 分片上传：完成结果
    ENUM_TYPE_UPLOAD_FINISH_RESPOND,
    // 断点续传：查询已接收偏移
    ENUM_TYPE_UPLOAD_RESUME_REQUEST,
    // 断点续传：返回已接收偏移
    ENUM_TYPE_UPLOAD_RESUME_RESPOND,
    ENUM_TYPE_DOWNLOAD_FILE_REQUEST,
    ENUM_TYPE_DOWNLOAD_FILE_RESPOND,
    ENUM_TYPE_DOWNLOAD_FILE_DATA_REQUEST,
    ENUM_TYPE_DOWNLOAD_FILE_DATA_RESPOND,
    ENUM_TYPE_MAX=9999,

};
struct PDU{//协议数据单元
    uint uiTotalLen;//协议总长度
    uint uiMsgLen;//柔性数组的长度
    uint uiType;//消息类型
    char caData[64];//参数
    char caMsg[];//实际消息
};

struct FileInfo{
    char caName[32];
    int iFileType;
};

// uploadId 固定 36 字节，和 UUID 去掉大括号后的长度一致。
const int UPLOAD_ID_LEN = 36;

/**
 * 分片元数据。
 *
 * 放在 PDU 的 caData 里，后面的 caMsg 放实际数据。
 *
 * 使用 pack(1) 保证字段紧凑排列，不受编译器对齐影响：
 *   uploadId  偏移 0，长度 36
 *   offset    偏移 36，长度 8
 *   dataLen   偏移 44，长度 4
 * 总大小 48 字节，能放进 caData[64]。
 */
#pragma pack(push, 1)
struct UploadChunkMeta
{
    char uploadId[UPLOAD_ID_LEN]; // 上传会话 ID
    quint64 offset;               // 本片在完整文件中的偏移
    quint32 dataLen;              // 本片数据长度
};
#pragma pack(pop)

static_assert(sizeof(UploadChunkMeta) == 48,
              "UploadChunkMeta must be 48 bytes");

PDU* mkPDU(uint uiMsgLen=0);
#endif // PROTOCOL_H
