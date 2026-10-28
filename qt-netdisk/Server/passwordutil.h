#ifndef PASSWORDUTIL_H
#define PASSWORDUTIL_H
#include<QByteArray>

class PasswordUtil
{
public:
    static bool hashPassword(const QByteArray& password,QByteArray& outHash);//计算哈希密码
    static bool verifyPassword(const QByteArray& password,QByteArray& storeHash);//验证密码是否匹配数据库中的哈希
    PasswordUtil();
};

#endif // PASSWORDUTIL_H
